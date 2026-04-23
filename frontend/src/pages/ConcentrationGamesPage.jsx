import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './shared-pages.css';

const CONC_KEY = 'alu_concentration';
const XP_KEY = 'alu_xp';

const addXp = (amount) => {
  const cur = parseInt(localStorage.getItem(XP_KEY) || '0');
  localStorage.setItem(XP_KEY, String(cur + amount));
};

const logGame = () => {
  const today = new Date().toISOString().split('T')[0];
  const data = JSON.parse(localStorage.getItem(CONC_KEY) || '{}');
  data[today] = (data[today] || 0) + 1;
  localStorage.setItem(CONC_KEY, JSON.stringify(data));
};

const getLevel = () => {
  const xp = parseInt(localStorage.getItem(XP_KEY) || '0');
  return { xp, level: Math.floor(xp / 500) + 1, toNext: 500 - (xp % 500) };
};

// ─── Games ─────────────────────────────────────────────

function NumberFlash({ onComplete }) {
  const [phase, setPhase] = useState('show'); // show | input | result
  const [nums, setNums] = useState('');
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    const n = String(Math.floor(1000 + Math.random() * 9000));
    setNums(n);
    const t = setTimeout(() => { setPhase('input'); setTimeout(() => inputRef.current?.focus(), 100); }, 3000);
    return () => clearTimeout(t);
  }, []);

  const check = () => {
    const ok = input.trim() === nums;
    setCorrect(ok);
    setPhase('result');
    if (ok) { addXp(50); logGame(); }
  };

  if (phase === 'show') return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginBottom: 24, fontWeight: 600 }}>Memorise this number — it disappears in 3 seconds</p>
      <div className="game-display">{nums}</div>
    </div>
  );

  if (phase === 'input') return (
    <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>What was the number?</p>
      <input ref={inputRef} className="game-input-lg" type="number" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} placeholder="____" data-testid="number-flash-input" autoFocus />
      <button className="btn-p" onClick={check} data-testid="number-flash-submit">Submit</button>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>{correct ? '🎉' : '😅'}</div>
      <h3 className="fh" style={{ fontSize: 24, marginBottom: 8 }}>{correct ? 'Perfect memory!' : 'Close!'}</h3>
      <p style={{ color: 'var(--muted-fg)', marginBottom: 8 }}>The number was <strong>{nums}</strong> · You entered <strong>{input}</strong></p>
      {correct && <div className="xp-badge" style={{ margin: '0 auto 20px' }}>+50 XP earned</div>}
      <button className="btn-p" onClick={() => onComplete(correct)} data-testid="number-flash-done">Continue</button>
    </div>
  );
}

function MathSprint({ onComplete }) {
  const gen = () => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * 3)];
    let a = Math.floor(Math.random() * 12) + 1;
    let b = Math.floor(Math.random() * 12) + 1;
    if (op === '-') { if (a < b) [a, b] = [b, a]; }
    const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
    return { q: `${a} ${op} ${b}`, ans };
  };

  const [problems] = useState(() => Array.from({ length: 8 }, gen));
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, [idx]);

  const submit = () => {
    const ok = parseInt(input) === problems[idx].ans;
    setFeedback(ok ? 'correct' : 'wrong');
    if (ok) setScore(s => s + 1);
    setTimeout(() => {
      setFeedback(null); setInput('');
      if (idx + 1 >= problems.length) { setDone(true); logGame(); addXp(score >= 6 ? 80 : score >= 4 ? 50 : 25); }
      else setIdx(i => i + 1);
    }, 600);
  };

  if (done) return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>{score >= 6 ? '🏆' : score >= 4 ? '👍' : '📚'}</div>
      <h3 className="fh" style={{ fontSize: 24, marginBottom: 8 }}>{score}/{problems.length} correct</h3>
      <p style={{ color: 'var(--muted-fg)', marginBottom: 16 }}>{score >= 6 ? 'Excellent mental math!' : score >= 4 ? 'Good effort!' : 'Keep practising!'}</p>
      <div className="xp-badge" style={{ margin: '0 auto 24px' }}>+{score >= 6 ? 80 : score >= 4 ? 50 : 25} XP earned</div>
      <button className="btn-p" onClick={() => onComplete(true)} data-testid="math-sprint-done">Continue</button>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {problems.map((_, i) => <div key={i} style={{ width: 20, height: 6, borderRadius: 3, background: i < idx ? 'var(--primary)' : i === idx ? 'var(--accent-d)' : 'var(--muted)' }} />)}
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>Problem {idx + 1} of {problems.length}</p>
      <div className="game-display" style={{ fontSize: 42, letterSpacing: 4 }}>{problems[idx].q} = ?</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input ref={inputRef} className="game-input-lg" style={{ width: 140, borderColor: feedback === 'correct' ? 'var(--primary)' : feedback === 'wrong' ? '#ef4444' : 'var(--border)' }}
          type="number" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && input && submit()} placeholder="?" data-testid="math-sprint-input" autoFocus />
        <button className="btn-p" onClick={submit} disabled={!input} data-testid="math-sprint-submit">→</button>
      </div>
    </div>
  );
}

