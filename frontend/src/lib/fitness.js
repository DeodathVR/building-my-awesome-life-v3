// Pure helpers for the Fitness feature — no React, no Firebase.
// Great-circle distance, activity/MET tables, calorie estimator, formatters.

// -----------------------------------------------------------------------------
// Distance
// -----------------------------------------------------------------------------

/** Haversine distance in metres between two {lat, lng} points. */
export function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Total distance in metres along a path of {lat, lng} points. */
export function pathDistanceMeters(points) {
  let d = 0;
  for (let i = 1; i < points.length; i++) {
    d += haversineMeters(points[i - 1], points[i]);
  }
  return d;
}

// -----------------------------------------------------------------------------
// Activity classification and calorie math (compendium of physical activities)
// -----------------------------------------------------------------------------

/** Activity → MET value + display label. */
export const ACTIVITY = {
  walk:       { met: 3.0,  label: 'Walk',       emoji: '🚶' },
  brisk_walk: { met: 4.3,  label: 'Brisk Walk', emoji: '🚶‍♀️' },
  jog:        { met: 7.0,  label: 'Jog',        emoji: '🏃' },
  run:        { met: 9.8,  label: 'Run',        emoji: '🏃‍♀️' },
};

/**
 * Auto-classify activity from average pace (min/km).
 *   Walk        > 9 min/km
 *   Brisk walk  7.5–9
 *   Jog         5.5–7.5
 *   Run         < 5.5
 */
export function classifyActivity(avgPaceMinPerKm) {
  if (!avgPaceMinPerKm || !Number.isFinite(avgPaceMinPerKm)) return 'walk';
  if (avgPaceMinPerKm > 9)  return 'walk';
  if (avgPaceMinPerKm > 7.5) return 'brisk_walk';
  if (avgPaceMinPerKm > 5.5) return 'jog';
  return 'run';
}

/**
 * MET-based calorie estimate:  kcal = MET × weightKg × durationHours
 * Falls back to 70 kg if weight missing.
 */
export function estimateCalories({ activity, weightKg, durationSec }) {
  const met = (ACTIVITY[activity] || ACTIVITY.walk).met;
  const w = Math.max(30, Math.min(200, Number(weightKg) || 70));
  return Math.round(met * w * (durationSec / 3600));
}

// -----------------------------------------------------------------------------
// Formatters
// -----------------------------------------------------------------------------

/** Seconds → "HH:MM:SS" or "MM:SS". */
export function formatDuration(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Metres → "1.24 km" */
export function formatKm(metres) {
  return `${(metres / 1000).toFixed(2)} km`;
}

/** Pace (min per km) → "6:45 /km" */
export function formatPace(minPerKm) {
  if (!minPerKm || !Number.isFinite(minPerKm)) return '—';
  const m = Math.floor(minPerKm);
  const s = Math.round((minPerKm - m) * 60);
  return `${m}:${String(s).padStart(2, '0')} /km`;
}

// -----------------------------------------------------------------------------
// Motivational content
// -----------------------------------------------------------------------------

export const MOTIVATIONAL_QUOTES = [
  { q: 'One step at a time still gets you there.',            a: '— everyone who ever finished' },
  { q: 'The best pace is a pace you can sustain.',            a: '— trail wisdom' },
  { q: 'Move your body. Clear your mind.',                    a: '— any morning ever' },
  { q: 'You will never regret the walk you took.',            a: '— trust me' },
  { q: 'Small daily loops beat one big burst.',               a: '— every training plan' },
  { q: 'Your only competition is yesterday.',                 a: '— endurance mantra' },
  { q: 'Discipline is remembering what you want.',            a: '— David Campbell' },
  { q: 'Nothing changes if nothing moves.',                   a: '— physics + life' },
  { q: 'The miracle isn\u2019t that I finished. The miracle is that I had the courage to start.', a: '— John Bingham' },
  { q: 'Fresh air is the cheapest therapy.',                  a: '— unknown, universally true' },
  { q: 'Every session counts, even the slow ones.',           a: '— your future self' },
  { q: 'Consistency compounds. Show up again tomorrow.',      a: '— the streak' },
];

export function pickQuoteOfDay(seed = new Date().toISOString().slice(0, 10)) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return MOTIVATIONAL_QUOTES[h % MOTIVATIONAL_QUOTES.length];
}

// -----------------------------------------------------------------------------
// Personal-best detection
// -----------------------------------------------------------------------------

/**
 * Given the new session and the user's previous sessions, return a PB type or null.
 * Order of precedence: longest distance > longest duration > fastest avg pace (≥1km).
 */
