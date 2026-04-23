import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './games-page.css';

const CONC_KEY = 'alu_concentration';
const XP_KEY = 'alu_xp';
const IS_PRO = () => localStorage.getItem('alu_isPro') === 'true';

const addXp = (n) => localStorage.setItem(XP_KEY, String(parseInt(localStorage.getItem(XP_KEY) || '0') + n));
const logGame = () => {
  const k = new Date().toISOString().split('T')[0];
  const d = JSON.parse(localStorage.getItem(CONC_KEY) || '{}');
  d[k] = (d[k] || 0) + 1;
  localStorage.setItem(CONC_KEY, JSON.stringify(d));
};
const getLvl = () => {
  const x = parseInt(localStorage.getItem(XP_KEY) || '0');
  return { xp: x, level: Math.floor(x / 500) + 1, pct: (x % 500) / 5 };
};

// ─── 15 Game Components ─────────────────────────────────────

function NumberFlash({ onDone }) {
  const [phase, setPhase] = useState('show');
  const [nums] = useState(() => Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join(''));
  const [val, setVal] = useState('');
  const [ok, setOk] = useState(null);
  const ref = useRef();

  useEffect(() => {
    const t = setTimeout(() => { setPhase('input'); setTimeout(() => ref.current?.focus(), 80); }, 5000);
    return () => clearTimeout(t);
  }, []);

  const check = () => {
    const correct = val.trim() === nums;
    setOk(correct); setPhase('done');
    if (correct) { addXp(60); logGame(); }
  };

  if (phase === 'show') return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <p style={{ fontSize: 13, color: 'var(--g-muted)', marginBottom: 16 }}>Memorise these 6 digits — disappears in 5 seconds</p>
      <div className="game-display">{nums}</div>
      <p style={{ fontSize: 12, color: 'var(--g-muted2)' }}>Stare and focus…</p>
    </div>
  );
  if (phase === 'input') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '16px 0' }}>
      <p style={{ fontSize: 15, fontWeight: 700 }}>What were the 6 digits?</p>
      <input ref={ref} className="game-input" type="number" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && val && check()} placeholder="______" data-testid="number-flash-input" autoFocus />
      <button className="btn-g" onClick={check} disabled={!val}>Submit</button>
    </div>
  );
  return (
    <Result ok={ok} xp={60} msg={ok ? 'Perfect recall!' : `It was ${nums}`} onDone={onDone} />
  );
}

const QUOTES = [
  { text: 'The secret of getting ahead is getting started.', by: 'Mark Twain' },
  { text: 'Small daily improvements are the key to staggering long-term results.', by: 'Robin Sharma' },
  { text: 'We are what we repeatedly do. Excellence is not an act but a habit.', by: 'Aristotle' },
];

