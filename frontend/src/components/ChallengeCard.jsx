import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Trash2, CheckCircle2, Users, User } from 'lucide-react';
import { challengeProgress } from '../lib/challenges';

const fmt = (km) => (km >= 100 ? km.toFixed(0) : km.toFixed(1));

const ProgressBar = ({ pct, markerPct, testId, thin }) => (
  <div className={`relative w-full rounded-full bg-muted overflow-visible ${thin ? 'h-1.5' : 'h-3'}`} data-testid={testId}>
    <div
      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-[width] duration-700 ease-out"
      style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }}
    />
    {markerPct != null && markerPct > 0 && markerPct < 100 && (
      <div className="absolute -top-1 -bottom-1 w-0.5 bg-foreground/60 rounded" style={{ left: `${markerPct}%` }} title="Where you should be today" />
    )}
  </div>
);

const statusLine = (p) => {
  if (p.upcoming) return `Starts ${new Date(p.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  if (p.ended) return 'Challenge ended';
  return `Day ${p.dayNumber} of ${Math.round((p.end - p.start) / 86400000)} · ${p.daysLeft} day${p.daysLeft === 1 ? '' : 's'} left`;
};

const PaceNote = ({ p }) => {
  if (p.upcoming) return null;
  const diff = p.totalKm - p.expectedKm;
  if (p.pct >= 100) return <p className="text-sm text-emerald-700 font-medium" data-testid="challenge-pace">Goal reached. Brilliant teamwork!</p>;
  if (p.ended) return <p className="text-sm text-muted-foreground" data-testid="challenge-pace">Finished at {fmt(p.totalKm)} km.</p>;
  return (
    <p className={`text-sm ${diff >= 0 ? 'text-emerald-700' : 'text-amber-700'}`} data-testid="challenge-pace">
      {diff >= 0 ? `Ahead of pace by ${fmt(diff)} km` : `Behind pace by ${fmt(-diff)} km`}
      <span className="text-muted-foreground"> · {p.kmPerDayNeeded.toFixed(1)} km/day {p.individual ? 'across the team' : ''} to finish</span>
    </p>
  );
};

export const ChallengeCard = ({ challenge, team, sessions = [], user, compact, onDelete }) => {
  const p = challengeProgress(challenge, team, sessions);
  const isCreator = team.createdBy === user?.uid;
  const testBase = `challenge-${challenge.id}`;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" data-testid={`${testBase}-card`}>
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <h3 className="font-serif text-lg truncate" data-testid={`${testBase}-name`}>{challenge.name}</h3>
              <span className="text-[10px] uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded flex items-center gap-1">
                {p.individual ? <User className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                {p.individual ? `${challenge.goalKm} km each` : 'Team total'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{team.name} · <span data-testid={`${testBase}-status`}>{statusLine(p)}</span></p>
          </div>
          {!compact && isCreator && onDelete && (
            <button onClick={() => onDelete(challenge)} className="text-muted-foreground hover:text-red-600 p-1" data-testid={`${testBase}-delete`} aria-label="Delete challenge">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-2">
            <p className="font-serif">
              <span className="text-3xl" data-testid={`${testBase}-total`}>{fmt(p.totalKm)}</span>
              <span className="text-muted-foreground text-sm"> / {fmt(p.targetKm)} km</span>
            </p>
            <span className="text-sm font-medium tabular-nums" data-testid={`${testBase}-pct`}>{Math.floor(p.pct)}%</span>
          </div>
          <ProgressBar pct={p.pct} markerPct={p.ended || p.upcoming ? null : p.elapsedFrac * 100} testId={`${testBase}-bar`} />
          <div className="mt-2"><PaceNote p={p} /></div>
        </div>
      </div>

      {compact ? (
        <Link to="/fitness/challenges" className="block border-t border-border px-5 py-3 text-xs text-emerald-700 hover:bg-muted/40" data-testid={`${testBase}-open`}>
          See member contributions →
        </Link>
      ) : (
        <MemberList p={p} user={user} testBase={testBase} />
      )}
    </div>
  );
};

const MemberList = ({ p, user, testBase }) => (
  <div className="border-t border-border px-5 py-4" data-testid={`${testBase}-members`}>
    <h4 className="text-sm font-medium mb-3">Member contributions</h4>
    <ol className="space-y-3">
      {p.members.map((m, i) => (
        <li key={m.userId} className="space-y-1.5" data-testid={`${testBase}-member-${m.userId}`}>
          <div className="flex items-center gap-3 text-sm">
            <span className={`w-5 text-center font-serif ${i === 0 && m.km > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>{i + 1}</span>
            <span className="flex-1 truncate">
              {m.userId === user?.uid ? 'You' : (m.name || 'Teammate')}
              {m.done && <CheckCircle2 className="inline w-3.5 h-3.5 text-emerald-600 ml-1.5 -mt-0.5" />}
            </span>
            <span className="text-xs text-muted-foreground">{m.count} session{m.count === 1 ? '' : 's'}</span>
            <span className="font-medium tabular-nums whitespace-nowrap text-right min-w-[5rem]">{fmt(m.km)}{p.individual ? ` / ${p.memberGoal}` : ''} km</span>
          </div>
          <div className="pl-8">
            <ProgressBar pct={p.individual ? m.pct : (p.totalKm > 0 ? (m.km / p.totalKm) * 100 : 0)} thin />
          </div>
        </li>
      ))}
    </ol>
    {!p.individual && <p className="text-[11px] text-muted-foreground mt-3">Bars show each member's share of the team total.</p>}
  </div>
);
