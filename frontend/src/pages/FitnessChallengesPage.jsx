import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ArrowLeft, Plus, Trophy, X } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { ChallengeCard } from '../components/ChallengeCard';
import { useMyTeams, useTeamSessions, listChallenges, startOfDayMs } from '../lib/challenges';
import { makeInviteCode } from '../lib/fitness';

const PRESETS = [
  { label: '100 km in 100 days', name: '100 km in 100 days', goalKm: 100, durationDays: 100, goalType: 'individual' },
  { label: '50 km in 30 days', name: '50 km in 30 days', goalKm: 50, durationDays: 30, goalType: 'individual' },
  { label: 'Team 500 km in 60 days', name: 'Team 500 km', goalKm: 500, durationDays: 60, goalType: 'team' },
];

const FitnessChallengesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { teams, loading } = useMyTeams(user);
  const [showCreate, setShowCreate] = useState(false);
  const items = listChallenges(teams);
  const sessionsByTeam = useTeamSessions([...new Set(items.map((i) => i.team.id))]);

  const remove = async (team, challenge) => {
    if (!window.confirm(`Delete "${challenge.name}"? Logged sessions are kept.`)) return;
    await updateDoc(doc(db, 'fitness_teams', team.id), {
      challenges: (team.challenges || []).filter((c) => c.id !== challenge.id),
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24" data-testid="fitness-challenges-page">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/fitness')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4" data-testid="back-to-fitness">
          <ArrowLeft className="w-4 h-4" /> Back to Fitness
        </button>

        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-serif">Challenges</h1>
            <p className="text-sm text-muted-foreground mt-1">Set a distance goal with your team and chase it together.</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm flex-shrink-0" data-testid="create-challenge-btn">
            <Plus className="w-4 h-4" /> New challenge
          </button>
        </div>

        {showCreate && <CreateChallengeForm user={user} teams={teams} onClose={() => setShowCreate(false)} />}

        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && items.length === 0 && !showCreate && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center" data-testid="challenges-empty">
            <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <p className="text-muted-foreground">No challenges yet. Start a “100 km in 100 days” with your team.</p>
          </div>
        )}

        <div className="space-y-4">
          {items.map(({ challenge, team }) => (
            <ChallengeCard
              key={`${team.id}-${challenge.id}`}
              challenge={challenge} team={team} user={user}
              sessions={sessionsByTeam[team.id] || []}
              onDelete={(c) => remove(team, c)}
            />
          ))}
        </div>

        {items.length > 0 && (
          <p className="text-xs text-muted-foreground mt-6 text-center">
            Only sessions shared with the team count. When you save a session, teams with an active challenge are ticked automatically.
          </p>
        )}
      </div>
    </div>
  );
};

const CreateChallengeForm = ({ user, teams, onClose }) => {
  const ownTeams = teams.filter((t) => t.createdBy === user.uid);
  const [teamId, setTeamId] = useState(ownTeams[0]?.id || '');
  const [name, setName] = useState(PRESETS[0].name);
  const [goalKm, setGoalKm] = useState(PRESETS[0].goalKm);
  const [durationDays, setDurationDays] = useState(PRESETS[0].durationDays);
  const [goalType, setGoalType] = useState(PRESETS[0].goalType);
  const [startStr, setStartStr] = useState(new Date().toLocaleDateString('en-CA'));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const applyPreset = (p) => { setName(p.name); setGoalKm(p.goalKm); setDurationDays(p.durationDays); setGoalType(p.goalType); };

  const create = async () => {
    setErr('');
    if (!teamId) { setErr('Pick a team.'); return; }
    if (!name.trim() || !(Number(goalKm) > 0) || !(Number(durationDays) > 0)) { setErr('Name, goal and duration are required.'); return; }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'fitness_teams', teamId), {
        challenges: arrayUnion({
          id: makeInviteCode(),
          name: name.trim(),
          goalKm: Number(goalKm),
          durationDays: Math.round(Number(durationDays)),
          goalType,
          startDate: startOfDayMs(`${startStr}T00:00:00`),
          createdBy: user.uid,
          createdAt: Date.now(),
        }),
      });
      onClose();
    } catch (e) {
      setErr(e?.message || 'Could not create the challenge.');
    } finally {
      setSaving(false);
    }
  };

  if (ownTeams.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 mb-6 text-sm" data-testid="create-challenge-form">
        <div className="flex justify-between items-start gap-3">
          <p className="text-muted-foreground">Challenges are set up by a team's creator. <Link to="/fitness/teams" className="text-emerald-700 underline" data-testid="go-create-team">Create a team</Link> first, then come back.</p>
          <button onClick={onClose} className="text-muted-foreground" data-testid="create-challenge-close"><X className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  const input = 'w-full px-3 py-2 rounded-lg border border-border bg-background';
  return (
    <div className="rounded-2xl border border-border bg-card p-5 mb-6 space-y-4" data-testid="create-challenge-form">
      <div className="flex justify-between items-center">
        <h3 className="font-serif text-lg">New challenge</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground" data-testid="create-challenge-close"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p, i) => (
          <button key={p.label} onClick={() => applyPreset(p)} className="px-3 py-1.5 rounded-full border border-border text-xs hover:bg-emerald-50 hover:border-emerald-300" data-testid={`challenge-preset-${i}`}>{p.label}</button>
        ))}
      </div>
      <Field label="Team">
        <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className={input} data-testid="challenge-team-select">
          {ownTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </Field>
      <Field label="Challenge name">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={input} data-testid="challenge-name-input" />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Goal (km)"><input type="number" min="1" value={goalKm} onChange={(e) => setGoalKm(e.target.value)} className={input} data-testid="challenge-goal-input" /></Field>
        <Field label="Days"><input type="number" min="1" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} className={input} data-testid="challenge-days-input" /></Field>
        <Field label="Starts"><input type="date" value={startStr} onChange={(e) => setStartStr(e.target.value)} className={input} data-testid="challenge-start-input" /></Field>
      </div>
      <Field label="Goal applies to">
        <div className="grid grid-cols-2 gap-2">
          {[['individual', 'Each member'], ['team', 'Whole team combined']].map(([k, label]) => (
            <button key={k} onClick={() => setGoalType(k)} className={`py-2 rounded-lg border text-sm ${goalType === k ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-border hover:bg-muted'}`} data-testid={`challenge-type-${k}`}>{label}</button>
          ))}
        </div>
      </Field>
      {err && <p className="text-sm text-red-600" data-testid="challenge-error">{err}</p>}
      <button onClick={create} disabled={saving} className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60" data-testid="create-challenge-submit">
        {saving ? 'Creating…' : 'Create challenge'}
      </button>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1.5">{label}</label>
    {children}
  </div>
);

export default FitnessChallengesPage;