function BoxBreathing({ onComplete }) {
  const PHASES = [{ label: 'Breathe In', dur: 4 }, { label: 'Hold', dur: 4 }, { label: 'Breathe Out', dur: 4 }, { label: 'Hold', dur: 4 }];
  const [round, setRound] = useState(1);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [tick, setTick] = useState(PHASES[0].dur);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setTick(prev => {
        if (prev <= 1) {
          const nextPhase = (phaseIdx + 1) % PHASES.length;
          setPhaseIdx(nextPhase);
          if (nextPhase === 0) {
            if (round >= 4) { setDone(true); clearInterval(t); logGame(); addXp(70); return 0; }
            setRound(r => r + 1);
          }
          return PHASES[nextPhase].dur;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phaseIdx, round, done]);

  const phase = PHASES[phaseIdx];
  const scale = (phaseIdx === 0) ? 1.2 : (phaseIdx === 2) ? 0.8 : 1;
  const progress = (tick / phase.dur);

  if (done) return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🌊</div>
      <h3 className="fh" style={{ fontSize: 24, marginBottom: 8 }}>4 rounds complete!</h3>
      <p style={{ color: 'var(--muted-fg)', marginBottom: 16 }}>Your nervous system is now calmer and more focused.</p>
      <div className="xp-badge" style={{ margin: '0 auto 24px' }}>+70 XP earned</div>
      <button className="btn-p" onClick={() => onComplete(true)} data-testid="breathing-done">Continue</button>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>Round {round} of 4</p>
      <div className="breath-circle" style={{ transform: `scale(${scale})` }}>
        <div>
          <p className="mono" style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{tick}</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', fontWeight: 600, marginTop: 4 }}>{phase.label}</p>
        </div>
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{phase.label}</p>
      <div style={{ display: 'flex', gap: 4 }}>
        {PHASES.map((_, i) => <div key={i} style={{ width: 40, height: 4, borderRadius: 2, background: i === phaseIdx ? 'var(--primary)' : 'var(--muted)' }} />)}
      </div>
    </div>
  );
}