function QuoteRecall({ onDone }) {
  const [q] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const words = q.text.split(' ').length;
  const [phase, setPhase] = useState('show');
  const [val, setVal] = useState('');
  const [score, setScore] = useState(0);
  const [secs, setSecs] = useState(words * 2);
  const ref = useRef();

  useEffect(() => {
    if (phase !== 'show') return;
    const t = setInterval(() => setSecs(s => {
      if (s <= 1) { setPhase('input'); clearInterval(t); setTimeout(() => ref.current?.focus(), 80); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const check = () => {
    const orig = q.text.toLowerCase().split(' ');
    const inp = val.trim().toLowerCase().split(' ');
    const matches = orig.filter((w, i) => inp[i] === w).length;
    const sc = Math.round((matches / orig.length) * 100);
    setScore(sc); setPhase('done');
    const earned = sc >= 80 ? 75 : sc >= 50 ? 45 : 20;
    addXp(earned); logGame();
  };

  if (phase === 'show') return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: 'var(--g-muted)' }}>Memorise this quote</p>
        <span className="mono" style={{ fontSize: 14, color: 'var(--g-teal)' }}>{secs}s</span>
      </div>
      <div style={{ background: 'rgba(0,212,170,0.07)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 14, padding: '20px 24px', marginBottom: 12 }}>
        <p style={{ fontSize: 17, fontStyle: 'italic', lineHeight: 1.7 }}>"{q.text}"</p>
        <p style={{ fontSize: 13, color: 'var(--g-teal)', marginTop: 10, fontWeight: 700 }}>— {q.by}</p>
      </div>
    </div>
  );
  if (phase === 'input') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 0' }}>
      <p style={{ fontSize: 14, fontWeight: 700 }}>Type the quote as accurately as you can:</p>
      <textarea ref={ref} className="game-ta" rows={3} value={val} onChange={e => setVal(e.target.value)} placeholder="Type the quote from memory..." data-testid="quote-recall-input" autoFocus />
      <button className="btn-g" onClick={check} disabled={!val.trim()}>Check</button>
    </div>
  );
  return <Result ok={score >= 60} xp={score >= 80 ? 75 : score >= 50 ? 45 : 20} msg={`${score}% accuracy! Original: "${q.text}"`} onDone={onDone} />;
}

const CP_COLORS = ['#00D4AA', '#FFD54F', '#81C784', '#8B5CF6'];
const CP_NAMES = ['Teal', 'Gold', 'Sage', 'Purple'];

function ColourPattern({ onDone }) {
  const SIZE = 4;
  const gen = () => {
    const g = Array(SIZE * SIZE).fill(null);
    for (let i = 0; i < 6; i++) g[Math.floor(Math.random() * SIZE * SIZE)] = Math.floor(Math.random() * 4);
    return g;
  };
  const [target] = useState(gen);
  const [phase, setPhase] = useState('show');
  const [user, setUser] = useState(Array(SIZE * SIZE).fill(null));
  const [sel, setSel] = useState(0);
  const [secs, setSecs] = useState(6);

  useEffect(() => {
    if (phase !== 'show') return;
    const t = setInterval(() => setSecs(s => { if (s <= 1) { setPhase('input'); clearInterval(t); return 0; } return s - 1; }), 1000);
    return () => clearTimeout(t);
  }, [phase]);

  const submit = () => {
    const correct = user.filter((v, i) => v === target[i]).length;
    const sc = Math.round((correct / SIZE * SIZE) * 100);
    setPhase('done');
    addXp(sc >= 14 ? 80 : sc >= 10 ? 50 : 25); logGame();
  };

  if (phase === 'show') return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: 'var(--g-muted)' }}>Memorise the pattern!</p>
        <span className="mono" style={{ color: 'var(--g-teal)', fontSize: 14 }}>{secs}s</span>
      </div>
      <div className="col-grid" style={{ maxWidth: 220, margin: '0 auto' }}>
        {target.map((c, i) => <div key={i} className="col-tile" style={{ background: c !== null ? CP_COLORS[c] : 'rgba(255,255,255,0.05)', boxShadow: c !== null ? `0 0 8px ${CP_COLORS[c]}60` : 'none' }} />)}
      </div>
    </div>
  );
  if (phase === 'input') return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 13, color: 'var(--g-muted)', marginBottom: 12 }}>Recreate the pattern!</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        {CP_COLORS.map((c, i) => <div key={i} onClick={() => setSel(i)} style={{ width: 32, height: 32, borderRadius: 8, background: c, border: sel === i ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', boxShadow: sel === i ? `0 0 10px ${c}` : 'none' }} />)}
        <div onClick={() => setSel(-1)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: sel === -1 ? '2px solid #fff' : '2px solid var(--g-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✕</div>
      </div>
      <div className="col-grid" style={{ maxWidth: 220, margin: '0 auto 16px' }}>
        {user.map((c, i) => <div key={i} className="col-tile" onClick={() => setUser(u => { const n = [...u]; n[i] = sel >= 0 ? sel : null; return n; })} style={{ background: c !== null ? CP_COLORS[c] : 'rgba(255,255,255,0.05)', cursor: 'pointer' }} />)}
      </div>
      <button className="btn-g" onClick={submit}>Submit Pattern</button>
    </div>
  );
  const correct = user.filter((v, i) => v === target[i]).length;
  return <Result ok={correct >= 14} xp={correct >= 14 ? 80 : correct >= 10 ? 50 : 25} msg={`${correct}/16 tiles correct`} onDone={onDone} />;
}

function MathSprint({ onDone }) {
  const gen = () => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * 3)];
    let a = Math.floor(Math.random() * 12) + 1, b = Math.floor(Math.random() * 12) + 1;
    if (op === '-' && a < b) [a, b] = [b, a];
    return { q: `${a} ${op} ${b}`, ans: op === '+' ? a + b : op === '-' ? a - b : a * b };
  };
  const [probs] = useState(() => Array.from({ length: 10 }, gen));
  const [idx, setIdx] = useState(0);
  const [val, setVal] = useState('');
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState(null);
  const ref = useRef();
  useEffect(() => { ref.current?.focus(); }, [idx]);

  const submit = () => {
    const ok = parseInt(val) === probs[idx].ans;
    setFlash(ok ? 'ok' : 'no');
    if (ok) setScore(s => s + 1);
    setTimeout(() => { setFlash(null); setVal(''); if (idx + 1 >= probs.length) { setDone(true); logGame(); addXp(score >= 8 ? 55 : score >= 5 ? 35 : 15); } else setIdx(i => i + 1); }, 500);
  };

  if (done) return <Result ok={score >= 6} xp={score >= 8 ? 55 : score >= 5 ? 35 : 15} msg={`${score}/${probs.length} correct`} onDone={onDone} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {probs.map((_, i) => <div key={i} style={{ width: 18, height: 5, borderRadius: 2, background: i < idx ? 'var(--g-teal)' : i === idx ? 'var(--g-gold)' : 'rgba(255,255,255,0.1)' }} />)}
      </div>
      <div className="game-display" style={{ fontSize: 38, borderColor: flash === 'ok' ? 'var(--g-teal)' : flash === 'no' ? '#FF7043' : undefined, letterSpacing: 4 }}>{probs[idx].q} = ?</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <input ref={ref} className="game-input" style={{ width: 120, borderColor: flash === 'ok' ? 'var(--g-teal)' : flash === 'no' ? '#FF7043' : undefined }} type="number" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && val && submit()} data-testid="math-sprint-input" autoFocus />
        <button className="btn-g" onClick={submit} disabled={!val}>→</button>
      </div>
    </div>
  );
}

const FOCUS_WORDS = ['clarity', 'focus', 'breathe', 'present', 'calm', 'purpose', 'flow', 'mindful', 'grow'];
function scramble(w) { return w.split('').sort(() => Math.random() - 0.5).join(''); }

function WordScramble({ onDone }) {
  const [words] = useState(() => FOCUS_WORDS.sort(() => Math.random() - 0.5).slice(0, 5));
  const [idx, setIdx] = useState(0);
  const [val, setVal] = useState('');
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState(null);
  const ref = useRef();
  useEffect(() => { ref.current?.focus(); }, [idx]);

  const submit = () => {
    const ok = val.trim().toLowerCase() === words[idx];
    setFlash(ok ? 'ok' : 'no');
    if (ok) setScore(s => s + 1);
    setTimeout(() => { setFlash(null); setVal(''); if (idx + 1 >= words.length) { setDone(true); logGame(); addXp(score >= 4 ? 55 : 30); } else setIdx(i => i + 1); }, 500);
  };

  if (done) return <Result ok={score >= 3} xp={score >= 4 ? 55 : 30} msg={`${score}/${words.length} unscrambled`} onDone={onDone} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <p style={{ fontSize: 13, color: 'var(--g-muted)' }}>Word {idx + 1} of {words.length}</p>
      <div className="game-display" style={{ fontSize: 42, letterSpacing: 6, textTransform: 'uppercase' }}>{scramble(words[idx])}</div>
      <input ref={ref} className="game-input" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && val && submit()} placeholder="Unscramble..." style={{ borderColor: flash === 'ok' ? 'var(--g-teal)' : flash === 'no' ? '#FF7043' : undefined }} data-testid="word-scramble-input" autoFocus />
      <button className="btn-g" onClick={submit} disabled={!val.trim()}>Submit</button>
    </div>
  );
}

