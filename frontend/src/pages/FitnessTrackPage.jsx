import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import {
  Play, Pause, StopCircle, ArrowLeft, Camera, MapPin, Type as TypeIcon, Volume2, VolumeX, AlertCircle,
} from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { RouteMap } from '../components/RouteMap';
import {
  ACTIVITY, classifyActivity, estimateCalories, haversineMeters, formatDuration,
  formatKm, formatPace, detectPersonalBest, compressImageToDataURL,
} from '../lib/fitness';

const WEIGHT_KEY = 'fitness_weight_kg';
const AUDIO_KEY = 'fitness_audio_cues';

const FitnessTrackPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('live');  // 'live' | 'manual'

  return (
    <div className="min-h-screen bg-background pb-24" data-testid="fitness-track-page">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/fitness')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          data-testid="back-to-fitness"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Fitness
        </button>

        <h1 className="text-3xl font-serif mb-6">Log a session</h1>

        <div className="flex gap-2 mb-6 bg-muted/50 p-1 rounded-xl w-fit" role="tablist">
          <TabButton active={tab === 'live'} onClick={() => setTab('live')} testId="tab-live"><MapPin className="w-4 h-4" />Live GPS</TabButton>
          <TabButton active={tab === 'manual'} onClick={() => setTab('manual')} testId="tab-manual"><TypeIcon className="w-4 h-4" />Manual entry</TabButton>
        </div>

        {tab === 'live'   && <LiveGPS   user={user} onSaved={() => navigate('/fitness')} />}
        {tab === 'manual' && <ManualLog user={user} onSaved={() => navigate('/fitness')} />}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children, testId }) => (
  <button
    onClick={onClick}
    data-testid={testId}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
      active ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    {children}
  </button>
);