function OneFocus({ onComplete }) {
  const [task, setTask] = useState('');
  const [started, setStarted] = useState(false);
  const [secs, setSecs] = useState(5 * 60);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!started || done) return;
    const t = setInterval(() => setSecs(s => { if (s <= 1) { setDone(true); clearInterval(t); logGame(); addXp(60); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, [started, done]);

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  if (done) return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🎯</div>
      <h3 className="fh" style={{ fontSize: 24, marginBottom: 8 }}>Focus session complete!</h3>
      <p style={{ color: 'var(--muted-fg)', marginBottom: 8 }}>You focused on: <strong>{task}</strong></p>
      <div className="xp-badge" style={{ margin: '0 auto 24px' }}>+60 XP earned</div>
      <button className="btn-p" onClick={() => onComplete(true)} data-testid="focus-done">Continue</button>
    </div>
  );

  if (!started) return (
    <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', maxWidth: 360 }}>Name the ONE thing you will focus on for the next 5 minutes. No switching allowed.</p>
      <input className="fi" style={{ maxWidth: 360, textAlign: 'center' }} value={task} onChange={e => setTask(e.target.value)} placeholder="I will focus on..." data-testid="focus-task-input" autoFocus />
      <button className="btn-p" onClick={() => setStarted(true)} disabled={!task.trim()} data-testid="focus-start">Start Focus Session</button>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginBottom: 12 }}>Focusing on:</p>
      <p className="fh" style={{ fontSize: 20, fontWeight: 700, marginBottom: 28, color: 'var(--fg)' }}>"{task}"</p>
      <div style={{ fontSize: 64, fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: 'var(--primary)', marginBottom: 24 }}>{mm}:{ss}</div>
      <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>Stay on this task. Do not open other tabs.</p>
      <button onClick={() => { setDone(true); logGame(); addXp(30); }} style={{ marginTop: 24, fontSize: 12, color: 'var(--muted-fg)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Manrope,sans-serif' }}>End early</button>
    </div>
  );
}

function TenRep({ onComplete }) {
  const EXERCISES = ['Push-ups', 'Squats', 'Jumping jacks', 'Lunges', 'Arm circles'];
  const [exercise] = useState(EXERCISES[Math.floor(Math.random() * EXERCISES.length)]);
  const [reps, setReps] = useState(0);
  const [done, setDone] = useState(false);

  const tap = () => {
    const next = reps + 1;
    setReps(next);
    if (next >= 10) { setDone(true); logGame(); addXp(80); }
  };

  if (done) return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>💪</div>
      <h3 className="fh" style={{ fontSize: 24, marginBottom: 8 }}>10 reps done!</h3>
      <p style={{ color: 'var(--muted-fg)', marginBottom: 16 }}>You completed 10 {exercise}. Your body thanks you!</p>
      <div className="xp-badge" style={{ margin: '0 auto 24px' }}>+80 XP earned</div>
      <button className="btn-p" onClick={() => onComplete(true)} data-testid="ten-rep-done">Continue</button>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <p style={{ fontSize: 14, color: 'var(--muted-fg)', fontWeight: 600 }}>Do 10 reps of:</p>
      <p className="fh" style={{ fontSize: 32, fontWeight: 700, color: 'var(--fg)' }}>{exercise}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 280 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{ width: 44, height: 44, borderRadius: 12, background: i < reps ? 'var(--primary)' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i < reps ? '#fff' : 'var(--muted-fg)', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 16, transition: 'all .2s' }}>{i + 1}</div>
        ))}
      </div>
      <button className="btn-p" onClick={tap} style={{ fontSize: 18, padding: '18px 40px' }} data-testid="ten-rep-tap">Rep {reps + 1} — Tap!</button>
    </div>
  );
}

// ─── Challenges ────────────────────────────────────────

