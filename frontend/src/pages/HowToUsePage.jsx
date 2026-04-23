import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './shared-pages.css';

const STEPS = [
  { id: 'create', label: 'Create your first habit', tip: 'Go to the Habits page and click "+ Add Habit". Start with something tiny — 2 minutes max.' },
  { id: 'complete', label: 'Complete a habit today', tip: 'Tap the circle on any habit card to log today\'s completion.' },
  { id: 'home', label: 'Explore the Home dashboard', tip: 'The Home dashboard links to every feature. Bookmark it as your daily home base.' },
  { id: 'game', label: 'Play a Concentration Game', tip: 'Try Number Flash first — it\'s a quick 30-second warm-up that sharpens focus.' },
  { id: 'coach', label: 'Chat with your AI Coach', tip: 'Ask "What\'s one habit I should build this week?" for a personalised plan.' },
  { id: 'glow', label: 'Try the Glow Up feature', tip: 'Upload a photo and set your goals to see your best self visualised by AI.' },
];

const FEATURE_TABS = [
  {
    id: 'habits', label: 'Habits', icon: '✅',
    steps: [
      { n: 1, t: 'Open Habits page', d: 'Click "Habits" in the nav bar to see your full habit list.' },
      { n: 2, t: 'Add a new habit', d: 'Click "+ Add Habit". Give it a name, optional description, and set frequency.' },
      { n: 3, t: 'Log daily completions', d: 'Tap the circle on a habit card each day. Your streak updates automatically.' },
      { n: 4, t: 'View your heatmap', d: 'Each habit shows a 30-day heatmap. Darker = more consistent.' },
    ]
  },
  {
    id: 'focus', label: 'Focus', icon: '🌸',
    steps: [
      { n: 1, t: 'Open Focus Exercises', d: 'Click "Focus" in the nav. Choose from Flower, Candle, Circle, or Breath Counter.' },
      { n: 2, t: 'Start an exercise', d: 'Select any exercise and press Start. Follow the on-screen guidance.' },
      { n: 3, t: 'Use Concentration Games', d: 'For gamified focus, visit Concentration Games — 10 mini-games with XP rewards.' },
      { n: 4, t: 'Build a daily routine', d: 'One focus session + one game per day compounds quickly over a week.' },
    ]
  },
  {
    id: 'glow', label: 'Glow Up', icon: '✨',
    steps: [
      { n: 1, t: 'Upload your photo', d: 'Go to Glow Up and drag or click to upload a clear photo of your face.' },
      { n: 2, t: 'Set your goals', d: 'Answer 3 questions about the habits you want to build and your style preference.' },
      { n: 3, t: 'Generate your transformation', d: 'Hit Generate — AI creates a visual of your best self based on your goals.' },
      { n: 4, t: 'Save and share', d: 'Download your transformation in HD or share directly to social (Pro feature).' },
    ]
  },
  {
    id: 'coach', label: 'AI Coach', icon: '🤖',
    steps: [
      { n: 1, t: 'Open AI Coach', d: 'Click "AI Coach" in the nav. The coach greets you and is ready to chat.' },
      { n: 2, t: 'Ask anything', d: 'Try: "I keep skipping my morning run. What should I do?" or "Build me a 7-day plan."' },
      { n: 3, t: 'Get personalised advice', d: 'The coach knows your current habits and gives advice specific to your data.' },
      { n: 4, t: 'Check in daily', d: 'A quick daily check-in keeps your momentum going and accountability high.' },
    ]
  },
  {
    id: 'conspiracy', label: 'Success Conspiracy', icon: '🔮',
    steps: [
      { n: 1, t: 'Open Success Conspiracy', d: 'Find it in the nav. This is your mindset reframing space.' },
      { n: 2, t: 'Use the Cosmic Reframer', d: 'Type a negative thought. The AI transforms it into a growth perspective.' },
      { n: 3, t: 'Track your thoughts', d: 'Log thoughts over time to notice patterns and track your mindset progress.' },
      { n: 4, t: 'Accept the Daily Quest', d: 'Each day has a micro-challenge designed to stretch your thinking.' },
    ]
  },
  {
    id: 'community', label: 'Community', icon: '👥',
    steps: [
      { n: 1, t: 'Open Community', d: 'Click "Community" in the nav to see the shared accountability feed.' },
      { n: 2, t: 'Share a win', d: 'Post any win — big or small. The community celebrates with you.' },
      { n: 3, t: 'Give encouragement', d: 'Like or comment on others\' posts. Accountability is a two-way street.' },
      { n: 4, t: 'Stay consistent', d: 'Users who post weekly have 3x better habit retention than those who don\'t.' },
    ]
  },
];

