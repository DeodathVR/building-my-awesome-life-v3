import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import mandalaWatermark from '../assets/mandala-watermark.png';
import './shared-pages.css';

const QUOTES = [
  { text: 'Small daily improvements are the key to staggering long-term results.', by: 'Robin Sharma' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act but a habit.', by: 'Aristotle' },
  { text: 'The secret of your future is hidden in your daily routine.', by: 'Mike Murdock' },
  { text: 'Motivation gets you started. Habit keeps you going.', by: 'Jim Ryun' },
  { text: 'You do not rise to the level of your goals. You fall to the level of your systems.', by: 'James Clear' },
];

const ALL_PAGES = [
  { id: 'home', title: 'Home Dashboard', icon: '🏠', to: '/', status: 'live', grad: 'linear-gradient(135deg,#4DB6AC,#26A69A)', tags: ["Today's stats", 'Activity heatmap', 'All feature links'], desc: 'Central dashboard linking all features. Today\'s stats, activity heatmap, and quick navigation.' },
  { id: 'conc', title: 'Concentration Games', icon: '🎮', to: '/concentration-games', status: 'live', grad: 'linear-gradient(135deg,#FFD54F,#FFA726)', tags: ['Number Flash', 'Math Sprint', 'Box Breathing', '+3 more'], desc: '10 focus mini-games across Memory, Speed, Deep Work, Single Task, and Physical challenges.' },
  { id: 'glow', title: 'Glow Up', icon: '✨', to: '/glow-up', status: 'pro', grad: 'linear-gradient(135deg,#81C784,#4DB6AC)', tags: ['Photo upload', 'Goals questions', 'AI transformation'], desc: 'AI-powered transformation feature. Upload a photo, set goals, visualise your best self.' },
  { id: 'pricing', title: 'Pricing', icon: '💳', to: '/pricing', status: 'live', grad: 'linear-gradient(135deg,#80DEEA,#4DB6AC)', tags: ['Free tier', 'Pro $9.99/mo', 'Family $19.99/mo'], desc: 'Free vs Pro vs Family plans. Transparent pricing with 7-day free trial.' },
  { id: 'guide', title: 'How To Use', icon: '📖', to: '/how-to-use', status: 'live', grad: 'linear-gradient(135deg,#81C784,#4DB6AC)', tags: ['Getting started', 'Feature guides', 'Free vs Pro'], desc: 'Interactive guide covering every feature — checklist, walkthroughs, and pro tips.' },
  { id: 'conspiracy', title: 'Success Conspiracy', icon: '🔮', to: '/conspiracy', status: 'app', grad: 'linear-gradient(135deg,#FFA726,#FFD54F)', tags: ['Cosmic Reframer', 'Thought Tracker', 'Daily Quest'], desc: 'Reframe setbacks as opportunities. Cosmic Reframer, Thought Tracker, and Daily Quest.' },
  { id: 'habits', title: 'Habits Page', icon: '✅', to: '/habits', status: 'app', grad: 'linear-gradient(135deg,#26A69A,#4DB6AC)', tags: ['Search & filter', '30-day heatmap', 'Bulk log'], desc: 'Full habits management — search, sort, grid/list view, 30-day clickable heatmap.' },
  { id: 'focus', title: 'Focus Exercises', icon: '🌸', to: '/focus', status: 'app', grad: 'linear-gradient(135deg,#81C784,#26A69A)', tags: ['Flower animation', 'Candle flame', 'Expanding circle', '+1 more'], desc: 'Guided focus exercises — Flower Animation, Candle Flame, Expanding Circle, Breath Counter.' },
  { id: 'feed', title: 'Awesome Feed', icon: '⚡', to: '/feed', status: 'app', grad: 'linear-gradient(135deg,#FFD54F,#81C784)', tags: ['Inspirational content', 'Daily feed', 'Share moments'], desc: 'Inspirational content feed to fuel your habit journey with motivation and ideas.' },
  { id: 'education', title: 'Education', icon: '📚', to: '/education', status: 'app', grad: 'linear-gradient(135deg,#80DEEA,#4DB6AC)', tags: ['Articles', 'Courses', 'Resources'], desc: 'Learning content — courses, articles, and educational resources to level up.' },
  { id: 'community', title: 'Community', icon: '👥', to: '/community', status: 'app', grad: 'linear-gradient(135deg,#81C784,#4DB6AC)', tags: ['Social feed', 'Accountability', 'Shared streaks'], desc: 'Connect with other habit builders — share progress, celebrate wins, stay accountable.' },
  { id: 'coach', title: 'AI Coach', icon: '🤖', to: '/coach', status: 'app', grad: 'linear-gradient(135deg,#4DB6AC,#26A69A)', tags: ['Chat interface', 'Personalised advice', 'Daily check-ins'], desc: 'Personal AI habit coach — chat for daily guidance personalised to your habits.' },
  { id: 'admin', title: 'Admin Panel', icon: '🔐', to: '/admin', status: 'app', grad: 'linear-gradient(135deg,#B0BEC5,#78909C)', tags: ['Articles CMS', 'Custom games', 'Settings'], desc: 'Password-protected panel to manage content, custom games, and app settings.' },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = () => new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

const BADGE_STYLES = {
  live: { bg: 'rgba(129,199,132,.12)', color: '#4CAF50', label: 'Live' },
  pro: { bg: 'rgba(255,213,79,.12)', color: '#FFA726', label: 'Pro' },
  app: { bg: 'rgba(77,182,172,.08)', color: '#4DB6AC', label: 'In App' },
};

export default function HomePage() {
  const { stats, loading } = useApp();
  const [filter, setFilter] = useState('all');
  const [concData, setConcData] = useState({});
  const [xp, setXp] = useState(0);
  const isPro = localStorage.getItem('alu_isPro') === 'true';
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem('alu_concentration') || '{}');
      setConcData(d);
      setXp(parseInt(localStorage.getItem('alu_xp') || '0'));
    } catch (e) { /* ignore */ }
  }, []);

  const level = Math.floor(xp / 500) + 1;
  const totalGames = Object.values(concData).reduce((s, v) => s + (v || 0), 0);

  // 14-day heatmap from concData
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 13 + i);
    const key = d.toISOString().split('T')[0];
    const count = concData[key] || 0;
    return { date: key, day: d.getDate(), count };
  });

  const filteredPages = filter === 'all' ? ALL_PAGES : filter === 'live' ? ALL_PAGES.filter(p => p.status === 'live') : ALL_PAGES.filter(p => p.status !== 'live');

  const counts = { all: ALL_PAGES.length, live: ALL_PAGES.filter(p => p.status === 'live').length, app: ALL_PAGES.filter(p => p.status !== 'live').length };

  if (loading) return (
    <div className="alu-s" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--primary-l)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'alu-spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--muted-fg)', fontWeight: 600 }}>Loading your home...</p>
      </div>
    </div>
  );

  return (
    <div className="alu-s" data-testid="home-page">
      {/* Mandala watermark — Centered Halo variant, 50% opacity */}
      <div
        className="mandala-watermark mandala-v1"
        aria-hidden="true"
        data-testid="mandala-watermark"
        style={{ backgroundImage: `url(${mandalaWatermark})` }}
      />
      <div className="orb" style={{ left: '-5%', top: '-5%', width: 420, height: 420, background: 'rgba(77,182,172,0.05)', filter: 'blur(130px)', animationDuration: '13s' }} />
      <div className="orb" style={{ left: '80%', top: '70%', width: 350, height: 350, background: 'rgba(255,213,79,0.04)', filter: 'blur(110px)', animationDuration: '17s', animationDelay: '2s' }} />
      <div className="grid-dot-bg" />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <section className="au" style={{ paddingTop: 48, paddingBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>☀️ {getGreeting()}</p>
              <h1 className="fh" style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.5, marginBottom: 8 }}>Your Awesome Life<br /><span className="glow-text">Dashboard</span></h1>
              <p style={{ fontSize: 14, color: 'var(--muted-fg)', fontWeight: 500 }}>{formatDate()}</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ background: 'var(--card)', border: '1.5px solid rgba(255,213,79,.4)', borderRadius: 20, padding: '16px 20px', textAlign: 'center', minWidth: 86, boxShadow: '0 4px 20px rgba(255,213,79,.18)', animation: 'alu-goldGlow 3s ease-in-out infinite' }}>
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted-fg)', marginBottom: 4 }}>Streak</p>
                <p className="mono" style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-d)', lineHeight: 1 }}>{stats?.max_streak || 0}</p>
                <p style={{ fontSize: 13, marginTop: -4 }}>🔥</p>
              </div>
              <Link to="/pricing" style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--card)', border: '1.5px solid rgba(207,216,220,.5)', borderRadius: 20, padding: '16px 20px', textAlign: 'center', minWidth: 86, boxShadow: 'var(--shadow-s)', cursor: 'pointer', transition: '.2s' }}>
                  <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted-fg)', marginBottom: 4 }}>Plan</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: isPro ? 'var(--primary)' : 'var(--muted-fg)' }}>{isPro ? 'Pro' : 'Free'}</p>
                  {!isPro && <p style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2, fontWeight: 600 }}>Upgrade →</p>}
                </div>
              </Link>
            </div>
          </div>

          {/* Mini stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 24 }}>
            {[
              { icon: '🎮', val: `${totalGames > 0 ? '1' : '0'}/3`, label: 'Games Today', color: 'var(--primary)' },
              { icon: '🏆', val: totalGames, label: 'Total Games', color: 'var(--accent-d)' },
              { icon: '⭐', val: `L${level}`, label: 'Level', color: 'var(--sage-d)' },
              { icon: '📱', val: ALL_PAGES.length, label: 'Pages Built', color: 'var(--primary-d)' },
            ].map((s, i) => (
              <div key={i} className="card au" style={{ padding: '14px 16px', animationDelay: `${i * .06}s`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: `color-mix(in srgb, ${s.color} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <p className="mono" style={{ fontSize: 18, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted-fg)', fontWeight: 600 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Activity + Quote row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 36 }}>
          <div className="card au" style={{ padding: '20px 22px', animationDelay: '.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <p className="fh" style={{ fontSize: 16, fontWeight: 700 }}>Focus Activity</p>
                <p style={{ fontSize: 11, color: 'var(--muted-fg)' }}>Last 14 days</p>
              </div>
              <Link to="/concentration-games" style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>Play →</Link>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {last14.map((d, i) => {
                const opacity = d.count === 0 ? 0 : d.count >= 3 ? 1 : 0.45;
                return (
                  <div key={i} title={`${d.date}: ${d.count} games`} style={{ flex: 1, height: 24, borderRadius: 5, background: d.count === 0 ? 'var(--muted)' : 'var(--primary)', opacity: d.count === 0 ? 1 : opacity, transition: '.3s' }} />
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11, color: 'var(--muted-fg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--muted)' }} />None</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(77,182,172,.45)' }} />Some</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--primary)' }} />Goal (3+)</div>
            </div>
          </div>

          <div className="au" style={{ animationDelay: '.25s', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: '20px 22px', flex: 1, background: 'linear-gradient(135deg,var(--primary-l) 0%,rgba(255,255,255,.6) 100%)' }}>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--primary)', marginBottom: 10 }}>Today's Thought</p>
              <p className="fh" style={{ fontSize: 15, lineHeight: 1.7, fontStyle: 'italic', color: 'var(--fg)', marginBottom: 8 }}>"{quote.text}"</p>
              <p style={{ fontSize: 11, color: 'var(--muted-fg)', fontWeight: 600, textAlign: 'right' }}>— {quote.by}</p>
            </div>
            {!isPro && (
              <Link to="/pricing" style={{ textDecoration: 'none' }}>
                <div style={{ background: 'linear-gradient(135deg, #26A69A, #4DB6AC)', borderRadius: 16, padding: '14px 18px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', top: -16, right: -10, fontSize: 60, opacity: 0.15 }}>✨</div>
                  <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 3, color: 'rgba(255,255,255,.8)', marginBottom: 4 }}>Pro — 7-day free trial</p>
                  <p className="fh" style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Unlock all games + Glow Up →</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* App Map */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 className="fh" style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>App Map</h2>
              <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>All {ALL_PAGES.length} pages across your ecosystem</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['all', 'All'], ['live', 'Live here'], ['app', 'In App']].map(([id, label]) => (
                <button key={id} onClick={() => setFilter(id)} style={{ padding: '7px 14px', borderRadius: 99, border: `1.5px solid ${filter === id ? 'var(--primary)' : 'var(--border)'}`, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Manrope,sans-serif', transition: '.2s', background: filter === id ? 'var(--primary)' : 'var(--card)', color: filter === id ? '#fff' : 'var(--muted-fg)' }}>
                  {label} ({counts[id]})
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 18, fontSize: 12 }}>
            {[['live', 'Live here'], ['pro', 'Pro — Live'], ['app', 'In App']].map(([s, l]) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className={`status-dot status-${s}`} />
                <span style={{ color: 'var(--muted-fg)', fontWeight: 600 }}>{l}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {filteredPages.map((p, i) => {
              const badge = BADGE_STYLES[p.status];
              return (
                <Link key={p.id} to={p.to} className="page-card au" style={{ '--pc-grad': p.grad, animationDelay: `${i * .05}s` }} data-testid={`page-card-${p.id}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 15, background: p.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}>{p.icon}</div>
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .06, padding: '3px 9px', borderRadius: 99, background: badge.bg, color: badge.color }}>{badge.label}</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 5 }}>{p.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--muted-fg)', lineHeight: 1.55, marginBottom: 12 }}>{p.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {p.tags.map((t, j) => (
                      <span key={j} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: badge.bg, color: badge.color }}>{t}</span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