const CHALLENGES = [
  {
    id: 'memory', title: 'Memory Recall', icon: '🧠', color: '#4DB6AC', grad: 'linear-gradient(135deg,#4DB6AC,#26A69A)',
    desc: 'Test and train your short-term memory with number and pattern challenges.',
    games: [
      { id: 'number-flash', title: 'Number Flash', desc: 'See a 4-digit number for 3 seconds, then recall it.', xp: 50, Component: NumberFlash },
      { id: 'math-sprint', title: 'Math Sprint', desc: 'Solve 8 quick mental maths problems.', xp: 80, Component: MathSprint },
    ]
  },
  {
    id: 'deep', title: 'Deep Work Sprint', icon: '🌊', color: '#26A69A', grad: 'linear-gradient(135deg,#26A69A,#80DEEA)',
    desc: 'Build the ability to enter deep focus states through breathing and intention.',
    games: [
      { id: 'box-breathing', title: 'Box Breathing', desc: '4-4-4-4 breathing pattern for 4 rounds to calm and focus.', xp: 70, Component: BoxBreathing },
      { id: 'one-focus', title: 'One Focus Task', desc: 'Declare your one task and focus on it for 5 minutes.', xp: 60, Component: OneFocus },
    ]
  },
  {
    id: 'physical', title: 'Micro Workout', icon: '💪', color: '#81C784', grad: 'linear-gradient(135deg,#81C784,#4CAF50)',
    desc: 'Quick physical activation to re-energise your brain and body.',
    games: [
      { id: 'ten-rep', title: '10 Rep Challenge', desc: 'Pick a random exercise and complete 10 reps.', xp: 80, Component: TenRep },
    ]
  },
];

// ─── Main Page ──────────────────────────────────────────

