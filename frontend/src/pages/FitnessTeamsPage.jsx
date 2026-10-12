import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, addDoc, doc, updateDoc, getDocs, query, where, onSnapshot,
  serverTimestamp, arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { ArrowLeft, Users, Plus, Mail, X, Trophy, MapPin, CheckCircle2 } from 'lucide-react';
import { InviteLinkBox } from '../components/InviteLinkBox';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { ACTIVITY, formatDuration, makeInviteCode, sortByStartDesc } from '../lib/fitness';

const FitnessTeamsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myTeams, setMyTeams] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [justCreated, setJustCreated] = useState(null);

  // Live: teams I'm a member of
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'fitness_teams'), where('memberIds', 'array-contains', user.uid));
    return onSnapshot(q, (snap) => setMyTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => { console.error('Loading teams failed:', err); setMyTeams([]); });
  }, [user]);

  // Live: teams that invited my email but I haven't accepted yet
  useEffect(() => {
    if (!user?.email) return;
    const q = query(collection(db, 'fitness_teams'), where('memberEmails', 'array-contains', user.email.toLowerCase()));
    return onSnapshot(q, (snap) => {
      setPendingInvites(snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => !(t.memberIds || []).includes(user.uid)));
    }, (err) => { console.error('Loading invites failed:', err); setPendingInvites([]); });
  }, [user]);

  const acceptInvite = async (team) => {
    await updateDoc(doc(db, 'fitness_teams', team.id), {
      memberIds: arrayUnion(user.uid),
      memberEmails: arrayRemove(user.email.toLowerCase()),
      [`memberProfiles.${user.uid}`]: { name: user.displayName || user.email },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24" data-testid="fitness-teams-page">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/fitness')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          data-testid="back-to-fitness"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Fitness
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif">Teams</h1>
            <p className="text-sm text-muted-foreground mt-1">Move together. Cheer each other on.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
            data-testid="create-team-btn"
          ><Plus className="w-4 h-4" /> Create team</button>
        </div>

        {pendingInvites.length > 0 && (
          <section className="mb-8" data-testid="pending-invites">
            <h2 className="text-lg font-serif mb-3 flex items-center gap-2"><Mail className="w-4 h-4" /> Pending invites</h2>
            <div className="space-y-2">
              {pendingInvites.map((t) => (
                <div key={t.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-amber-800">{(t.memberIds || []).length} member{(t.memberIds || []).length === 1 ? '' : 's'}</p>
                  </div>
                  <button
                    onClick={() => acceptInvite(t)}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm"
                    data-testid={`accept-invite-${t.id}`}
                  >Join</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {showCreate && (
          <CreateTeamForm user={user} onClose={() => setShowCreate(false)} onCreated={(t) => { setShowCreate(false); setJustCreated(t); }} />
        )}

        {justCreated && <CreatedBanner team={justCreated} onClose={() => setJustCreated(null)} />}

        <section>
          <h2 className="text-lg font-serif mb-3">Your teams</h2>
          {myTeams.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">You aren't on a team yet. Create one and invite your run/walk buddies.</p>
            </div>
          )}
          <div className="space-y-4">
            {myTeams.map((t) => <TeamCard key={t.id} team={t} user={user} />)}
          </div>
        </section>
      </div>
    </div>
  );
};

// =============================================================================
const CreateTeamForm = ({ user, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [emailsRaw, setEmailsRaw] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const create = async () => {
    setErr('');
    const trimmed = name.trim();
    if (!trimmed) { setErr('Team name is required.'); return; }
    setSaving(true);
    try {
      const emails = emailsRaw
        .split(/[,\s\n]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => /.+@.+\..+/.test(e));
      const inviteCode = makeInviteCode();
      const ref = await addDoc(collection(db, 'fitness_teams'), {
        name: trimmed,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        memberIds: [user.uid],
        memberProfiles: { [user.uid]: { name: user.displayName || user.email } },
        memberEmails: emails,
        inviteCode,
      });
      onCreated({ id: ref.id, name: trimmed, inviteCode, invitedEmails: emails });
    } catch (e) {
      setErr(e?.message || 'Could not create the team.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 mb-6 space-y-3" data-testid="create-team-form">
      <div className="flex justify-between items-center">
        <h3 className="font-serif text-lg">New team</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1.5">Team name</label>
        <input
          value={name} onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="e.g. Morning Trail Crew"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background"
          data-testid="team-name-input"
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1.5">Invite members by email (optional)</label>
        <textarea
          value={emailsRaw} onChange={(e) => setEmailsRaw(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background resize-none font-mono text-sm"
          placeholder={`jane@example.com\nrunner@example.com`}
          data-testid="team-invites-input"
        />
        <p className="text-xs text-muted-foreground mt-1">
          No email is sent. Invitees see a "Pending invite" on their Teams page when they sign in with this email. After creating, you'll get a shareable invite link, which is the quickest way.
        </p>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-border">Cancel</button>
        <button
          onClick={create}
          disabled={saving}
          className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60"
          data-testid="create-team-submit"
        >{saving ? 'Creating…' : 'Create team'}</button>
      </div>
    </div>
  );
};

// =============================================================================
const CreatedBanner = ({ team, onClose }) => (
  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 mb-6 space-y-3" data-testid="team-created-banner">
    <div className="flex items-start justify-between gap-3">
      <p className="font-medium text-emerald-900 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> "{team.name}" is ready!</p>
      <button onClick={onClose} className="text-emerald-700" data-testid="team-created-close" aria-label="Dismiss"><X className="w-4 h-4" /></button>
    </div>
    <p className="text-sm text-emerald-900">How teammates join:</p>
    <ol className="text-sm text-emerald-900 list-decimal pl-5 space-y-1">
      <li>Copy the invite link below and send it via WhatsApp, Slack, Teams or email.</li>
      <li>They open it, sign in or create a free account, and tap <strong>Join team</strong>.</li>
      {team.invitedEmails?.length > 0 && <li>People you added by email ({team.invitedEmails.join(', ')}) can also find a "Pending invite" on their Teams page. No email is sent automatically.</li>}
    </ol>
    <InviteLinkBox teamId={team.id} code={team.inviteCode} testId="created-invite-link" />
  </div>
);

// =============================================================================
const TeamCard = ({ team, user }) => {
  const [sessions, setSessions] = useState([]);
  const [inviteMore, setInviteMore] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const isCreator = team.createdBy === user.uid;

  useEffect(() => {
    // Load recent sessions shared with this team
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'fitness_teams', team.id, 'sessions'));
        setSessions(sortByStartDesc(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
      } catch (err) {
        console.error('Loading team sessions failed:', err);
        setSessions([]);
      }
    })();
  }, [team.id]);

  const leaderboard = useMemo(() => {
    const byUser = {};
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const s of sessions) {
      const t = s.startedAt?.toMillis ? s.startedAt.toMillis() : new Date(s.startedAt).getTime();
      if (t < cutoff) continue;
      const key = s.userId;
      if (!byUser[key]) byUser[key] = { userId: key, name: s.userName, photo: s.userPhotoURL, km: 0, count: 0 };
      byUser[key].km += s.distanceKm || 0;
      byUser[key].count += 1;
    }
    return Object.values(byUser).sort((a, b) => b.km - a.km).slice(0, 10);
  }, [sessions]);

  const addInvites = async () => {
    const emails = inviteMore.split(/[,\s\n]+/).map((e) => e.trim().toLowerCase()).filter((e) => /.+@.+\..+/.test(e));
    if (emails.length === 0) return;
    await updateDoc(doc(db, 'fitness_teams', team.id), {
      memberEmails: arrayUnion(...emails),
    });
    setInviteMore('');
    setInviteMsg(`Added ${emails.join(', ')}. No email is sent: they'll see a "Pending invite" on their Teams page once they sign in with that address. For the fastest join, send them the invite link above.`);
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" data-testid={`team-card-${team.id}`}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-serif">{team.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {(team.memberIds || []).length} member{(team.memberIds || []).length === 1 ? '' : 's'}
              {(team.memberEmails || []).length > 0 && ` · ${team.memberEmails.length} pending`}
            </p>
          </div>
          {(team.challenges || []).length > 0 && (
            <a href="/fitness/challenges" className="text-xs text-emerald-700 hover:underline flex items-center gap-1" data-testid={`team-challenges-link-${team.id}`}>
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> {team.challenges.length} challenge{team.challenges.length === 1 ? '' : 's'}
            </a>
          )}
        </div>
      </div>

      {team.inviteCode && (
        <div className="border-t border-border px-5 py-4">
          <InviteLinkBox teamId={team.id} code={team.inviteCode} testId={`invite-link-${team.id}`} />
        </div>
      )}

      {/* Leaderboard */}
      <div className="border-t border-border px-5 py-4">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><Trophy className="w-3.5 h-3.5 text-amber-500" /> This week's leaderboard</h4>
        {leaderboard.length === 0 ? (
          <p className="text-xs text-muted-foreground">No sessions shared this week yet.</p>
        ) : (
          <ol className="space-y-1.5">
            {leaderboard.map((m, i) => (
              <li key={m.userId} className="flex items-center gap-3 text-sm">
                <span className={`w-5 text-center font-serif ${i === 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>{i + 1}</span>
                <span className="flex-1 truncate">{m.name}</span>
                <span className="text-xs text-muted-foreground">{m.count} session{m.count === 1 ? '' : 's'}</span>
                <span className="font-medium tabular-nums">{m.km.toFixed(1)} km</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Recent shared sessions (compact) */}
      {sessions.length > 0 && (
        <div className="border-t border-border px-5 py-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Recent shared sessions</h4>
          <ul className="space-y-1.5">
            {sessions.slice(0, 5).map((s) => {
              const act = ACTIVITY[s.activity] || ACTIVITY.walk;
              return (
                <li key={s.id} className="flex items-center gap-3 text-sm">
                  <span>{act.emoji}</span>
                  <span className="flex-1 truncate">{s.userName}</span>
                  <span className="tabular-nums">{(s.distanceKm || 0).toFixed(2)} km · {formatDuration(s.durationSec)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Add more invites (creator only) */}
      {isCreator && (
        <div className="border-t border-border px-5 py-4">
          <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1.5">Invite more members</label>
          <div className="flex gap-2">
            <input
              value={inviteMore} onChange={(e) => setInviteMore(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
              data-testid={`invite-more-input-${team.id}`}
            />
            <button
              onClick={addInvites}
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
              data-testid={`invite-more-btn-${team.id}`}
            >Add</button>
          </div>
          {inviteMsg && (
            <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 mt-2" data-testid={`invite-more-msg-${team.id}`}>{inviteMsg}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FitnessTeamsPage;
