import { useEffect, useState } from 'react';

const DRAFT_KEY = 'fitness_live_draft';
const DRAFT_MAX_AGE_MS = 12 * 60 * 60 * 1000;

export const loadDraft = () => {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (!d || !Array.isArray(d.path) || Date.now() - d.savedAt > DRAFT_MAX_AGE_MS) return null;
    return d;
  } catch (_) {
    return null;
  }
};

export const saveDraft = (draft) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, savedAt: Date.now() }));
  } catch (_) { /* storage full or blocked — tracking continues in memory */ }
};

export const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

// Keeps the screen on while `active`; re-acquires after the tab becomes visible again.
export const useWakeLock = (active) => {
  const [state, setState] = useState('off'); // 'on' | 'off' | 'unsupported' | 'denied'
  useEffect(() => {
    if (!active) return undefined;
    if (!('wakeLock' in navigator)) { setState('unsupported'); return undefined; }
    let lock = null;
    let cancelled = false;
    const acquire = async () => {
      try {
        const l = await navigator.wakeLock.request('screen');
        if (cancelled) { l.release().catch(() => {}); return; }
        lock = l;
        setState('on');
        l.addEventListener('release', () => { if (!cancelled) setState('off'); });
      } catch (_) {
        if (!cancelled) setState('denied');
      }
    };
    const onVis = () => { if (document.visibilityState === 'visible') acquire(); };
    acquire();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVis);
      if (lock) lock.release().catch(() => {});
      setState('off');
    };
  }, [active]);
  return state;
};
