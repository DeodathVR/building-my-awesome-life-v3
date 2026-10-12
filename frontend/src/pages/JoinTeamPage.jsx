import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Users, Trophy, AlertCircle, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const JoinTeamPage = () => {
  const { teamId, code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | member | invalid
  const [joining, setJoining] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'fitness_teams', teamId));
        if (!snap.exists() || snap.data().inviteCode !== code) { setState('invalid'); return; }
        const t = { id: snap.id, ...snap.data() };
        setTeam(t);
        setState((t.memberIds || []).includes(user.uid) ? 'member' : 'ready');
      } catch (e) {
        console.error('Loading invite failed:', e);
        setState('invalid');
      }
    })();
  }, [teamId, code, user.uid]);

  const join = async () => {
    setJoining(true);
    setErr('');
    try {
      const email = (user.email || '').toLowerCase();
      const update = {
        memberIds: arrayUnion(user.uid),
        [`memberProfiles.${user.uid}`]: { name: user.displayName || user.email },
        joinCode: code,
      };
      if (email && (team.memberEmails || []).includes(email)) update.memberEmails = arrayRemove(email);
      await updateDoc(doc(db, 'fitness_teams', teamId), update);
      navigate((team.challenges || []).length ? '/fitness/challenges' : '/fitness/teams', { replace: true });
    } catch (e) {
      setErr(e?.message || 'Could not join the team.');
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-6 py-16" data-testid="join-team-page">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center space-y-5">
        {state === 'loading' && <p className="text-muted-foreground" data-testid="join-loading">Checking your invite…</p>}

        {state === 'invalid' && (
          <div data-testid="join-invalid" className="space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h1 className="text-2xl font-serif">Invite link not valid</h1>
            <p className="text-sm text-muted-foreground">Ask your teammate to copy the invite link again from their Teams page.</p>
            <Link to="/fitness" className="inline-block text-emerald-700 hover:underline text-sm" data-testid="join-go-fitness">Go to Fitness</Link>
          </div>
        )}

        {(state === 'ready' || state === 'member') && team && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">You're invited to join</p>
              <h1 className="text-3xl font-serif mt-1" data-testid="join-team-name">{team.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{(team.memberIds || []).length} member{(team.memberIds || []).length === 1 ? '' : 's'}</p>
            </div>
            {(team.challenges || []).map((c) => (
              <p key={c.id} className="text-sm flex items-center justify-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> {c.name}</p>
            ))}
            {state === 'member' ? (
              <div className="space-y-3" data-testid="join-already-member">
                <p className="text-sm text-emerald-700 flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> You're already on this team.</p>
                <Link to="/fitness/teams" className="block w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" data-testid="join-open-teams">Open my teams</Link>
              </div>
            ) : (
              <button onClick={join} disabled={joining} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium disabled:opacity-60" data-testid="join-team-btn">
                {joining ? 'Joining…' : 'Join team'}
              </button>
            )}
            {err && <p className="text-sm text-red-600" data-testid="join-error">{err}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default JoinTeamPage;