export default function ConcentrationGamesPage() {
  const [screen, setScreen] = useState('home'); // home | challenge | game | result
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const { xp, level, toNext } = getLevel();
  const totalGames = Object.values(JSON.parse(localStorage.getItem(CONC_KEY) || '{}')).reduce((s, v) => s + v, 0);

  const handleGameComplete = (success) => { setGameResult(success); setScreen('result'); };
  const back = () => { setScreen(screen === 'game' ? 'challenge' : 'home'); setSelectedGame(null); };

  const GameComponent = selectedGame?.Component;

  return (
    <div className="alu-s" data-testid="concentration-games-page">
      <div className="orb" style={{ left: '-5%', top: '-5%', width: 400, height: 400, background: 'rgba(255,213,79,0.07)', filter: 'blur(120px)', animationDuration: '13s' }} />
      <div className="orb" style={{ left: '85%', top: '60%', width: 320, height: 320, background: 'rgba(77,182,172,0.06)', filter: 'blur(100px)', animationDuration: '17s', animationDelay: '2s' }} />
      <div className="grid-dot-bg" />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <section className="au" style={{ paddingTop: 48, paddingBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, color: 'var(--accent-d)', marginBottom: 8 }}>Focus Challenges</p>
              <h1 className="fh" style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.05, letterSpacing: -.5, marginBottom: 8 }}>Concentration <span className="glow-text">Games</span></h1>
              <p style={{ fontSize: 14, color: 'var(--muted-fg)' }}>Train your focus. Earn XP. Level up.</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="card" style={{ padding: '14px 18px', textAlign: 'center', minWidth: 80 }}>
                <p className="mono" style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-d)', lineHeight: 1 }}>{level}</p>
                <p style={{ fontSize: 11, color: 'var(--muted-fg)', fontWeight: 600 }}>Level</p>
              </div>
              <div className="card" style={{ padding: '14px 18px', textAlign: 'center', minWidth: 80 }}>
                <p className="mono" style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{xp}</p>
                <p style={{ fontSize: 11, color: 'var(--muted-fg)', fontWeight: 600 }}>Total XP</p>
              </div>
              <div className="card" style={{ padding: '14px 18px', textAlign: 'center', minWidth: 80 }}>
                <p className="mono" style={{ fontSize: 22, fontWeight: 800, color: 'var(--sage-d)', lineHeight: 1 }}>{totalGames}</p>
                <p style={{ fontSize: 11, color: 'var(--muted-fg)', fontWeight: 600 }}>Games</p>
              </div>
            </div>
          </div>
          {/* XP progress */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted-fg)', marginBottom: 6 }}>
              <span className="mono">Level {level}</span>
              <span className="mono">{toNext} XP to Level {level + 1}</span>
            </div>
            <div style={{ height: 6, background: 'var(--muted)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((xp % 500) / 500) * 100}%`, background: 'linear-gradient(90deg, var(--accent-d), var(--primary))', borderRadius: 3, transition: 'width .6s ease' }} />
            </div>
          </div>
        </section>

        {/* HOME: Challenge list */}
        {screen === 'home' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {CHALLENGES.map((ch, i) => (
                <div key={ch.id} className="ch-card au" style={{ animationDelay: `${i * .1}s` }} onClick={() => { setSelectedChallenge(ch); setScreen('challenge'); }} data-testid={`challenge-${ch.id}`}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 18, background: ch.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,.08)' }}>{ch.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <h3 className="fh" style={{ fontSize: 18, fontWeight: 700 }}>{ch.title}</h3>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)' }}>{ch.games.length} game{ch.games.length > 1 ? 's' : ''} →</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--muted-fg)', lineHeight: 1.6, marginBottom: 10 }}>{ch.desc}</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {ch.games.map(g => (
                          <span key={g.id} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'rgba(77,182,172,.08)', color: 'var(--primary)' }}>{g.title}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pro-locked row */}
              <div className="ch-card" style={{ opacity: 0.6, cursor: 'default', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(245,247,250,.7)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>🔒 Pro Games</p>
                    <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginBottom: 12 }}>5 more games including Speed Focus, Single Tab, and Word Recall</p>
                    <Link to="/pricing"><button className="btn-p" style={{ padding: '9px 22px', fontSize: 12 }}>Upgrade to Pro</button></Link>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['Speed Focus', 'Single Tab', 'Word Recall', 'Reaction Grid', 'Quick Count'].map(n => (
                    <span key={n} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'var(--muted)', color: 'var(--muted-fg)' }}>{n}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHALLENGE: Game selection */}
        {screen === 'challenge' && selectedChallenge && (
          <div className="au">
            <button onClick={back} style={{ marginBottom: 24, fontSize: 13, color: 'var(--muted-fg)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Manrope,sans-serif', fontWeight: 600 }}>← Back to challenges</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: selectedChallenge.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{selectedChallenge.icon}</div>
              <div>
                <h2 className="fh" style={{ fontSize: 26, fontWeight: 700 }}>{selectedChallenge.title}</h2>
                <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>{selectedChallenge.desc}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }} className="resp-grid-2">
              {selectedChallenge.games.map(g => (
                <div key={g.id} className="ch-card" onClick={() => { setSelectedGame(g); setScreen('game'); }} style={{ cursor: 'pointer' }} data-testid={`game-${g.id}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{g.title}</h3>
                    <span className="xp-badge">+{g.xp} XP</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted-fg)', lineHeight: 1.6, marginBottom: 14 }}>{g.desc}</p>
                  <button className="btn-p" style={{ padding: '10px 22px', fontSize: 13 }}>Play →</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GAME: Active game */}
        {screen === 'game' && selectedGame && (
          <div className="au">
            <button onClick={back} style={{ marginBottom: 20, fontSize: 13, color: 'var(--muted-fg)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Manrope,sans-serif', fontWeight: 600 }}>← Back</button>
            <div className="card" style={{ padding: '28px', maxWidth: 520, margin: '0 auto' }}>
              <h2 className="fh" style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>{selectedGame.title}</h2>
              <p style={{ fontSize: 13, color: 'var(--muted-fg)', textAlign: 'center', marginBottom: 24 }}>{selectedGame.desc}</p>
              <GameComponent onComplete={handleGameComplete} />
            </div>
          </div>
        )}

        {/* RESULT */}
        {screen === 'result' && (
          <div className="au" style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🌟</div>
            <h2 className="fh" style={{ fontSize: 28, marginBottom: 12 }}>Challenge Complete!</h2>
            <p style={{ color: 'var(--muted-fg)', marginBottom: 24 }}>Keep the momentum going — play another game or check your progress.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-p" onClick={() => { setScreen('home'); setSelectedChallenge(null); setSelectedGame(null); }} data-testid="play-again">Play Another Game</button>
              <Link to="/"><button className="btn-o">Go to Hub</button></Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