export function detectPersonalBest(newSession, previousSessions) {
  if (!newSession) return null;
  const prev = previousSessions || [];

  if (newSession.distanceKm > 0) {
    const maxDist = prev.reduce((m, s) => Math.max(m, s.distanceKm || 0), 0);
    if (newSession.distanceKm > maxDist) return { type: 'distance', label: 'Longest distance' };
  }
  if (newSession.durationSec > 0) {
    const maxDur = prev.reduce((m, s) => Math.max(m, s.durationSec || 0), 0);
    if (newSession.durationSec > maxDur) return { type: 'duration', label: 'Longest session' };
  }
  if (newSession.distanceKm >= 1 && newSession.avgPaceMinPerKm) {
    const priorPaces = prev
      .filter((s) => (s.distanceKm || 0) >= 1 && s.avgPaceMinPerKm)
      .map((s) => s.avgPaceMinPerKm);
    const bestPrior = priorPaces.length ? Math.min(...priorPaces) : Infinity;
    if (newSession.avgPaceMinPerKm < bestPrior) return { type: 'pace', label: 'Fastest pace' };
  }
  return null;
}

// -----------------------------------------------------------------------------
// Kilometre splits
// -----------------------------------------------------------------------------

/**
 * Compute per-kilometre splits from a GPS path.
 * Walks the path accumulating distance and records the time it took to
 * cross each 1 km boundary (linearly interpolating the crossing timestamp
 * between the two GPS points that straddle it).
 *
 * Returns an array like:
 *   [{ km: 1, timeSec: 342, paceMinPerKm: 5.7, partial: false }, ...]
 * The final entry may be `partial: true` if the session didn't reach a
 * whole km (its `km` value is the fractional distance in km).
 */
export function computeKmSplits(path) {
  if (!Array.isArray(path) || path.length < 2) return [];
  const splits = [];
  let cumMeters = 0;
  let nextBoundary = 1000;              // next km boundary to cross (metres)
  let boundaryStartTime = path[0].t;    // time when the current km segment started

  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    if (b.gap === 'pause') { boundaryStartTime += (b.t || 0) - (a.t || 0); continue; }
    const segMeters = haversineMeters(a, b);
    if (segMeters <= 0) continue;

    // Crossing zero or more km boundaries within this segment?
    let segStartCum = cumMeters;
    let segStartTime = a.t;
    let segEndCum   = cumMeters + segMeters;

    while (segEndCum >= nextBoundary) {
      // Fraction of this segment where the boundary is crossed
      const frac = (nextBoundary - segStartCum) / (segEndCum - segStartCum);
      const crossTime = segStartTime + frac * (b.t - segStartTime);
      const timeSec = Math.max(0.001, (crossTime - boundaryStartTime) / 1000);
      const paceMinPerKm = (timeSec / 60);
      splits.push({
        km: Math.round(nextBoundary / 1000),
        timeSec,
        paceMinPerKm,
        partial: false,
      });
      // Advance the segment window past this boundary so we can detect the
      // next one within the same segment (rare on foot, but the math is safe).
      segStartCum = nextBoundary;
      segStartTime = crossTime;
      boundaryStartTime = crossTime;
      nextBoundary += 1000;
    }

    cumMeters = segEndCum;
  }

  // Optional partial trailing km
  const lastBoundaryMeters = (splits.length) * 1000;
  const trailing = cumMeters - lastBoundaryMeters;
  if (trailing >= 100) {  // only if there's a meaningful trailing distance (≥100 m)
    const lastPoint = path[path.length - 1];
    const timeSec = Math.max(0.001, (lastPoint.t - boundaryStartTime) / 1000);
    const paceMinPerKm = (timeSec / 60) / (trailing / 1000);
    splits.push({
      km: +(trailing / 1000).toFixed(2),   // e.g. 0.42
      timeSec,
      paceMinPerKm,
      partial: true,
    });
  }
  return splits;
}


/** Aggregate sessions from the last `days` days (default 7) into totals. */
export function weeklyTotals(sessions, days = 7) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const inRange = (sessions || []).filter((s) => {
    const t = s.startedAt?.toMillis ? s.startedAt.toMillis() : new Date(s.startedAt).getTime();
    return t >= cutoff;
  });
  const totalKm = inRange.reduce((sum, s) => sum + (s.distanceKm || 0), 0);
  const totalSec = inRange.reduce((sum, s) => sum + (s.durationSec || 0), 0);
  const totalCal = inRange.reduce((sum, s) => sum + (s.calories || 0), 0);
  return { count: inRange.length, totalKm, totalSec, totalCal };
}

// -----------------------------------------------------------------------------
// Client-side image compression for photo uploads (base64 → base64 JPEG ≤ 400px)
// -----------------------------------------------------------------------------

export async function compressImageToDataURL(file, maxDim = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target.result; };
    reader.onerror = reject;
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// -----------------------------------------------------------------------------
// Random 6-char invite code
// -----------------------------------------------------------------------------

export function makeInviteCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