function RapidTap({ onDone }) {
  const [phase, setPhase] = useState('ready');
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [count, setCount] = useState(0);
  const [times, setTimes] = useState([]);
  const [lastT, setLastT] = useState(null);
  const TOTAL = 15;

  const newPos = () => setPos({ x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 });

  const tap = () => {
    const now = Date.now();
    if (lastT) setTimes(t => [...t, now - lastT]);
    setLastT(now);
    const next = count + 1;
    setCount(next);
    if (next >= TOTAL) { setPhase('done'); logGame(); addXp(60); }
    else newPos();
  };

  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  if (phase === 'ready') return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <p style={{ fontSize: 14, color: 'var(--g-muted)', marginBottom: 20 }}>Tap the orange dot as fast as it appears, 15 times.</p>
      <button className="btn-g" onClick={() => { setPhase('active'); setLastT(Date.now()); newPos(); }}>Start</button>
    </div>
  );
  if (phase === 'done') return <Result ok avg={avg} xp={60} msg={`Avg reaction: ${avg}ms · ${count}/${TOTAL} taps`} onDone={onDone} />;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="mono" style={{ color: 'var(--g-teal)', fontSize: 14 }}>{count}/{TOTAL}</span>
        <span style={{ fontSize: 12, color: 'var(--g-muted)' }}>{avg > 0 ? `avg ${avg}ms` : 'tap!'}</span>
      </div>
      <div className="dot-arena" onClick={() => {}} data-testid="rapid-tap-arena">
        <div className="rt-dot" onClick={tap} style={{ left: `calc(${pos.x}% - 28px)`, top: `calc(${pos.y}% - 28px)` }} data-testid="rapid-tap-dot" />
      </div>
    </div>
  );
}

