import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp, setDoc, doc as docRef,
} from 'firebase/firestore';
import { toast } from 'sonner';
import {
  Play, Pause, StopCircle, ArrowLeft, Camera, MapPin, Type as TypeIcon, Volume2, VolumeX, AlertCircle,
  Sun, X, RotateCcw, Trash2, Trophy,
} from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { RouteMap } from '../components/RouteMap';
import {
  ACTIVITY, classifyActivity, estimateCalories, haversineMeters, formatDuration,
  formatKm, formatPace, detectPersonalBest, compressImageToDataURL,
} from '../lib/fitness';
import { loadDraft, saveDraft, clearDraft, useWakeLock } from '../lib/liveTracking';
import { isChallengeActive } from '../lib/challenges';

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

        <div className="grid grid-cols-2 gap-2 mb-6 bg-muted/60 p-1.5 rounded-2xl" role="tablist">
          <TabButton active={tab === 'live'} onClick={() => setTab('live')} testId="tab-live" icon={MapPin} title="Live GPS" sub="Track as you move" />
          <TabButton active={tab === 'manual'} onClick={() => setTab('manual')} testId="tab-manual" icon={TypeIcon} title="Manual entry" sub="Type in distance & time" />
        </div>

        {tab === 'live'   && <LiveGPS   user={user} onSaved={() => navigate('/fitness')} />}
        {tab === 'manual' && <ManualLog user={user} onSaved={() => navigate('/fitness')} />}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, testId, icon: Icon, title, sub }) => (
  <button
    onClick={onClick}
    role="tab"
    aria-selected={active}
    data-testid={testId}
    className={`flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-colors ${
      active ? 'bg-white dark:bg-card shadow-md text-foreground ring-2 ring-emerald-500' : 'text-muted-foreground hover:bg-white/60 hover:text-foreground'
    }`}
  >
    <Icon className={`w-6 h-6 flex-shrink-0 ${active ? 'text-emerald-600' : ''}`} />
    <span>
      <span className="block text-base font-semibold">{title}</span>
      <span className="block text-xs text-muted-foreground">{sub}</span>
    </span>
  </button>
);

// =============================================================================
// LIVE GPS TRACKER
// =============================================================================
const MAX_ACCURACY_M = 50;   // readings less accurate than this are skipped
const MAX_SPEED_MS = 50;     // jumps faster than this are GPS noise
const GAP_SEC = 20;          // silence longer than this = signal gap (bridged, dashed)