// =============================================================================
// LIVE GPS TRACKER
// =============================================================================
const LiveGPS = ({ user, onSaved }) => {
  const [status, setStatus] = useState('idle');      // 'idle' | 'running' | 'paused' | 'stopped'
  const [error, setError] = useState('');
  const [distance, setDistance] = useState(0);        // metres
  const [duration, setDuration] = useState(0);        // seconds
  const [currentSpeed, setCurrentSpeed] = useState(0);// m/s
  const [audioCues, setAudioCues] = useState(() => localStorage.getItem(AUDIO_KEY) !== 'off');
  const [path, setPath] = useState([]);               // [{lat, lng, t}] – reactive, drives the map

  const watchRef = useRef(null);
  const startRef = useRef(null);
  const pausedElapsedRef = useRef(0);
  const lastKmMilestoneRef = useRef(0);
  const timerRef = useRef(null);
  const lastPointRef = useRef(null);   // for distance delta calc without needing a re-read of state

  // Timer
  useEffect(() => {
    if (status !== 'running') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      const elapsed = pausedElapsedRef.current + (Date.now() - startRef.current) / 1000;
      setDuration(elapsed);
    }, 500);
    return () => clearInterval(timerRef.current);
  }, [status]);

  // Milestone chime every km
  useEffect(() => {
    const km = Math.floor(distance / 1000);
    if (km > lastKmMilestoneRef.current) {
      lastKmMilestoneRef.current = km;
      if (audioCues && km > 0) speak(`${km} kilometer${km > 1 ? 's' : ''}. Keep going.`);
    }
  }, [distance, audioCues]);

  const start = () => {
    setError('');
    if (!('geolocation' in navigator)) {
      setError('This browser does not support GPS. Use manual entry instead.');
      return;
    }
    setPath([]);
    lastPointRef.current = null;
    setDistance(0);
    setDuration(0);
    pausedElapsedRef.current = 0;
    lastKmMilestoneRef.current = 0;
    startRef.current = Date.now();
    setStatus('running');
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude, t: Date.now() };
        setCurrentSpeed(pos.coords.speed || 0);
        const last = lastPointRef.current;
        if (last) {
          const d = haversineMeters(last, p);
          // Filter noise: ignore jumps larger than 50m/s or accuracy > 40m
          if (d < 50 * ((p.t - last.t) / 1000 + 1) && (pos.coords.accuracy || 0) < 50) {
            setDistance((prev) => prev + d);
            lastPointRef.current = p;
            setPath((prev) => [...prev, p]);
          }
        } else {
          lastPointRef.current = p;
          setPath((prev) => [...prev, p]);
        }
      },
      (err) => {
        setError(`GPS error: ${err.message}. Grant location permission and try again.`);
        stopWatch();
        setStatus('idle');
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );
    if (audioCues) speak('Session started. Go.');
  };

  const pause = () => {
    if (status !== 'running') return;
    pausedElapsedRef.current += (Date.now() - startRef.current) / 1000;
    setStatus('paused');
    if (audioCues) speak('Paused.');
  };

  const resume = () => {
    if (status !== 'paused') return;
    startRef.current = Date.now();
    setStatus('running');
    if (audioCues) speak('Resumed.');
  };

  const stopWatch = () => {
    if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  };

  const stop = () => {
    if (status === 'running') {
      pausedElapsedRef.current += (Date.now() - startRef.current) / 1000;
    }
    setDuration(pausedElapsedRef.current);
    stopWatch();
    setStatus('stopped');
    if (audioCues) speak('Session complete.');
  };

  const distanceKm = distance / 1000;
  const paceMinPerKm = distanceKm > 0 && duration > 0 ? (duration / 60) / distanceKm : 0;
  const auto = classifyActivity(paceMinPerKm);

  const toggleAudio = () => {
    const next = !audioCues;
    setAudioCues(next);
    localStorage.setItem(AUDIO_KEY, next ? 'on' : 'off');
  };

  return (
    <div className="space-y-4" data-testid="live-gps">
      {/* Live stats */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Distance</p>
          <p className="text-5xl font-serif" data-testid="live-distance">{distanceKm.toFixed(2)}
            <span className="text-lg text-muted-foreground ml-1">km</span></p>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-6 text-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Duration</p>
            <p className="text-xl font-serif" data-testid="live-duration">{formatDuration(duration)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Pace</p>
            <p className="text-xl font-serif">{formatPace(paceMinPerKm)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Activity</p>
            <p className="text-xl font-serif">{ACTIVITY[auto].emoji}</p>
          </div>
        </div>
      </div>

      {/* Live path map */}
      <RouteMap points={path} live={status === 'running' || status === 'paused'} height={280} />

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex gap-2 items-start" data-testid="gps-error">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Controls */}
      {status === 'idle' && (
        <button
          onClick={start}
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center gap-2 transition"
          data-testid="live-start"
        ><Play className="w-5 h-5 fill-white" /> Start</button>
      )}
      {status === 'running' && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={pause} className="py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-medium flex items-center justify-center gap-2" data-testid="live-pause">
            <Pause className="w-5 h-5 fill-white" /> Pause
          </button>
          <button onClick={stop} className="py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-medium flex items-center justify-center gap-2" data-testid="live-stop">
            <StopCircle className="w-5 h-5" /> Stop
          </button>
        </div>
      )}
      {status === 'paused' && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={resume} className="py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center gap-2" data-testid="live-resume">
            <Play className="w-5 h-5 fill-white" /> Resume
          </button>
          <button onClick={stop} className="py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-medium flex items-center justify-center gap-2" data-testid="live-stop-2">
            <StopCircle className="w-5 h-5" /> Stop
          </button>
        </div>
      )}
      {status === 'stopped' && (
        <SaveForm
          user={user}
          initial={{
            mode: 'gps',
            distanceKm,
            durationSec: duration,
            activity: auto,
            path,
          }}
          onSaved={onSaved}
        />
      )}

      {/* Audio-cue toggle */}
      <button
        onClick={toggleAudio}
        className="text-xs text-muted-foreground flex items-center gap-1.5 hover:text-foreground mx-auto"
        data-testid="toggle-audio"
      >
        {audioCues ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        Kilometer voice cues: {audioCues ? 'on' : 'off'}
      </button>
    </div>
  );
};

// =============================================================================
// MANUAL ENTRY
// =============================================================================
const ManualLog = ({ user, onSaved }) => {
  const [distanceKm, setDistanceKm] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [activity, setActivity] = useState('walk');
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));

  const durationSec = Math.max(0, Math.round(Number(durationMin) * 60));

  return (
    <div className="space-y-4" data-testid="manual-form">
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Distance (km)">
            <input
              type="number" inputMode="decimal" step="0.01" min="0"
              value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              placeholder="e.g. 3.5"
              data-testid="manual-distance"
            />
          </Field>
          <Field label="Duration (min)">
            <input
              type="number" inputMode="numeric" step="1" min="0"
              value={durationMin} onChange={(e) => setDurationMin(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              placeholder="e.g. 30"
              data-testid="manual-duration"
            />
          </Field>
        </div>
        <Field label="Activity">
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(ACTIVITY).map(([key, v]) => (
              <button
                key={key}
                onClick={() => setActivity(key)}
                className={`p-2 rounded-lg border text-sm transition ${
                  activity === key ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-border hover:bg-muted'
                }`}
                data-testid={`activity-${key}`}
              >
                <div className="text-lg">{v.emoji}</div>
                <div className="text-xs mt-1">{v.label}</div>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Date">
          <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            data-testid="manual-date" />
        </Field>
      </div>

      <SaveForm
        user={user}
        initial={{
          mode: 'manual',
          distanceKm: Number(distanceKm) || 0,
          durationSec,
          activity,
          startedAtOverride: new Date(`${dateStr}T09:00:00`),
        }}
        onSaved={onSaved}
        disabled={!(Number(distanceKm) > 0) || !(durationSec > 0)}
      />
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1.5">{label}</label>
    {children}
  </div>
);

// =============================================================================
// SAVE FORM — weight, photos, notes, teams, save button
// =============================================================================
const SaveForm = ({ user, initial, onSaved, disabled }) => {
  const [weightKg, setWeightKg] = useState(() => Number(localStorage.getItem(WEIGHT_KEY)) || 70);
  const [note, setNote] = useState('');
  const [name, setName] = useState(() => defaultSessionName(initial));
  const [photos, setPhotos] = useState([]); // dataURLs
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [teams, setTeams] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(query(
          collection(db, 'fitness_teams'),
          where('memberIds', 'array-contains', user.uid),
        ));
        setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (_) {
        // Firestore rules may not yet be deployed — silently show no teams.
        setTeams([]);
      }
    })();
  }, [user]);

  const distanceKm = initial.distanceKm || 0;
  const durationSec = initial.durationSec || 0;
  const paceMinPerKm = distanceKm > 0 && durationSec > 0 ? (durationSec / 60) / distanceKm : 0;
  const calories = estimateCalories({ activity: initial.activity, weightKg, durationSec });

  const addPhoto = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4 - photos.length);
    const dataURLs = await Promise.all(files.map((f) => compressImageToDataURL(f)));
    setPhotos((p) => [...p, ...dataURLs]);
    e.target.value = '';
  };

  const removePhoto = (idx) => setPhotos((p) => p.filter((_, i) => i !== idx));

  const toggleTeam = (id) =>
    setSelectedTeams((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setErrorMsg('');
    localStorage.setItem(WEIGHT_KEY, String(weightKg));
    try {
      // Detect PB against user's history
      let prev = [];
      try {
        const prevSnap = await getDocs(query(
          collection(db, 'fitness_sessions'),
          where('userId', '==', user.uid),
        ));
        prev = prevSnap.docs.map((d) => d.data());
      } catch (_) { /* rules not deployed yet — skip PB detection */ }
      const draftSession = {
        distanceKm, durationSec, avgPaceMinPerKm: paceMinPerKm,
      };
      const pb = detectPersonalBest(draftSession, prev);

      const startedAt = initial.startedAtOverride
        ? Timestamp.fromDate(initial.startedAtOverride)
        : Timestamp.fromMillis(Date.now() - durationSec * 1000);
      const endedAt = initial.startedAtOverride
        ? Timestamp.fromMillis(initial.startedAtOverride.getTime() + durationSec * 1000)
        : Timestamp.now();

      const doc = {
        userId: user.uid,
        userName: user.displayName || user.email || 'You',
        userPhotoURL: user.photoURL || null,
        name: (name || '').trim() || defaultSessionName(initial),
        startedAt, endedAt,
        durationSec,
        distanceKm,
        avgPaceMinPerKm: paceMinPerKm || null,
        avgSpeedKmh: durationSec > 0 ? (distanceKm / (durationSec / 3600)) : 0,
        activity: initial.activity,
        calories,
        weightKg: Number(weightKg),
        mode: initial.mode,
        photoURLs: photos,
        note: note.trim(),
        teamIds: selectedTeams,
        personalBest: pb,
        createdAt: serverTimestamp(),
        // Keep only a sampled subset of the path to stay well under the doc limit
        path: (initial.path || []).filter((_, i, arr) => arr.length < 200 || i % Math.ceil(arr.length / 200) === 0)
          .map((p) => ({ lat: p.lat, lng: p.lng, t: p.t })),
      };
      await addDoc(collection(db, 'fitness_sessions'), doc);
      onSaved && onSaved();
    } catch (err) {
      setErrorMsg(err?.message || 'Could not save the session. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <h2 className="font-serif text-lg">Save session</h2>

      {/* Session name */}
      <Field label="Session name">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="e.g. Morning Jog"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background"
          data-testid="session-name-input"
        />
      </Field>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 text-center py-2 border-y border-border">
        <Summary label="Distance" value={`${distanceKm.toFixed(2)} km`} />
        <Summary label="Duration" value={formatDuration(durationSec)} />
        <Summary label="Pace"     value={formatPace(paceMinPerKm)} />
        <Summary label="Calories" value={`${calories} kcal`} />
      </div>

      {/* Weight */}
      <Field label="Your weight (kg) — used for calorie estimate">
        <input
          type="number" inputMode="decimal" min="30" max="200" step="0.5"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background"
          data-testid="weight-input"
        />
      </Field>

      {/* Note */}
      <Field label="Note (optional)">
        <textarea
          value={note} onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background resize-none"
          placeholder="How did it feel?"
          maxLength={280}
          data-testid="note-input"
        />
      </Field>

      {/* Photos */}
      <Field label={`Photos (${photos.length}/4)`}>
        <div className="flex gap-2 flex-wrap">
          {photos.map((src, i) => (
            <div key={i} className="relative">
              <img src={src} alt="" className="w-16 h-16 rounded-lg object-cover" />
              <button onClick={() => removePhoto(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs">×</button>
            </div>
          ))}
          {photos.length < 4 && (
            <label className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted" data-testid="photo-picker">
              <Camera className="w-5 h-5 text-muted-foreground" />
              <input type="file" accept="image/*" multiple className="hidden" onChange={addPhoto} />
            </label>
          )}
        </div>
      </Field>

      {/* Share with teams */}
      {teams.length > 0 && (
        <Field label="Share with teams">
          <div className="flex flex-wrap gap-2">
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTeam(t.id)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  selectedTeams.includes(t.id)
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-border hover:bg-muted'
                }`}
                data-testid={`team-toggle-${t.id}`}
              >{t.name}</button>
            ))}
          </div>
        </Field>
      )}

      {errorMsg && (
        <p className="text-sm text-red-600" data-testid="save-error">{errorMsg}</p>
      )}
      <button
        onClick={save}
        disabled={saving || disabled}
        className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium transition"
        data-testid="save-session-btn"
      >{saving ? 'Saving…' : 'Save session'}</button>
    </div>
  );
};

const Summary = ({ label, value }) => (
  <div>
    <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
    <p className="text-sm font-medium mt-0.5">{value}</p>
  </div>
);

// Suggest a session name from time-of-day + activity, e.g. "Morning Jog".
function defaultSessionName(initial) {
  const started = initial?.startedAtOverride || new Date();
  const h = started.getHours();
  const tod = h < 5 ? 'Late Night'
    : h < 12 ? 'Morning'
    : h < 17 ? 'Afternoon'
    : h < 21 ? 'Evening'
    : 'Night';
  const label = (ACTIVITY[initial?.activity]?.label) || 'Session';
  return `${tod} ${label}`;
}

// =============================================================================
// Text-to-speech helper (silently no-op on unsupported browsers)
// =============================================================================
function speak(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    u.volume = 0.9;
    window.speechSynthesis.speak(u);
  } catch (_) { /* no-op */ }
}

export default FitnessTrackPage;
