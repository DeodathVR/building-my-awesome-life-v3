// Content service: Firestore CRUD for feed posts + education tips + AI daily generation
// Collections:
//   feed_posts: { id, type, category, visual, text, subtext, gradient, source, active, createdAt, streak? }
//   education_tips: { id, category ('habit'|'focus'), title, content, source, icon, active, order, createdAt }
//   feed_generation_log: docId=YYYY-MM-DD, { date, count, generatedAt, source }

import { db } from '../firebase';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy, where,
} from 'firebase/firestore';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// XHR POST — bypasses PostHog fetch interception
const xhrPost = (url, body) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = () => {
    try { resolve({ status: xhr.status, ok: xhr.status >= 200 && xhr.status < 300, data: JSON.parse(xhr.responseText) }); }
    catch (e) { reject(new Error(`Parse error (${xhr.status})`)); }
  };
  xhr.onerror = () => reject(new Error('Network error'));
  xhr.send(JSON.stringify(body));
});

const FEED = 'feed_posts';
const EDU = 'education_tips';
const GEN_LOG = 'feed_generation_log';

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const todayKey = () => new Date().toISOString().split('T')[0];

// ─── Evergreen seed content ────────────────────────────────────────────────
const EVERGREEN_FEED = [
  { type: 'conspiracy', category: 'Witty Conspiracy', visual: 'lotus', text: "Missed your alarm? Universe just gifted you extra bloom time. You're worth waiting for. 🌸", subtext: "Today's Success Conspiracy", gradient: 'from-primary/20 via-transparent to-transparent' },
  { type: 'reframe', category: 'Awesome Reframe', visual: 'daisy', text: "That rainy day? Perfect setup for cozy habit stacking.", subtext: 'Reframe your perspective', gradient: 'from-accent/20 via-transparent to-transparent' },
  { type: 'affirmation', category: 'Bloom Moment', visual: 'circle', text: 'Breathe in possibility... Exhale doubt... The universe cheers your next step.', subtext: '60-second bloom session', gradient: 'from-secondary/30 via-transparent to-transparent' },
  { type: 'quickwin', category: 'Quick Win Spotlight', visual: 'stats', text: 'Someone turned a delay into a 5-day streak. Your turn?', subtext: 'Community inspiration', streak: 5, gradient: 'from-primary/20 via-transparent to-transparent' },
  { type: 'cosmic', category: 'Cosmic Teaser', visual: 'cosmic', text: "Hey superstar, you're doing better than you think—keep blooming. ✨", subtext: 'AI Coach whisper', gradient: 'from-purple-500/20 via-transparent to-transparent' },
  { type: 'conspiracy', category: 'Witty Conspiracy', visual: 'daisy', text: 'Late to the meeting? The universe needed everyone to take a breath before your brilliance arrived.', subtext: "Today's Success Conspiracy", gradient: 'from-accent/20 via-transparent to-transparent' },
  { type: 'affirmation', category: 'Bloom Moment', visual: 'lotus', text: 'Every petal that opens is a worry released. Watch, breathe, bloom.', subtext: 'Morning affirmation', gradient: 'from-primary/20 via-transparent to-transparent' },
];

