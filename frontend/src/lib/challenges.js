import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const DAY_MS = 24 * 60 * 60 * 1000;

export const startOfDayMs = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

const sessionMs = (s) => (s.startedAt?.toMillis ? s.startedAt.toMillis() : new Date(s.startedAt).getTime());

export const challengeWindow = (c) => {
  const start = c.startDate;
  const end = start + c.durationDays * DAY_MS;
  const now = Date.now();
  const dayNumber = Math.min(c.durationDays, Math.max(0, Math.floor((now - start) / DAY_MS) + 1));
  return {
    start, end,
    dayNumber,
    daysLeft: Math.max(0, Math.ceil((end - now) / DAY_MS)),
    upcoming: now < start,
    ended: now >= end,
    elapsedFrac: Math.min(1, Math.max(0, (now - start) / (end - start))),
  };
};

export const isChallengeActive = (c) => {
  const w = challengeWindow(c);
  return !w.upcoming && !w.ended;
};

// Members' km within the challenge window, ranked, plus team totals and on-pace target.
export const challengeProgress = (challenge, team, sessions) => {
  const w = challengeWindow(challenge);
  const profiles = team.memberProfiles || {};
  const byUser = {};
  for (const uid of team.memberIds || []) {
    byUser[uid] = { userId: uid, name: profiles[uid]?.name || null, km: 0, count: 0 };
  }
  for (const s of sessions) {
    const t = sessionMs(s);
    if (t < w.start || t >= w.end) continue;
    if (!byUser[s.userId]) byUser[s.userId] = { userId: s.userId, name: null, km: 0, count: 0 };
    const m = byUser[s.userId];
    m.km += s.distanceKm || 0;
    m.count += 1;
    if (!m.name) m.name = s.userName;
  }
  const members = Object.values(byUser).sort((a, b) => b.km - a.km);
  const totalKm = members.reduce((sum, m) => sum + m.km, 0);
  const individual = challenge.goalType === 'individual';
  const targetKm = individual ? challenge.goalKm * Math.max(1, members.length) : challenge.goalKm;
  const memberGoal = individual ? challenge.goalKm : challenge.goalKm / Math.max(1, members.length);
  return {
    ...w,
    individual,
    members: members.map((m) => ({ ...m, pct: Math.min(100, (m.km / memberGoal) * 100), done: individual && m.km >= memberGoal })),
    memberGoal,
    totalKm,
    targetKm,
    pct: Math.min(100, (totalKm / targetKm) * 100),
    expectedKm: targetKm * w.elapsedFrac,
    kmPerDayNeeded: w.daysLeft > 0 ? Math.max(0, targetKm - totalKm) / w.daysLeft : 0,
  };
};

// Live sessions shared with each team: { [teamId]: session[] }
export const useTeamSessions = (teamIds) => {
  const [byTeam, setByTeam] = useState({});
  const key = teamIds.slice().sort().join(',');
  useEffect(() => {
    if (!key) { setByTeam({}); return undefined; }
    const unsubs = key.split(',').map((teamId) => onSnapshot(
      query(collection(db, 'fitness_sessions'), where('teamIds', 'array-contains', teamId)),
      (snap) => setByTeam((prev) => ({ ...prev, [teamId]: snap.docs.map((d) => ({ id: d.id, ...d.data() })) })),
      () => setByTeam((prev) => ({ ...prev, [teamId]: [] })),
    ));
    return () => unsubs.forEach((u) => u());
  }, [key]);
  return byTeam;
};

// Live teams the user belongs to
export const useMyTeams = (user) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) { setLoading(false); return undefined; }
    return onSnapshot(
      query(collection(db, 'fitness_teams'), where('memberIds', 'array-contains', user.uid)),
      (snap) => { setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
      () => { setTeams([]); setLoading(false); },
    );
  }, [user]);
  return { teams, loading };
};

// Flatten every team's challenges into [{ challenge, team }]
export const listChallenges = (teams) =>
  teams.flatMap((team) => (team.challenges || []).map((challenge) => ({ challenge, team })))
    .sort((a, b) => b.challenge.startDate - a.challenge.startDate);