function BoxBreathing({ onDone }) {
  const PH = [{ l: 'Breathe In', d: 4 }, { l: 'Hold', d: 4 }, { l: 'Breathe Out', d: 4 }, { l: 'Hold', d: 4 }];
  const [round, setRound] = useState(1);
  const [pi, setPi] = useState(0);
  const [tick, setTick] = useState(4);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setTick(p => {
        if (p <= 1) {
          const ni = (pi + 1) % PH.length;
          setPi(ni);
          if (ni === 0) {
            if (round >= 4) { setDone(true); clearInterval(t); logGame(); addXp(60); return 0; }
            setRound(r => r + 1);
          }
          return PH[ni].d;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [pi, round, done]);

  const scale = pi === 0 ? 1.25 : pi === 2 ? 0.78 : 1;

  if (done) return <Result ok xp={60} msg="4 rounds complete! Your nervous system is balanced." onDone={onDone} />;
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <p style={{ fontSize: 13, color: 'var(--g-muted)' }}>Round {round} of 4</p>
      <div className="breath-g" style={{ transform: `scale(${scale})` }}>
        <div>
          <p className="mono" style={{ fontSize: 36, fontWeight: 800, color: 'var(--g-teal)', lineHeight: 1 }}>{tick}</p>
          <p style={{ fontSize: 13, color: 'rgba(0,212,170,.7)', fontWeight: 600, marginTop: 4 }}>{PH[pi].l}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {PH.map((_, i) => <div key={i} style={{ width: 36, height: 4, borderRadius: 2, background: i === pi ? 'var(--g-teal)' : 'rgba(255,255,255,0.1)' }} />)}
      </div>
    </div>
  );
}

function FlowWriting({ onDone }) {
  const [phase, setPhase] = useState('ready');
  const [text, setText] = useState('');
  const [secs, setSecs] = useState(120);
  const [nudge, setNudge] = useState(false);
  const nudgeT = useRef(null);
  const ref = useRef();

  useEffect(() => {
    if (phase !== 'active') return;
    const t = setInterval(() => setSecs(s => { if (s <= 1) { setPhase('done'); clearInterval(t); logGame(); addXp(70); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const handleChange = (e) => {
    setText(e.target.value);
    setNudge(false);
    clearTimeout(nudgeT.current);
    nudgeT.current = setTimeout(() => setNudge(true), 3500);
  };

  const wc = text.trim().split(/\s+/).filter(Boolean).length;
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  if (phase === 'ready') return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 14, color: 'var(--g-muted)', marginBottom: 20, lineHeight: 1.7 }}>Write freely for 2 minutes. Don't stop, don't edit. Target: 50+ words.</p>
      <button className="btn-g" onClick={() => { setPhase('active'); setTimeout(() => ref.current?.focus(), 50); }}>Start Writing</button>
    </div>
  );
  if (phase === 'done') return <Result ok={wc >= 50} xp={wc >= 50 ? 70 : 35} msg={`${wc} words written — ${wc >= 50 ? 'Flow state achieved!' : 'Keep practising!'}`} onDone={onDone} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="mono" style={{ fontSize: 13, color: wc >= 50 ? 'var(--g-teal)' : 'var(--g-muted)' }}>{wc} words</span>
        <span className="mono" style={{ fontSize: 14, color: secs < 30 ? '#FF7043' : 'var(--g-teal)' }}>{mm}:{ss}</span>
      </div>
      {nudge && <p style={{ fontSize: 12, color: 'var(--g-gold)', fontWeight: 600 }}>Keep writing — don't stop!</p>}
      <textarea ref={ref} className="game-ta" rows={7} value={text} onChange={handleChange} placeholder="Start writing anything — your thoughts, goals, feelings…" data-testid="flow-writing-input" autoFocus />
    </div>
  );
}

const PASSAGES = [
  { text: "Habits are the compound interest of self-improvement. Just as money multiplies through compound interest, the effects of your habits multiply as you repeat them. Tiny changes can grow into remarkable results if you are willing to stick with them for years.", questions: [{ q: "Habits are compared to compound interest", ans: true }, { q: "Results are immediate with habits", ans: false }, { q: "Small changes can lead to remarkable outcomes", ans: true }] },
  { text: "Every action you take is a vote for the type of person you wish to become. No single instance will transform your beliefs, but as the votes build up, so does the evidence of your new identity. This is why habits matter.", questions: [{ q: "Every action is described as a vote", ans: true }, { q: "A single action can transform your identity immediately", ans: false }, { q: "Habits help build evidence of a new identity", ans: true }] },
];

function ComprehensionCheck({ onDone }) {
  const [p] = useState(PASSAGES[Math.floor(Math.random() * PASSAGES.length)]);
  const [phase, setPhase] = useState('read');
  const [secs, setSecs] = useState(15);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (phase !== 'read') return;
    const t = setInterval(() => setSecs(s => { if (s <= 1) { setPhase('quiz'); clearInterval(t); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const submit = () => {
    const sc = p.questions.filter((q, i) => answers[i] === q.ans).length;
    setChecked(true);
    if (sc === p.questions.length) { setTimeout(() => { logGame(); addXp(75); onDone(true); }, 1200); }
    else setTimeout(() => { logGame(); addXp(sc * 20); onDone(sc >= 2); }, 1200);
  };

  if (phase === 'read') return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 13, color: 'var(--g-muted)' }}>Read carefully!</p>
        <span className="mono" style={{ color: 'var(--g-teal)', fontSize: 15 }}>{secs}s</span>
      </div>
      <div style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.18)', borderRadius: 14, padding: 18 }}>
        <p style={{ fontSize: 14, lineHeight: 1.8 }}>{p.text}</p>
      </div>
    </div>
  );

  const score = p.questions.filter((q, i) => answers[i] === q.ans).length;
  if (checked) return <Result ok={score >= 2} xp={score * 25} msg={`${score}/3 correct`} onDone={onDone} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: 13, color: 'var(--g-muted)' }}>True or False — from memory:</p>
      {p.questions.map((q, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 14px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{q.q}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => setAnswers(a => ({ ...a, [i]: v }))} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1.5px solid ${answers[i] === v ? 'var(--g-teal)' : 'var(--g-border)'}`, background: answers[i] === v ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.04)', color: answers[i] === v ? 'var(--g-teal)' : 'var(--g-muted)', cursor: 'pointer', fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 13 }}>{v ? 'True' : 'False'}</button>
            ))}
          </div>
        </div>
      ))}
      <button className="btn-g" onClick={submit} disabled={Object.keys(answers).length < 3}>Submit Answers</button>
    </div>
  );
}

function OneFocus({ onDone }) {
  const [phase, setPhase] = useState('ready');
  const [pos, setPos] = useState({ x: 50, y: 40 });
  const [count, setCount] = useState(0);
  const [secs, setSecs] = useState(45);
  const TOTAL = 8;

  const newPos = useCallback(() => setPos({ x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 }), []);

  useEffect(() => {
    if (phase !== 'active') return;
    const move = setInterval(newPos, 2200);
    const timer = setInterval(() => setSecs(s => { if (s <= 1) { setPhase('done'); clearInterval(move); clearInterval(timer); logGame(); addXp(55); return 0; } return s - 1; }), 1000);
    return () => { clearInterval(move); clearInterval(timer); };
  }, [phase, newPos]);

  const tap = () => {
    const next = count + 1;
    setCount(next);
    if (next >= TOTAL) { setPhase('done'); logGame(); addXp(55); }
    newPos();
  };

  if (phase === 'ready') return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 14, color: 'var(--g-muted)', marginBottom: 20, lineHeight: 1.7 }}>Follow the drifting dot with your eyes and tap it 8 times in 45 seconds.</p>
      <button className="btn-g" onClick={() => setPhase('active')}>Start</button>
    </div>
  );
  if (phase === 'done') return <Result ok={count >= TOTAL} xp={55} msg={count >= TOTAL ? 'Full focus achieved!' : `${count}/${TOTAL} taps`} onDone={onDone} />;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="mono" style={{ color: 'var(--g-teal)', fontSize: 14 }}>{count}/{TOTAL} taps</span>
        <span className="mono" style={{ color: secs < 10 ? '#FF7043' : 'var(--g-muted)', fontSize: 14 }}>{secs}s</span>
      </div>
      <div className="dot-arena" data-testid="one-focus-arena">
        <div className="dot-target" onClick={tap} style={{ left: `calc(${pos.x}% - 26px)`, top: `calc(${pos.y}% - 26px)`, transition: 'left 2s ease, top 2s ease' }} data-testid="focus-dot" />
      </div>
    </div>
  );
}

const FOCUS_WDS = ['breathe', 'focus', 'calm', 'flow', 'clarity', 'present', 'mindful', 'peace', 'grow', 'still'];
const NOISE_WDS = ['email', 'scroll', 'urgent', 'later', 'busy', 'worry', 'hurry', 'multitask', 'distract', 'rush'];

function WordFilter({ onDone }) {
  const [words] = useState(() => {
    const fw = FOCUS_WDS.sort(() => Math.random() - 0.5).slice(0, 10);
    const nw = NOISE_WDS.sort(() => Math.random() - 0.5).slice(0, 10);
    return [...fw.map(w => ({ w, isFocus: true })), ...nw.map(w => ({ w, isFocus: false }))].sort(() => Math.random() - 0.5);
  });
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => { setShow(false); setTimeout(() => { if (idx + 1 >= words.length) { setDone(true); logGame(); addXp(score >= 16 ? 60 : 35); } else { setIdx(i => i + 1); setShow(true); } }, 400); }, 1600);
    return () => clearTimeout(t);
  }, [idx, done]);

  const tap = () => {
    if (words[idx].isFocus) setScore(s => s + 1);
    setShow(false);
    setTimeout(() => { if (idx + 1 >= words.length) { setDone(true); logGame(); addXp(score >= 16 ? 60 : 35); } else { setIdx(i => i + 1); setShow(true); } }, 150);
  };

  if (done) return <Result ok={score >= 14} xp={score >= 16 ? 60 : 35} msg={`${score}/10 focus words caught`} onDone={onDone} />;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="mono" style={{ fontSize: 13, color: 'var(--g-muted)' }}>{idx + 1}/{words.length}</span>
        <span style={{ fontSize: 12, color: 'var(--g-teal)', fontWeight: 700 }}>Tap FOCUS words only</span>
        <span className="mono" style={{ fontSize: 13, color: 'var(--g-gold)' }}>{score} caught</span>
      </div>
      <div className="word-flash" style={{ opacity: show ? 1 : 0, transition: 'opacity .15s' }}>{words[idx]?.w}</div>
      <button className="btn-g" onClick={tap} style={{ fontSize: 16, padding: '14px 36px' }} data-testid="word-filter-tap">TAP if FOCUS</button>
      <p style={{ fontSize: 12, color: 'var(--g-muted2)', marginTop: 10 }}>Ignore noise words — they disappear automatically</p>
    </div>
  );
}

const SEQ_COLORS = [{ bg: '#00D4AA', shadow: 'rgba(0,212,170,0.6)' }, { bg: '#FFD54F', shadow: 'rgba(255,213,79,0.6)' }, { bg: '#81C784', shadow: 'rgba(129,199,132,0.6)' }, { bg: '#8B5CF6', shadow: 'rgba(139,92,246,0.6)' }];

function SequenceRepeat({ onDone }) {
  const [lvl, setLvl] = useState(3);
  const [seq, setSeq] = useState([]);
  const [phase, setPhase] = useState('watch');
  const [showing, setShowing] = useState(-1);
  const [input, setInput] = useState([]);
  const [failed, setFailed] = useState(false);

  const genSeq = useCallback((n) => Array.from({ length: n }, () => Math.floor(Math.random() * 4)), []);

  useEffect(() => {
    const s = genSeq(lvl);
    setSeq(s); setPhase('watch'); setInput([]);
    let i = 0;
    const show = () => {
      if (i >= s.length) { setTimeout(() => setPhase('input'), 600); return; }
      setShowing(s[i]);
      setTimeout(() => { setShowing(-1); setTimeout(() => { i++; show(); }, 300); }, 600);
    };
    const t = setTimeout(show, 400);
    return () => clearTimeout(t);
  }, [lvl, genSeq]);

  const tap = (ci) => {
    if (phase !== 'input') return;
    const ni = [...input, ci];
    setInput(ni);
    if (ci !== seq[ni.length - 1]) { setFailed(true); setPhase('done'); logGame(); addXp(lvl > 3 ? 65 : 35); return; }
    if (ni.length === seq.length) {
      if (lvl >= 7) { setPhase('done'); setFailed(false); logGame(); addXp(65); }
      else setTimeout(() => setLvl(l => l + 1), 800);
    }
  };

  if (phase === 'done') return <Result ok={!failed} xp={lvl > 3 ? 65 : 35} msg={failed ? `Reached level ${lvl}` : 'All 7 sequences complete!'} onDone={onDone} />;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--g-muted)' }}>{phase === 'watch' ? 'Watch the sequence…' : 'Your turn!'}</span>
        <span className="mono" style={{ color: 'var(--g-teal)', fontSize: 14 }}>Level {lvl - 2}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 200, margin: '0 auto 16px' }}>
        {SEQ_COLORS.map((c, i) => (
          <div key={i} className="seq-tile" onClick={() => tap(i)} style={{ background: c.bg, boxShadow: showing === i ? `0 0 20px ${c.shadow}` : 'none', opacity: showing === i ? 1 : 0.45, cursor: phase === 'input' ? 'pointer' : 'default' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        {seq.map((_, i) => <div key={i} style={{ width: 14, height: 6, borderRadius: 3, background: i < input.length ? 'var(--g-teal)' : 'rgba(255,255,255,0.1)' }} />)}
      </div>
    </div>
  );
}

const EXERCISES = [
  { name: 'Squats', emoji: '🦵', tip: 'Feet shoulder-width apart, knees over toes' },
  { name: 'Push-ups', emoji: '💪', tip: 'Keep your core tight and elbows at 45°' },
  { name: 'Jumping Jacks', emoji: '⚡', tip: 'Full arm extension, land softly' },
];

function TenRep({ onDone }) {
  const [ex] = useState(EXERCISES[Math.floor(Math.random() * EXERCISES.length)]);
  const [reps, setReps] = useState(0);
  const [done, setDone] = useState(false);

  const tap = () => {
    const n = reps + 1; setReps(n);
    if (n >= 10) { setDone(true); logGame(); addXp(50); }
  };

  if (done) return <Result ok xp={50} msg={`10 ${ex.name} complete!`} onDone={onDone} />;
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ fontSize: 48 }}>{ex.emoji}</div>
      <p className="fh" style={{ fontSize: 22, fontWeight: 700 }}>{ex.name}</p>
      <p style={{ fontSize: 13, color: 'var(--g-muted)' }}>{ex.tip}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 260 }}>
        {Array.from({ length: 10 }, (_, i) => <div key={i} style={{ width: 40, height: 40, borderRadius: 10, background: i < reps ? 'var(--g-teal)' : 'rgba(255,255,255,0.07)', border: `1px solid ${i < reps ? 'var(--g-teal)' : 'var(--g-border)'}`, color: i < reps ? '#0A0E1A' : 'var(--g-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, transition: 'all .2s', fontSize: 14 }}>{i + 1}</div>)}
      </div>
      <button className="btn-g" onClick={tap} style={{ fontSize: 18, padding: '18px 44px' }} data-testid="ten-rep-tap">Rep {reps + 1} — TAP!</button>
    </div>
  );
}

const STRETCHES = [
  { name: 'Neck Roll', emoji: '🔄', tip: 'Slowly roll your head in circles. Keep it gentle.' },
  { name: 'Shoulder Shrug', emoji: '🤷', tip: 'Shrug up to ears, hold, then drop. Release tension.' },
  { name: 'Chest Opener', emoji: '🙌', tip: 'Clasp hands behind you, open chest, hold tall.' },
  { name: 'Forward Fold', emoji: '🙇', tip: 'Stand and reach for your toes. Breathe deeply.' },
];

function StretchReset({ onDone }) {
  const [idx, setIdx] = useState(0);
  const [secs, setSecs] = useState(12);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setSecs(s => {
      if (s <= 1) {
        if (idx + 1 >= STRETCHES.length) { setDone(true); clearInterval(t); logGame(); addXp(55); return 0; }
        setIdx(i => i + 1); return 12;
      }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [idx, done]);

  if (done) return <Result ok xp={55} msg="All 4 stretches complete. Your body is reset!" onDone={onDone} />;
  const pct = (secs / 12) * 100;
  const r = 50; const circ = 2 * Math.PI * r;

  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <p style={{ fontSize: 12, color: 'var(--g-muted)' }}>{idx + 1}/{STRETCHES.length}</p>
      <div style={{ fontSize: 48 }}>{STRETCHES[idx].emoji}</div>
      <p className="fh" style={{ fontSize: 22, fontWeight: 700 }}>{STRETCHES[idx].name}</p>
      <p style={{ fontSize: 13, color: 'var(--g-muted)', maxWidth: 280, lineHeight: 1.65 }}>{STRETCHES[idx].tip}</p>
      <svg className="stretch-ring" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--g-teal)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 4px var(--g-teal))' }} />
        <text x="60" y="64" textAnchor="middle" fill="var(--g-teal)" fontSize="24" fontWeight="800" fontFamily="JetBrains Mono">{secs}</text>
      </svg>
    </div>
  );
}

function EnergySurge({ onDone }) {
  const [phase, setPhase] = useState('before');
  const [before, setBefore] = useState(null);
  const [after, setAfter] = useState(null);
  const [secs, setSecs] = useState(20);

  useEffect(() => {
    if (phase !== 'burst') return;
    const t = setInterval(() => setSecs(s => { if (s <= 1) { setPhase('after'); clearInterval(t); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const EnergyPicker = ({ label, onPick }) => (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{label}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map(v => (
          <button key={v} className="energy-btn" onClick={() => onPick(v)}>{Array(v).fill('⚡').join('')}</button>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'var(--g-muted2)', marginTop: 10 }}>1 = drained · 5 = fully charged</p>
    </div>
  );

  if (phase === 'before') return <EnergyPicker label="Rate your energy RIGHT NOW:" onPick={v => { setBefore(v); setPhase('burst'); }} />;
  if (phase === 'burst') return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div className="mono" style={{ fontSize: 52, fontWeight: 800, color: '#FF7043' }}>{secs}s</div>
      <p className="fh" style={{ fontSize: 22, fontWeight: 700 }}>Jumping Jacks!</p>
      <p style={{ fontSize: 13, color: 'var(--g-muted)' }}>Go as fast as you can for 20 seconds.</p>
      <p style={{ fontSize: 28 }}>⚡</p>
    </div>
  );
  if (phase === 'after') return <EnergyPicker label="Rate your energy NOW:" onPick={v => { setAfter(v); setPhase('done'); logGame(); addXp(60); }} />;

  const delta = after - before;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{delta > 0 ? '🚀' : delta === 0 ? '👌' : '😴'}</div>
      <p className="fh" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Energy shift: {delta > 0 ? '+' : ''}{delta}</p>
      <p style={{ color: 'var(--g-muted)', marginBottom: 20, lineHeight: 1.65 }}>{delta > 0 ? 'Your body responded! Exercise boosts focus.' : delta === 0 ? 'Maintained — good baseline!' : 'Rest may be more valuable right now.'}</p>
      <div className="xp-pill" style={{ margin: '0 auto 20px' }}>+60 XP earned</div>
      <button className="btn-g" onClick={() => onDone(true)}>Continue</button>
    </div>
  );
}

// ─── Shared Result Component ─────────────────────────────

function Result({ ok, xp, msg, onDone }) {
  return (
    <div style={{ textAlign: 'center', padding: '16px 0', animation: 'g-appear .4s ease' }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>{ok ? '🎉' : '💪'}</div>
      <p className="fh" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{ok ? 'Well done!' : 'Keep practising!'}</p>
      <p style={{ color: 'var(--g-muted)', marginBottom: 16, lineHeight: 1.65 }}>{msg}</p>
      {xp > 0 && <div className="xp-pill" style={{ margin: '0 auto 20px' }}>+{xp} XP earned</div>}
      <button className="btn-g" onClick={() => onDone(ok)} data-testid="result-done">Continue →</button>
    </div>
  );
}

// ─── Challenge definitions ───────────────────────────────

const CHALLENGES = [
  {
    id: 'memory', title: 'Memory Recall', icon: '🧠', color: '#FF7043',
    desc: 'Train short-term memory with digits, quotes, and colour patterns.',
    games: [
      { id: 'number-flash', title: 'Number Flash', desc: 'Memorise 6 digits for 5 seconds, then recall them.', xp: 60, free: true, Component: NumberFlash },
      { id: 'quote-recall', title: 'Quote Recall', desc: 'Read a motivational quote, then type it back verbatim.', xp: 75, free: false, Component: QuoteRecall },
      { id: 'colour-pattern', title: 'Colour Pattern', desc: 'Memorise a 4×4 colour grid, then recreate it.', xp: 80, free: false, Component: ColourPattern },
    ]
  },
  {
    id: 'speed', title: 'Speed Focus', icon: '⚡', color: '#00D4AA',
    desc: 'Sharpen processing speed with maths, word unscrambling, and reaction tests.',
    games: [
      { id: 'math-sprint', title: 'Math Sprint', desc: 'Solve 10 arithmetic problems as fast as possible.', xp: 55, free: true, Component: MathSprint },
      { id: 'word-scramble', title: 'Word Scramble', desc: 'Unscramble 5 focus words against the clock.', xp: 55, free: false, Component: WordScramble },
      { id: 'rapid-tap', title: 'Rapid Tap', desc: 'Tap 15 targets the instant they appear. Measure your reaction.', xp: 60, free: false, Component: RapidTap },
    ]
  },
  {
    id: 'deep', title: 'Deep Work Sprint', icon: '🌊', color: '#8B5CF6',
    desc: 'Build the ability to enter deep focus states through breathing and writing.',
    games: [
      { id: 'box-breathing', title: 'Box Breathing', desc: '4-4-4-4 breathing for 4 rounds to calm and focus.', xp: 60, free: true, Component: BoxBreathing },
      { id: 'flow-writing', title: 'Flow Writing', desc: 'Write freely for 2 minutes without stopping. Target: 50 words.', xp: 70, free: false, Component: FlowWriting },
      { id: 'comprehension', title: 'Comprehension Check', desc: 'Read a passage for 15 seconds, then answer 3 true/false questions.', xp: 75, free: false, Component: ComprehensionCheck },
    ]
  },
  {
    id: 'single', title: 'Single Tab Rule', icon: '🎯', color: '#4CAF50',
    desc: 'Train selective attention — follow, filter, and sequence.',
    games: [
      { id: 'one-focus', title: 'One Focus', desc: 'Follow a drifting dot and tap it 8 times in 45 seconds.', xp: 55, free: true, Component: OneFocus },
      { id: 'word-filter', title: 'Word Filter', desc: 'Flash words: tap only the focus words, ignore noise.', xp: 60, free: false, Component: WordFilter },
      { id: 'sequence-repeat', title: 'Sequence Repeat', desc: 'Watch a colour sequence flash and repeat it exactly.', xp: 65, free: false, Component: SequenceRepeat },
    ]
  },
  {
    id: 'workout', title: 'Micro Workout', icon: '💪', color: '#FFD54F',
    desc: 'Quick physical resets that energise brain and body.',
    games: [
      { id: 'ten-rep', title: '10 Rep Challenge', desc: 'Choose an exercise and complete 10 mindful reps.', xp: 50, free: true, Component: TenRep },
      { id: 'stretch-reset', title: 'Stretch & Reset', desc: 'Four guided stretches, 12 seconds each.', xp: 55, free: false, Component: StretchReset },
      { id: 'energy-surge', title: 'Energy Surge', desc: 'Rate energy, do a 20-second burst, see the shift.', xp: 60, free: false, Component: EnergySurge },
    ]
  },
];

const AI_TIPS = [
  'Your energy peaks mid-morning — try Speed Focus now',
  'Deep Work Sprint has the highest focus ROI for your profile',
  'Based on your history, avoid multitasking before noon',
];

// ─── Main Page ───────────────────────────────────────────

export default function ConcentrationGamesPage() {
  const [screen, setScreen] = useState('home');
  const [selCh, setSelCh] = useState(null);
  const [selGame, setSelGame] = useState(null);
  const navigate = useNavigate();
  const { xp, level, pct } = getLvl();
  const isPro = IS_PRO();
  const recommended = CHALLENGES[2]; // Deep Work Sprint as default AI recommendation

  const handleGameDone = (ok) => setScreen('result');
  const back = () => { setScreen(screen === 'game' ? 'challenge' : 'home'); setSelGame(null); };

  const selectGame = (g) => {
    if (!g.free && !isPro) { navigate('/pricing'); return; }
    setSelGame(g); setScreen('game');
  };

  const GameComp = selGame?.Component;

  return (
    <div className="games-s" data-testid="concentration-games-page">
      {/* Background */}
      <div className="g-orb" style={{ left: '-10%', top: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent)', filter: 'blur(60px)', animationDuration: '15s' }} />
      <div className="g-orb" style={{ left: '70%', top: '50%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,212,170,0.1), transparent)', filter: 'blur(60px)', animationDuration: '19s', animationDelay: '3s' }} />
      <div className="g-orb" style={{ left: '40%', top: '80%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,112,67,0.08), transparent)', filter: 'blur(50px)', animationDuration: '13s', animationDelay: '1s' }} />
      <div className="g-grid" />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 80px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <section style={{ paddingTop: 44, paddingBottom: 28 }} className="au">
          <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, color: 'var(--g-teal)', marginBottom: 8 }}>Focus Challenges</p>
          <h1 className="fh" style={{ fontSize: 40, fontWeight: 700, marginBottom: 4 }}>Concentration <span style={{ background: 'linear-gradient(90deg, var(--g-teal), var(--g-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Games</span></h1>
          <p style={{ fontSize: 14, color: 'var(--g-muted)' }}>Train your focus. Earn XP. Level up.</p>
        </section>

        {screen === 'home' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }} className="games-layout">
            <div>
              {/* AI Insight Banner */}
              <div className="ai-banner au" style={{ marginBottom: 18, animationDelay: '.05s' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🧠</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--g-purple)', marginBottom: 4 }}>AI Insight</p>
                  <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.6 }}>Based on your focus patterns, we recommend <strong style={{ color: 'var(--g-teal)' }}>Deep Work Sprint</strong> first today · <span style={{ color: '#FF9E80' }}>87% success predicted</span></p>
                </div>
                <div style={{ fontSize: 22, color: 'var(--g-teal)', flexShrink: 0 }}>↗</div>
              </div>

              {/* XP Level bar */}
              <div className="level-bar au" style={{ marginBottom: 20, animationDelay: '.1s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ padding: '3px 10px', borderRadius: 99, background: 'rgba(0,212,170,0.18)', border: '1px solid rgba(0,212,170,0.3)', fontSize: 12, fontWeight: 800, color: 'var(--g-teal)' }}>L{level}</div>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>Level {level}</span>
                  </div>
                  <span className="mono" style={{ fontSize: 14, fontWeight: 800, color: 'var(--g-gold)' }}>{xp} XP</span>
                </div>
                <div className="xp-bar-track"><div className="xp-bar-fill" style={{ width: `${pct}%` }} /></div>
                <p style={{ fontSize: 11, color: 'var(--g-muted2)', marginTop: 6 }}>{500 - (xp % 500)} XP to Level {level + 1}</p>
              </div>

              {/* Challenges */}
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--g-muted2)', marginBottom: 12 }}>Today's Challenges</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {CHALLENGES.map((ch, i) => {
                  const freeCount = ch.games.filter(g => g.free).length;
                  const proCount = ch.games.filter(g => !g.free).length;
                  const totalXp = ch.games.reduce((s, g) => s + g.xp, 0);
                  const isRec = ch.id === recommended.id;
                  return (
                    <div key={ch.id} className={`ch-card au${isRec ? ' featured' : ''}`} style={{ '--ch-color': ch.color, animationDelay: `${i * .07}s` }} onClick={() => { setSelCh(ch); setScreen('challenge'); }} data-testid={`challenge-${ch.id}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div className="ch-icon" style={{ '--ch-color': ch.color }}>{ch.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                            {isRec && <span className="pill pill-ai">AI Recommended</span>}
                            <span style={{ fontSize: 16, fontWeight: 800 }}>{ch.title}</span>
                            <span className="pill pill-free">{freeCount} free</span>
                            {proCount > 0 && <span className="pill pill-pro">{proCount} pro{isPro ? ' ✓' : ''}</span>}
                            <span className="xp-pill">+{totalXp}</span>
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--g-muted)' }}>{ch.games.length} games · tap to choose</p>
                        </div>
                        {/* Mini sparkline */}
                        <svg width="60" height="24" style={{ flexShrink: 0, opacity: 0.6 }}>
                          <polyline points="0,20 15,14 30,16 45,8 60,12" fill="none" stroke={ch.color} strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Coach sidebar */}
            <div className="au" style={{ animationDelay: '.15s' }}>
              <div className="coach-card">
                <div className="coach-icon">🤖</div>
                <h3 className="fh" style={{ fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 14 }}>AI Coach</h3>
                {AI_TIPS.map((t, i) => <p key={i} className="coach-tip">{t}</p>)}
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <input className="coach-input" placeholder="Ask AI Coach…" readOnly />
                  <Link to="/coach"><button className="coach-send"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0E1A" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg></button></Link>
                </div>
                <p style={{ fontSize: 10, color: 'var(--g-muted2)', textAlign: 'center', marginTop: 8 }}>Powered by Gemini AI</p>
              </div>
            </div>
          </div>
        )}

        {screen === 'challenge' && selCh && (
          <div className="au">
            <button className="back-btn" onClick={back} style={{ marginBottom: 24 }}>← Back to challenges</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <div className="ch-icon" style={{ '--ch-color': selCh.color, width: 56, height: 56, borderRadius: 18, fontSize: 26 }}>{selCh.icon}</div>
              <div>
                <h2 className="fh" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{selCh.title}</h2>
                <p style={{ fontSize: 13, color: 'var(--g-muted)' }}>{selCh.desc}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {selCh.games.map(g => (
                <div key={g.id} style={{ position: 'relative', cursor: g.free || isPro ? 'pointer' : 'default' }}>
                  <div className="g-card" style={{ padding: '20px', transition: 'all .25s', ...(g.free || isPro ? { cursor: 'pointer' } : {}) }} onClick={() => selectGame(g)} data-testid={`game-${g.id}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span className={`pill ${g.free ? 'pill-free' : 'pill-pro'}`}>{g.free ? 'Free' : '✦ Pro'}</span>
                      <span className="xp-pill">+{g.xp} XP</span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6, color: g.free || isPro ? 'var(--g-text)' : 'var(--g-muted)' }}>{g.title}</h3>
                    <p style={{ fontSize: 12, color: 'var(--g-muted)', lineHeight: 1.6, marginBottom: 14 }}>{g.desc}</p>
                    <button className="btn-g" style={{ width: '100%', padding: '10px', fontSize: 13, background: g.free || isPro ? undefined : 'rgba(255,255,255,0.08)', color: g.free || isPro ? undefined : 'var(--g-muted)', boxShadow: g.free || isPro ? undefined : 'none' }}>
                      {g.free || isPro ? 'Play →' : '🔒 Pro'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {!isPro && <div style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(255,213,79,0.07)', border: '1px solid rgba(255,213,79,0.2)', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--g-gold)' }}>Unlock all 15 games with Pro</p>
                <p style={{ fontSize: 12, color: 'var(--g-muted)' }}>7-day free trial · cancel anytime</p>
              </div>
              <Link to="/pricing"><button className="btn-g" style={{ padding: '9px 20px', fontSize: 12 }}>Upgrade →</button></Link>
            </div>}
          </div>
        )}

        {screen === 'game' && selGame && (
          <div className="au">
            <button className="back-btn" onClick={back} style={{ marginBottom: 20 }}>← Back</button>
            <div className="game-wrap">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h2 className="fh" style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{selGame.title}</h2>
                  <p style={{ fontSize: 12, color: 'var(--g-muted)' }}>{selGame.desc}</p>
                </div>
                <span className="xp-pill">+{selGame.xp} XP</span>
              </div>
              <GameComp onDone={handleGameDone} />
            </div>
          </div>
        )}

        {screen === 'result' && (
          <div className="au" style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🌟</div>
            <h2 className="fh" style={{ fontSize: 30, fontWeight: 700, marginBottom: 12, color: 'var(--g-text)' }}>Keep the streak going!</h2>
            <p style={{ color: 'var(--g-muted)', marginBottom: 28, lineHeight: 1.7 }}>Every game makes your focus stronger. Play another or check your Hub.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-g" onClick={() => { setScreen('home'); setSelCh(null); setSelGame(null); }} data-testid="play-again">Play Another</button>
              <Link to="/"><button className="btn-g-o">Go to Home</button></Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
