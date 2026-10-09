import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  collection, query, where, orderBy, onSnapshot,
} from 'firebase/firestore';
import { Play, Plus, Users, TrendingUp, Flame, MapPin, Award, ChevronRight, Trophy } from 'lucide-react';
import { ChallengeCard } from '../components/ChallengeCard';
import { listChallenges, isChallengeActive, useTeamSessions } from '../lib/challenges';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { RouteMap } from '../components/RouteMap';
import { KmSplits } from '../components/KmSplits';
import fitnessHero from '../assets/fitness-hero.png';
import {
  ACTIVITY,
  formatDuration,
  formatKm,
  formatPace,
  weeklyTotals,
  pickQuoteOfDay,
} from '../lib/fitness';

// -----------------------------------------------------------------------------
const FitnessPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const quote = pickQuoteOfDay();

  // Live-load the user's sessions (most recent first)
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const q = query(
      collection(db, 'fitness_sessions'),
      where('userId', '==', user.uid),
      orderBy('startedAt', 'desc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => { setSessions([]); setLoading(false); });
    return unsub;
  }, [user]);

  // Live-load teams the user belongs to
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'fitness_teams'),
      where('memberIds', 'array-contains', user.uid),
    );
    const unsub = onSnapshot(q, (snap) => {
      setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, () => setTeams([]));
    return unsub;
  }, [user]);

  const weekly = useMemo(() => weeklyTotals(sessions, 7), [sessions]);
  const monthly = useMemo(() => weeklyTotals(sessions, 30), [sessions]);
  const bestDistance = useMemo(() => Math.max(0, ...sessions.map((s) => s.distanceKm || 0)), [sessions]);
  const bestDurationSec = useMemo(() => Math.max(0, ...sessions.map((s) => s.durationSec || 0)), [sessions]);
  const challenges = listChallenges(teams);
  const activeChallenges = challenges.filter(({ challenge }) => isChallengeActive(challenge));
  const sessionsByTeam = useTeamSessions([...new Set(activeChallenges.map(({ team }) => team.id))]);

  return (
    <div className="min-h-screen bg-background" data-testid="fitness-page">
      {/* Hero */}
      <div
        className="relative w-full h-64 md:h-80 overflow-hidden"
        style={{
          backgroundImage: `url(${fitnessHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }}
        data-testid="fitness-hero"
      >
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(15,25,40,0.25) 0%, rgba(15,25,40,0.15) 45%, rgba(15,25,40,0.6) 100%)',
        }} />
        <div className="relative z-10 h-full max-w-6xl mx-auto px-6 flex flex-col justify-end pb-8">
          <p className="text-white/80 text-sm tracking-widest uppercase mb-2">Fitness</p>
          <h1 className="text-white text-3xl md:text-5xl font-serif font-light leading-tight">
            {quote.q}
          </h1>
          <p className="text-white/70 text-sm mt-2 italic">{quote.a}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Primary actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/fitness/track"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 shadow-md hover:shadow-xl transition-all"
            data-testid="start-session-cta"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition">
                <Play className="w-7 h-7 fill-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Start a session</h3>
                <p className="text-white/85 text-sm">Live GPS tracking or manual log</p>
              </div>
            </div>
          </Link>
          <Link
            to="/fitness/teams"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white p-6 shadow-md hover:shadow-xl transition-all"
            data-testid="teams-cta"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {teams.length ? `My teams (${teams.length})` : 'Create a team'}
                </h3>
                <p className="text-white/85 text-sm">
                  {teams.length ? 'Leaderboards + shared sessions' : 'Invite friends by email'}
                </p>
              </div>
            </div>
          </Link>
          <Link
            to="/fitness/challenges"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 text-white p-6 shadow-md hover:shadow-xl transition-all"
            data-testid="challenges-cta"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {challenges.length ? `Challenges (${challenges.length})` : 'Start a challenge'}
                </h3>
                <p className="text-white/85 text-sm">e.g. 100 km in 100 days</p>
              </div>
            </div>
          </Link>
        </div>

        {activeChallenges.length > 0 && (
          <section data-testid="active-challenges">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-serif">Active challenges</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChallenges.map(({ challenge, team }) => (
                <ChallengeCard key={`${team.id}-${challenge.id}`} challenge={challenge} team={team} user={user} sessions={sessionsByTeam[team.id] || []} compact />
              ))}
            </div>
          </section>
        )}

        {/* Weekly / monthly stats */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-serif">This week</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Sessions" value={weekly.count} data-testid="stat-week-count" />
            <StatCard label="Distance" value={weekly.totalKm.toFixed(2)} unit="km" data-testid="stat-week-km" />
            <StatCard label="Duration" value={formatDuration(weekly.totalSec)} data-testid="stat-week-duration" />
            <StatCard
              label="Calories" value={weekly.totalCal} unit="kcal"
              icon={<Flame className="w-3.5 h-3.5 text-orange-500" />}
              data-testid="stat-week-cal"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Last 30 days: {monthly.count} sessions · {monthly.totalKm.toFixed(1)} km · {monthly.totalCal} kcal</p>
        </section>

        {/* Personal bests */}
        {sessions.length > 0 && (
          <section data-testid="personal-bests">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-serif">Personal bests</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <StatCard label="Longest distance" value={bestDistance.toFixed(2)} unit="km" />
              <StatCard label="Longest session" value={formatDuration(bestDurationSec)} />
            </div>
          </section>
        )}

        {/* Recent sessions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-serif flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Recent sessions
            </h2>
            <Link to="/fitness/track" className="text-xs text-emerald-600 flex items-center gap-1 hover:underline">
              <Plus className="w-3 h-3" /> Log a session
            </Link>
          </div>

          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && sessions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground text-sm">No sessions yet.</p>
              <Link
                to="/fitness/track"
                className="mt-3 inline-flex items-center gap-2 text-emerald-600 hover:underline text-sm"
                data-testid="empty-log-cta"
              >
                <Play className="w-3 h-3 fill-current" /> Start your first session
              </Link>
            </div>
          )}
          <div className="space-y-3">
            {sessions.slice(0, 10).map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
const StatCard = ({ label, value, unit, icon, ...rest }) => (
  <div className="rounded-2xl border border-border bg-card p-4" {...rest}>
    <p className="text-xs text-muted-foreground flex items-center gap-1.5">{icon}{label}</p>
    <p className="text-2xl font-serif mt-1">
      {value}
      {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
    </p>
  </div>
);

// -----------------------------------------------------------------------------
const SessionCard = ({ session }) => {
  const act = ACTIVITY[session.activity] || ACTIVITY.walk;
  const started = session.startedAt?.toDate ? session.startedAt.toDate() : new Date(session.startedAt);
  const dateStr = started.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const timeStr = started.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" data-testid="session-card">
      <div className="p-4 flex gap-4">
        <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-2xl">
          {act.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium truncate">
              {session.name || act.label}
            </h3>
            {session.name && (
              <span className="text-xs text-muted-foreground">· {act.label}</span>
            )}
            {session.personalBest && (
              <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded" data-testid="pb-badge">
                🏆 {session.personalBest.label}
              </span>
            )}
            {session.mode === 'gps' && (
              <span className="text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">GPS</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{dateStr} · {timeStr}</p>
          <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
            <div><span className="font-medium">{(session.distanceKm || 0).toFixed(2)}</span> <span className="text-xs text-muted-foreground">km</span></div>
            <div><span className="font-medium">{formatDuration(session.durationSec)}</span></div>
            <div><span className="font-medium">{formatPace(session.avgPaceMinPerKm)}</span></div>
            <div><span className="font-medium">{session.calories || 0}</span> <span className="text-xs text-muted-foreground">kcal</span></div>
          </div>
          {session.note && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{session.note}</p>}
        </div>
      </div>

      {/* GPS route preview + km splits */}
      {session.path && session.path.length > 1 && (
        <div className="px-4 pb-4">
          <RouteMap points={session.path} height={180} />
          <KmSplits path={session.path} />
        </div>
      )}

      {session.photoURLs && session.photoURLs.length > 0 && (
        <div className="flex gap-1 px-4 pb-4 overflow-x-auto" data-testid="session-photos">
          {session.photoURLs.map((url, i) => (
            <img key={i} src={url} alt="" className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
          ))}
        </div>
      )}
    </div>
  );
};

export default FitnessPage;