const EVERGREEN_EDU = [
  // Habit tips
  { category: 'habit', title: 'Start Small', icon: 'Target', content: "Make your habits so tiny they're impossible to fail. Want to meditate? Start with just one breath. Reading? One page. Exercise? One pushup. The goal is consistency, not intensity.", source: 'Atomic Habits', order: 1 },
  { category: 'habit', title: 'Habit Stacking', icon: 'Layers', content: 'Link new habits to existing routines. Formula: "After I [CURRENT HABIT], I will [NEW HABIT]." Example: After I pour my morning coffee, I will write one thing I\'m grateful for.', source: 'Atomic Habits', order: 2 },
  { category: 'habit', title: 'Environment Design', icon: 'Lightbulb', content: 'Make good habits obvious and easy. Put your book on your pillow. Keep your yoga mat rolled out. Make bad habits invisible and difficult. Remove junk food from sight.', source: 'Atomic Habits', order: 3 },
  { category: 'habit', title: 'The Two-Minute Rule', icon: 'Clock', content: 'When you start a new habit, it should take less than two minutes to do. "Read before bed" becomes "Read one page." The point is to master showing up.', source: 'Atomic Habits', order: 4 },
  { category: 'habit', title: 'Never Miss Twice', icon: 'Zap', content: "Missing one day won't hurt you. Missing two begins a new streak—of not doing the habit. If you miss once, get back on track immediately. Perfection isn't required.", source: 'Atomic Habits', order: 5 },
  // Focus explanations
  { category: 'focus', title: 'Why Lotus Observation Works', icon: 'Lightbulb', content: 'Slow, natural visuals like a lotus blooming train your attention span by giving your brain a gentle anchor. Unlike fast-moving content, these exercises strengthen your ability to sustain focus without overstimulation.', source: 'Focus Science', order: 1 },
  { category: 'focus', title: 'The Science of Expanding Circles', icon: 'Lightbulb', content: 'Rhythmic breathing exercises activate the parasympathetic nervous system, reducing cortisol and anxiety. The visual component provides a focus point that makes meditation accessible for beginners.', source: 'Focus Science', order: 2 },
  { category: 'focus', title: 'Breath Counting Benefits', icon: 'Lightbulb', content: 'Counting breaths creates a feedback loop between body and mind. Each counted breath is a small win that builds your concentration muscle, making it easier to focus on habits throughout the day.', source: 'Focus Science', order: 3 },
];