const LiveGPS = ({ user, onSaved }) => {
  const [status, setStatus] = useState('idle');      // 'idle' | 'running' | 'paused' | 'stopped'
  const [error, setError] = useState('');
  const [signal, setSignal] = useState(null);         // { weak, accuracy }
  const [gapNotice, setGapNotice] = useState('');
  const [distance, setDistance] = useState(0);        // metres
  const [duration, setDuration] = useState(0);        // seconds
  const [audioCues, setAudioCues] = useState(() => localStorage.getItem(AUDIO_KEY) !== 'off');
  const [path, setPath] = useState([]);               // [{lat, lng, t, gap?}]
  const [currentSpeed, setCurrentSpeed] = useState(0);// m/s
  const [draft, setDraft] = useState(() => loadDraft());

  const watchRef = useRef(null);
  const startRef = useRef(null);
  const pausedElapsedRef = useRef(0);
  const lastKmMilestoneRef = useRef(0);
  const lastPointRef = useRef(null);
  const statusRef = useRef('idle');
  const pathRef = useRef([]);
  const distanceRef = useRef(0);
  const afterPauseRef = useRef(false);
  const restartTimerRef = useRef(null);

  const wakeLock = useWakeLock(status === 'running');

  const changeStatus = (s) => { statusRef.current = s; setStatus(s); };

  const elapsedNow = () =>
    pausedElapsedRef.current + (statusRef.current === 'running' ? (Date.now() - startRef.current) / 1000 : 0);

  const persist = () => {
    if (statusRef.current === 'idle') return;
    saveDraft({
      path: pathRef.current,
      distance: distanceRef.current,
      elapsed: elapsedNow(),
      status: statusRef.current,
    });
  };

  // Timer + autosave every 5s
  useEffect(() => {
    if (status === 'idle') return undefined;
    persist();
    if (status === 'stopped') return undefined;
    const tick = setInterval(() => setDuration(elapsedNow()), 500);
    const save = setInterval(persist, 5000);
    return () => { clearInterval(tick); clearInterval(save); };
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save when the tab hides; restart GPS when it comes back
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden') persist();
      else if (statusRef.current === 'running' || statusRef.current === 'paused') startWatch();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', persist);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', persist);
      persist();
      stopWatch();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Milestone chime every km
  useEffect(() => {
    const km = Math.floor(distance / 1000);
    if (km > lastKmMilestoneRef.current) {
      lastKmMilestoneRef.current = km;
      if (audioCues && km > 0) speak(`${km} kilometer${km > 1 ? 's' : ''}. Keep going.`);
    }
  }, [distance, audioCues]);

  const addPoint = (p, metres) => {
    pathRef.current = [...pathRef.current, p];
    distanceRef.current += metres;
    lastPointRef.current = p;
    setPath(pathRef.current);
    setDistance(distanceRef.current);
  };

  const onPosition = (pos) => {
    if (statusRef.current !== 'running') return;
    const accuracy = pos.coords.accuracy || 0;
    setCurrentSpeed(Number.isFinite(pos.coords.speed) ? pos.coords.speed : 0);
    if (accuracy > MAX_ACCURACY_M) {
      setSignal({ weak: true, accuracy });
      return;
    }
    setSignal({ weak: false, accuracy });
    setError('');
    const p = { lat: pos.coords.latitude, lng: pos.coords.longitude, t: Date.now() };
    const last = lastPointRef.current;
    if (!last) { addPoint(p, 0); return; }
    if (afterPauseRef.current) {
      afterPauseRef.current = false;
      addPoint({ ...p, gap: 'pause' }, 0);
      return;
    }
    const dt = (p.t - last.t) / 1000;
    const d = haversineMeters(last, p);
    if (d > MAX_SPEED_MS * (dt + 1)) return;
    if (dt > GAP_SEC) {
      setGapNotice(`GPS was interrupted for ${formatDuration(dt)}. That stretch was bridged with a straight line (dashed on the map).`);
      addPoint({ ...p, gap: 'signal' }, d);
      return;
    }
    addPoint(p, d);
  };

  const onGeoError = (err) => {
    if (err.code === 1) {
      setError('Location permission was denied. Allow location access for this site and try again.');
      stopWatch();
      if (pathRef.current.length === 0) changeStatus('idle');
      else pause();
      return;
    }
    // Timeout / position unavailable: keep the session alive and retry.
    setSignal({ weak: true, accuracy: null });
    stopWatch();
    clearTimeout(restartTimerRef.current);
    restartTimerRef.current = setTimeout(() => {
      if (statusRef.current === 'running' || statusRef.current === 'paused') startWatch();
    }, 2000);
  };

  const startWatch = () => {
    stopWatch();
    watchRef.current = navigator.geolocation.watchPosition(
      onPosition, onGeoError,
      { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 },
    );
  };

  const stopWatch = () => {
    clearTimeout(restartTimerRef.current);
    if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  };

  const resetSession = () => {
    pathRef.current = [];
    distanceRef.current = 0;
    lastPointRef.current = null;
    afterPauseRef.current = false;
    pausedElapsedRef.current = 0;
    lastKmMilestoneRef.current = 0;
    setPath([]);
    setDistance(0);
    setDuration(0);
    setSignal(null);
    setGapNotice('');
    setError('');
  };

  const start = () => {
    setError('');
    if (!('geolocation' in navigator)) {
      setError('This browser does not support GPS. Use manual entry instead.');
      return;
    }
    clearDraft();
    setDraft(null);
    resetSession();
    startRef.current = Date.now();
    changeStatus('running');
    startWatch();
    if (audioCues) speak('Session started. Go.');
  };

  const pause = () => {
    if (statusRef.current !== 'running') return;
    pausedElapsedRef.current += (Date.now() - startRef.current) / 1000;
    afterPauseRef.current = true;
    changeStatus('paused');
    if (audioCues) speak('Paused.');
  };

  const resume = () => {
    if (statusRef.current !== 'paused') return;
    startRef.current = Date.now();
    changeStatus('running');
    if (watchRef.current == null) startWatch();
    if (audioCues) speak('Resumed.');
  };

  const stop = () => {
    if (statusRef.current === 'running') {
      pausedElapsedRef.current += (Date.now() - startRef.current) / 1000;
    }
    setDuration(pausedElapsedRef.current);
    stopWatch();
    changeStatus('stopped');
    if (audioCues) speak('Session complete.');
  };

  const discard = () => {
    stopWatch();
    clearDraft();
    resetSession();
    changeStatus('idle');
  };

  // Restore an unfinished session saved before a reload / tab kill.
  const restoreDraft = (finish) => {
    const d = draft;
    setDraft(null);
    resetSession();
    pathRef.current = d.path;
    distanceRef.current = d.distance || 0;
    lastPointRef.current = d.path[d.path.length - 1] || null;
    lastKmMilestoneRef.current = Math.floor(distanceRef.current / 1000);
    const wasRunning = d.status === 'running';
    pausedElapsedRef.current = (d.elapsed || 0) + (wasRunning && !finish ? (Date.now() - d.savedAt) / 1000 : 0);
    setPath(d.path);
    setDistance(distanceRef.current);
    setDuration(pausedElapsedRef.current);
    if (finish || d.status === 'stopped') { changeStatus('stopped'); return; }
    if (wasRunning) {
      startRef.current = Date.now();
      changeStatus('running');
    } else {
      afterPauseRef.current = true;
      changeStatus('paused');
    }
    startWatch();
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
      {draft && status === 'idle' && (
        <DraftBanner draft={draft} onResume={() => restoreDraft(false)} onFinish={() => restoreDraft(true)} onDiscard={() => { clearDraft(); setDraft(null); }} />
      )}

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
        {status === 'running' && signal && !signal.weak && (
          <p className="text-[11px] text-center text-muted-foreground mt-4" data-testid="gps-accuracy">
            GPS accuracy ±{Math.round(signal.accuracy)} m{currentSpeed > 0 ? ` · ${(currentSpeed * 3.6).toFixed(1)} km/h` : ''}
          </p>
        )}
      </div>

      {/* Live path map */}
      <RouteMap points={path} live={status === 'running' || status === 'paused'} height={280} />

      {status === 'running' && signal?.weak && (
        <Notice tone="amber" testId="gps-weak-warning">
          {signal.accuracy
            ? `Weak GPS signal (±${Math.round(signal.accuracy)} m). Readings are skipped until accuracy improves; the gap will be bridged.`
            : 'Searching for GPS signal… tracking continues and the gap will be bridged once it returns.'}
        </Notice>
      )}

      {gapNotice && (status === 'running' || status === 'paused') && (
        <Notice tone="sky" testId="gps-gap-notice" onClose={() => setGapNotice('')}>{gapNotice}</Notice>
      )}

      {status === 'running' && (
        wakeLock === 'on' ? (
          <p className="text-xs text-emerald-700 flex items-center gap-1.5 justify-center" data-testid="wake-lock-status">
            <Sun className="w-3.5 h-3.5" /> Screen will stay on while tracking
          </p>
        ) : (
          <Notice tone="amber" testId="wake-lock-status">
            Keep this screen open and unlocked. Your browser can't keep it awake automatically, and locking the phone pauses GPS.
          </Notice>
        )
      )}

      {status === 'idle' && !draft && (
        <p className="text-xs text-muted-foreground text-center" data-testid="gps-tip">
          Tip: web browsers can't track GPS in the background. Keep this page open; we'll keep the screen awake and auto-save as you go.
        </p>
      )}

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
        <>
          <SaveForm
            user={user}
            initial={{
              mode: 'gps',
              distanceKm,
              durationSec: duration,
              activity: auto,
              path,
            }}
            onSaved={() => { clearDraft(); onSaved && onSaved(); }}
          />
          <button onClick={discard} className="text-xs text-muted-foreground hover:text-red-600 flex items-center gap-1.5 mx-auto" data-testid="discard-session-btn">
            <Trash2 className="w-3.5 h-3.5" /> Discard this session
          </button>
        </>
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

const NOTICE_TONES = {
  amber: 'bg-amber-50 border-amber-200 text-amber-900',
  sky: 'bg-sky-50 border-sky-200 text-sky-900',
};

const Notice = ({ tone, testId, onClose, children }) => (
  <div className={`rounded-xl border p-3 flex gap-2 items-start ${NOTICE_TONES[tone]}`} data-testid={testId}>
    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
    <p className="text-sm flex-1">{children}</p>
    {onClose && (
      <button onClick={onClose} className="opacity-60 hover:opacity-100" data-testid={`${testId}-close`} aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

const DraftBanner = ({ draft, onResume, onFinish, onDiscard }) => {
  const mins = Math.max(0, Math.round((Date.now() - draft.savedAt) / 60000));
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-3" data-testid="resume-draft-banner">
      <div className="flex gap-2 items-start">
        <RotateCcw className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-emerald-900">
          Unfinished session found: <strong>{formatKm(draft.distance || 0)}</strong> in {formatDuration(draft.elapsed || 0)},
          last saved {mins === 0 ? 'just now' : `${mins} min ago`}.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={onResume} className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm" data-testid="resume-draft-btn">Resume</button>
        <button onClick={onFinish} className="py-2 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-800 text-sm" data-testid="finish-draft-btn">Finish & save</button>
        <button onClick={onDiscard} className="py-2 rounded-xl border border-border bg-white hover:bg-red-50 text-muted-foreground text-sm" data-testid="discard-draft-btn">Discard</button>
      </div>
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

// Copy a GPS-free summary into each selected team's sessions subcollection.
const shareWithTeams = async (sessionId, s) => {
  const summary = {
    userId: s.userId, userName: s.userName, userPhotoURL: s.userPhotoURL, name: s.name,
    activity: s.activity, mode: s.mode, distanceKm: s.distanceKm, durationSec: s.durationSec,
    avgPaceMinPerKm: s.avgPaceMinPerKm, calories: s.calories, startedAt: s.startedAt,
    personalBest: s.personalBest, createdAt: s.createdAt,
  };
  const results = await Promise.allSettled(
    s.teamIds.map((tid) => setDoc(docRef(db, 'fitness_teams', tid, 'sessions', sessionId), summary)),
  );
  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length) {
    console.error('Sharing with teams failed:', failed.map((r) => r.reason));
    toast.error('Session saved, but sharing with your team failed. Check that the latest Firestore rules are published.');
  }
};

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
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTeams(list);
        setSelectedTeams(list.filter((t) => (t.challenges || []).some(isChallengeActive)).map((t) => t.id));
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
        path: (initial.path || [])
          .filter((p, i, arr) => arr.length < 200 || p.gap || i === arr.length - 1 || i % Math.ceil(arr.length / 200) === 0)
          .map((p) => (p.gap ? { lat: p.lat, lng: p.lng, t: p.t, gap: p.gap } : { lat: p.lat, lng: p.lng, t: p.t })),
      };
      const ref = await addDoc(collection(db, 'fitness_sessions'), doc);
      await shareWithTeams(ref.id, doc);
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
              >{t.name}{(t.challenges || []).some(isChallengeActive) && <Trophy className="inline w-3 h-3 ml-1.5 -mt-0.5 text-amber-500" />}</button>
            ))}
          </div>
          {teams.some((t) => selectedTeams.includes(t.id) && (t.challenges || []).some(isChallengeActive)) && (
            <p className="text-xs text-muted-foreground mt-1.5" data-testid="counts-toward-challenge">
              Counts toward: {teams.filter((t) => selectedTeams.includes(t.id)).flatMap((t) => (t.challenges || []).filter(isChallengeActive).map((c) => c.name)).join(', ')}
            </p>
          )}
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