const PRO_FEATURES = [
  { icon: '🎮', label: 'All 15 Concentration Games', free: '5 games', pro: 'All 15 games' },
  { icon: '✨', label: 'Glow Up Transformations', free: '1 free', pro: 'Unlimited' },
  { icon: '🤖', label: 'AI Coach Messages', free: '5/day', pro: 'Unlimited' },
  { icon: '📥', label: 'HD Download & Share', free: false, pro: true },
  { icon: '📊', label: 'Advanced Analytics', free: false, pro: true },
  { icon: '⚡', label: 'Early Feature Access', free: false, pro: true },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item" onClick={() => setOpen(o => !o)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>{q}</p>
        <span style={{ fontSize: 18, color: 'var(--primary)', flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
      </div>
      {open && <p style={{ fontSize: 14, color: 'var(--muted-fg)', lineHeight: 1.75, marginTop: 10 }}>{a}</p>}
    </div>
  );
};

export default function HowToUsePage() {
  const [done, setDone] = useState({});
  const [activeTab, setActiveTab] = useState('habits');

  const toggle = (id) => setDone(d => ({ ...d, [id]: !d[id] }));
  const completedCount = Object.values(done).filter(Boolean).length;
  const tab = FEATURE_TABS.find(t => t.id === activeTab);

  return (
    <div className="alu-s" data-testid="how-to-use-page">
      <div className="orb" style={{ left: '-5%', top: '-5%', width: 400, height: 400, background: 'rgba(77,182,172,0.07)', filter: 'blur(120px)', animationDuration: '13s' }} />
      <div className="orb" style={{ left: '85%', top: '70%', width: 320, height: 320, background: 'rgba(255,213,79,0.06)', filter: 'blur(100px)', animationDuration: '17s', animationDelay: '2s' }} />
      <div className="grid-dot-bg" />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <section style={{ paddingTop: 52, paddingBottom: 40, textAlign: 'center' }} className="au">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--primary-l)', borderRadius: 99, padding: '6px 16px', marginBottom: 20 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>Your complete guide</span>
          </div>
          <h1 className="fh" style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.5, marginBottom: 14 }}>
            How to use <span className="glow-text">Awesome Life Habits</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--muted-fg)', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>
            Everything you need to go from Day 1 to a consistent habit ecosystem in under 10 minutes.
          </p>
        </section>

        {/* Getting started checklist */}
        <section style={{ marginBottom: 48 }} className="au" style={{ animationDelay: '.1s' }}>
          <div className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 className="fh" style={{ fontSize: 22, fontWeight: 700 }}>Getting Started Checklist</h2>
                <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginTop: 4 }}>Complete these 6 steps to unlock your habit ecosystem</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p className="mono" style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{completedCount}/6</p>
                <p style={{ fontSize: 11, color: 'var(--muted-fg)' }}>done</p>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ height: 6, background: 'var(--muted)', borderRadius: 3, marginBottom: 20, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(completedCount / 6) * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--sage-d))', borderRadius: 3, transition: 'width .4s ease' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {STEPS.map(s => (
                <div key={s.id} onClick={() => toggle(s.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 12, cursor: 'pointer', background: done[s.id] ? 'rgba(77,182,172,.06)' : 'transparent', transition: 'background .2s' }}>
                  <div className={`check-circle${done[s.id] ? ' done' : ''}`} style={{ marginTop: 2 }}>
                    {done[s.id] && <span style={{ fontSize: 12 }}>✓</span>}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: done[s.id] ? 'var(--primary)' : 'var(--fg)', textDecoration: done[s.id] ? 'line-through' : 'none' }}>{s.label}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2, lineHeight: 1.5 }}>{s.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature guides */}
        <section style={{ marginBottom: 48 }}>
          <h2 className="fh" style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Feature Guides</h2>
          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            {FEATURE_TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`tab-btn${activeTab === t.id ? ' active' : ''}`} data-testid={`guide-tab-${t.id}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          {/* Steps */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }} className="resp-grid-2">
            {tab.steps.map(s => (
              <div key={s.n} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-l)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                    {s.n}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{s.t}</p>
                    <p style={{ fontSize: 13, color: 'var(--muted-fg)', lineHeight: 1.65 }}>{s.d}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pro tips */}
        <section style={{ marginBottom: 48 }}>
          <h2 className="fh" style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Pro Tips</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="resp-grid-3">
            {[
              { icon: '🔗', t: 'Habit Stack', d: 'Attach new habits to existing ones. "After my morning coffee, I will..." works 60% better than standalone habits.' },
              { icon: '📱', t: 'Use the Home dashboard daily', d: 'Make the Home dashboard your browser homepage. Seeing your streak every morning creates a powerful visual anchor.' },
              { icon: '🎮', t: 'Games before work', d: 'Play one Concentration Game before starting deep work. It primes your prefrontal cortex for focus.' },
              { icon: '✨', t: 'Revisit your Glow Up', d: 'Look at your Glow Up transformation every morning. Visual motivation is more powerful than written goals.' },
              { icon: '🤖', t: 'Weekly AI check-in', d: 'Ask the AI Coach "How have my habits changed this week?" every Sunday for a reflective review.' },
              { icon: '🔮', t: 'Reframe before logging', d: 'If you miss a habit, use the Cosmic Reframer before your next attempt. Guilt is a habit killer.' },
            ].map((tip, i) => (
              <div key={i} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{tip.icon}</div>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{tip.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted-fg)', lineHeight: 1.65 }}>{tip.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Free vs Pro */}
        <section style={{ marginBottom: 48 }}>
          <h2 className="fh" style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Free vs Pro</h2>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', padding: '12px 20px', background: 'var(--primary-l)', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>
              <span style={{ color: 'var(--primary)' }}>Feature</span>
              <span style={{ textAlign: 'center', color: 'var(--muted-fg)' }}>Free</span>
              <span style={{ textAlign: 'center', color: 'var(--primary)' }}>Pro</span>
            </div>
            {PRO_FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', padding: '14px 20px', borderBottom: i < PRO_FEATURES.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}><span>{f.icon}</span><span style={{ fontWeight: 600 }}>{f.label}</span></div>
                <div style={{ textAlign: 'center', fontSize: 13 }}>
                  {f.free === false ? <span style={{ color: 'var(--border)' }}>–</span> : f.free === true ? <span style={{ color: 'var(--sage-d)', fontWeight: 700 }}>✓</span> : <span style={{ color: 'var(--muted-fg)', fontWeight: 600 }}>{f.free}</span>}
                </div>
                <div style={{ textAlign: 'center', fontSize: 13 }}>
                  {f.pro === true ? <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span> : <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{f.pro}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 48 }}>
          <h2 className="fh" style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>FAQ</h2>
          <div className="card" style={{ padding: '8px 24px' }}>
            {[
              { q: 'Is my data private?', a: 'Yes. All habit data is stored in your personal Firestore account, scoped to your session. No one else can see it.' },
              { q: 'Does it work offline?', a: 'Habit logging works offline and syncs when you reconnect. Focus games and AI features require an internet connection.' },
              { q: 'Can I use it on mobile?', a: 'Yes — the app is fully responsive. Add it to your home screen from your browser for an app-like experience.' },
              { q: 'How do streaks work?', a: 'A streak increments each day you complete a habit. Missing a day resets the streak, but your best streak is always saved.' },
              { q: 'What is the AI Coach powered by?', a: 'The AI Coach uses Google Gemini 2.5 Flash for fast, personalized habit advice based on your actual habit data.' },
            ].map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--primary-l) 0%, rgba(255,213,79,.08) 100%)', borderRadius: 28, padding: '44px 32px', border: '1.5px solid rgba(77,182,172,.2)' }}>
          <h2 className="fh" style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Ready to build your awesome life?</h2>
          <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginBottom: 28, lineHeight: 1.7 }}>Start with one habit. Come back tomorrow. That's the whole system.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/habits"><button className="btn-p" data-testid="htu-start-btn">Add Your First Habit →</button></Link>
            <Link to="/concentration-games"><button className="btn-o" data-testid="htu-games-btn">Try a Focus Game</button></Link>
          </div>
        </section>

      </div>
    </div>
  );
}