// ─── Seeding ───────────────────────────────────────────────────────────────
export const seedContentIfEmpty = async () => {
  try {
    const feedSnap = await getDocs(collection(db, FEED));
    if (feedSnap.empty) {
      for (const p of EVERGREEN_FEED) {
        const id = genId();
        await setDoc(doc(db, FEED, id), { ...p, id, source: 'evergreen', active: true, createdAt: new Date().toISOString() });
      }
    }
    const eduSnap = await getDocs(collection(db, EDU));
    if (eduSnap.empty) {
      for (const t of EVERGREEN_EDU) {
        const id = genId();
        await setDoc(doc(db, EDU, id), { ...t, id, source: 'evergreen', active: true, createdAt: new Date().toISOString() });
      }
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
};

// ─── Feed CRUD ─────────────────────────────────────────────────────────────
export const fetchFeedPosts = async ({ activeOnly = true } = {}) => {
  const snap = await getDocs(collection(db, FEED));
  let posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (activeOnly) posts = posts.filter(p => p.active !== false);
  posts.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return posts;
};

export const createFeedPost = async (post) => {
  const id = genId();
  const full = { id, active: true, source: 'admin', createdAt: new Date().toISOString(), ...post };
  await setDoc(doc(db, FEED, id), full);
  return full;
};

export const updateFeedPost = async (id, patch) => {
  await updateDoc(doc(db, FEED, id), patch);
};

export const deleteFeedPost = async (id) => {
  await deleteDoc(doc(db, FEED, id));
};

// ─── Education CRUD ────────────────────────────────────────────────────────
export const fetchEducationTips = async ({ activeOnly = true, category = null } = {}) => {
  let q1 = collection(db, EDU);
  if (category) q1 = query(q1, where('category', '==', category));
  const snap = await getDocs(q1);
  let tips = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (activeOnly) tips = tips.filter(t => t.active !== false);
  tips.sort((a, b) => (a.order || 999) - (b.order || 999));
  return tips;
};

export const createEducationTip = async (tip) => {
  const id = genId();
  const full = { id, active: true, source: 'admin', order: 100, createdAt: new Date().toISOString(), ...tip };
  await setDoc(doc(db, EDU, id), full);
  return full;
};

export const updateEducationTip = async (id, patch) => {
  await updateDoc(doc(db, EDU, id), patch);
};

export const deleteEducationTip = async (id) => {
  await deleteDoc(doc(db, EDU, id));
};

// ─── AI Daily Generation ───────────────────────────────────────────────────
const FEED_PROMPT = `You are writing short, uplifting micro-content for a habit-tracking app called "Awesome Life". Generate exactly 7 NEW and UNIQUE feed slides for today. Each slide must be one of these types: conspiracy (whimsical reframe of setbacks), reframe (positive perspective flip), affirmation (mindful encouragement), quickwin (community-style win mention), cosmic (cosmic/universe themed motivation).

Return ONLY a valid JSON array (no markdown, no prose) with exactly 7 objects, each with these fields:
- "type": one of "conspiracy" | "reframe" | "affirmation" | "quickwin" | "cosmic"
- "category": matching display label — "Witty Conspiracy" | "Awesome Reframe" | "Bloom Moment" | "Quick Win Spotlight" | "Cosmic Teaser"
- "visual": one of "lotus" | "daisy" | "circle" | "stats" | "cosmic"
- "text": the main message, 1-2 sentences, warm and poetic, can include one emoji max
- "subtext": short tag line, 2-5 words

Keep voice: gentle, witty, affirming. Mix the 5 types across the 7 slides. DO NOT repeat any of the already-seeded evergreen phrases.`;

const GRADIENTS_BY_TYPE = {
  conspiracy: 'from-primary/20 via-transparent to-transparent',
  reframe: 'from-accent/20 via-transparent to-transparent',
  affirmation: 'from-secondary/30 via-transparent to-transparent',
  quickwin: 'from-primary/20 via-transparent to-transparent',
  cosmic: 'from-purple-500/20 via-transparent to-transparent',
};

const VALID_TYPES = ['conspiracy', 'reframe', 'affirmation', 'quickwin', 'cosmic'];
const VALID_VISUALS = ['lotus', 'daisy', 'circle', 'stats', 'cosmic'];

const parseGeminiJSON = (text) => {
  if (!text) return [];
  // Strip markdown fences if present
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  // Find the JSON array
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1) return [];
  try { return JSON.parse(cleaned.slice(start, end + 1)); }
  catch { return []; }
};

// Generates 7 new slides, writes to Firestore, logs today. Returns count written.
export const generateDailyFeed = async ({ source = 'auto', force = false } = {}) => {
  if (!GEMINI_API_KEY) throw new Error('REACT_APP_GEMINI_API_KEY not set');

  const today = todayKey();
  const logRef = doc(db, GEN_LOG, today);

  if (!force) {
    const existing = await getDoc(logRef);
    if (existing.exists()) {
      return { skipped: true, reason: 'already-generated-today', count: existing.data().count || 0 };
    }
  }

  // Mark in-progress to prevent races from multiple tabs
  await setDoc(logRef, { date: today, status: 'in_progress', startedAt: new Date().toISOString(), source }, { merge: true });

  const res = await xhrPost(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    contents: [{ parts: [{ text: FEED_PROMPT }] }],
    generationConfig: { temperature: 0.9, topK: 40, topP: 0.95, maxOutputTokens: 2048, responseMimeType: 'application/json' },
  });

  if (!res.ok || res.data.error) {
    const msg = res.data?.error?.message || `status ${res.status}`;
    await setDoc(logRef, { date: today, status: 'failed', error: msg, source }, { merge: true });
    throw new Error(`Gemini error: ${msg}`);
  }

  const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const items = parseGeminiJSON(text);

  const valid = items.filter(i => i && i.text && VALID_TYPES.includes(i.type));
  let written = 0;
  for (const i of valid.slice(0, 7)) {
    const id = genId();
    const visual = VALID_VISUALS.includes(i.visual) ? i.visual : VALID_VISUALS[written % VALID_VISUALS.length];
    await setDoc(doc(db, FEED, id), {
      id,
      type: i.type,
      category: i.category || i.type,
      visual,
      text: i.text,
      subtext: i.subtext || '',
      gradient: GRADIENTS_BY_TYPE[i.type] || GRADIENTS_BY_TYPE.affirmation,
      source: source === 'admin' ? 'ai-admin' : 'ai',
      active: true,
      createdAt: new Date().toISOString(),
    });
    written += 1;
  }

  await setDoc(logRef, { date: today, status: 'done', count: written, generatedAt: new Date().toISOString(), source }, { merge: true });
  return { skipped: false, count: written };
};

// Check if today's generation has already run
export const hasGeneratedToday = async () => {
  try {
    const snap = await getDoc(doc(db, GEN_LOG, todayKey()));
    return snap.exists() && snap.data().status === 'done';
  } catch { return false; }
};
