import React, { useMemo } from 'react';
import { formatPace, formatDuration, computeKmSplits } from '../lib/fitness';

/**
 * KmSplits — per-kilometre pace breakdown for a GPS session.
 *
 * Renders a compact list: Km | Time | Pace | mini bar showing pace relative to
 * fastest/slowest split. Faster km => longer green bar, slower => shorter amber bar.
 *
 * Silently renders nothing if the path is too short to produce splits.
 */
export const KmSplits = ({ path }) => {
  const splits = useMemo(() => computeKmSplits(path), [path]);
  if (splits.length === 0) return null;

  const paces = splits.filter((s) => !s.partial).map((s) => s.paceMinPerKm);
  const fastest = paces.length ? Math.min(...paces) : 0;
  const slowest = paces.length ? Math.max(...paces) : 0;
  const range = Math.max(0.1, slowest - fastest);

  return (
    <div className="mt-2" data-testid="km-splits">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Kilometre splits
      </p>
      <ul className="space-y-1">
        {splits.map((s, i) => {
          // Fraction 0 (fastest) → 1 (slowest); partial km uses its own pace vs the same scale
          const frac = paces.length ? Math.min(1, Math.max(0, (s.paceMinPerKm - fastest) / range)) : 0.5;
          // Fastest bar is longest (100%), slowest is shortest (30%)
          const widthPct = 100 - frac * 70;
          const isFastest = !s.partial && s.paceMinPerKm === fastest && paces.length > 1;
          const barColor = isFastest ? '#0EA36F' : s.partial ? '#A3A3A3' : '#FFB84A';

          return (
            <li key={i} className="grid grid-cols-[36px_60px_82px_1fr] items-center gap-2 text-xs">
              <span className={`font-medium tabular-nums ${isFastest ? 'text-emerald-700' : ''}`}>
                {s.partial ? `${s.km}` : `${s.km}`}
                {s.partial && <span className="text-[9px] text-muted-foreground ml-0.5">km</span>}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {formatDuration(s.timeSec)}
              </span>
              <span className="tabular-nums">
                {formatPace(s.paceMinPerKm)}
              </span>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${widthPct}%`, background: barColor }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      {paces.length > 1 && (
        <p className="text-[10px] text-muted-foreground mt-2">
          Fastest {formatPace(fastest)} · Slowest {formatPace(slowest)}
        </p>
      )}
    </div>
  );
};

export default KmSplits;
