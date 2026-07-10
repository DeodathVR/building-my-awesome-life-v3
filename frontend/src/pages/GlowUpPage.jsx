/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './shared-pages.css';

// Curated demo pairs — sourced from royalty-free wellness photography (Unsplash).
// Before/After framing conveys the *idea* of Glow Up without generating real AI images.
const DEMOS = [
  {
    id: 'fit',
    goal: 'Get Fit & Active',
    icon: '💪',
    tint: 'linear-gradient(135deg, rgba(129,199,132,.15), rgba(255,213,79,.1))',
    before: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80&auto=format',
    after: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80&auto=format',
    message: 'From starting-line energy to steady strength — 90 days of daily movement.',
  },
  {
    id: 'calm',
    goal: 'Calm & Mindful',
    icon: '🧘',
    tint: 'linear-gradient(135deg, rgba(77,182,172,.2), rgba(139,92,246,.1))',
    before: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=80&auto=format',
    after: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80&auto=format',
    message: 'Restless mind quietened by 10 minutes of daily breathwork.',
  },
  {
    id: 'glow',
    goal: 'Glow & Confidence',
    icon: '✨',
    tint: 'linear-gradient(135deg, rgba(255,213,79,.2), rgba(255,167,38,.1))',
    before: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80&auto=format',
    after: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80&auto=format',
    message: 'Radiance from within — hydration, sleep, and 5-minute skincare.',
  },
  {
    id: 'sharp',
    goal: 'Sharp & Focused',
    icon: '🧠',
    tint: 'linear-gradient(135deg, rgba(139,92,246,.15), rgba(77,182,172,.1))',
    before: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&q=80&auto=format',
    after: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format',
    message: 'Foggy mornings replaced by deep-work sessions and clarity.',
  },
];

export default function GlowUpPage() {
  const { user } = useAuth();
  const [active, setActive] = useState(0);
  const demo = DEMOS[active];

  return (
    <div className="alu-s" data-testid="glow-up-page">
      <div className="orb" style={{ left: '-5%', top: '-5%', width: 400, height: 400, background: 'rgba(129,199,132,0.07)', filter: 'blur(120px)', animationDuration: '13s' }} />
      <div className="orb" style={{ left: '85%', top: '60%', width: 340, height: 340, background: 'rgba(255,213,79,0.06)', filter: 'blur(110px)', animationDuration: '17s', animationDelay: '2s' }} />
      <div className="grid-dot-bg" />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <section className="au" style={{ paddingTop: 52, paddingBottom: 30, textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, color: 'var(--sage-d)', marginBottom: 12 }}>AI Transformation Preview</p>
          <h1 className="fh" style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.05, letterSpacing: -.5, marginBottom: 14 }}>
            See the <span className="glow-text">Glow Up</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--muted-fg)', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>
            Browse curated before-and-after transformations across four wellness goals.
            {user ? ' Upload your own photo with a Pro subscription — coming soon.' : ' Sign up to upload your photo (Pro).'}
          </p>
        </section>

        {/* Goal tabs */}
        <section style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }} data-testid="glow-goal-tabs">
            {DEMOS.map((d, i) => (
              <button
                key={d.id}
                onClick={() => setActive(i)}
                data-testid={`glow-tab-${d.id}`}
                style={{
                  padding: '9px 18px',
                  borderRadius: 99,
                  border: `1.5px solid ${active === i ? 'var(--primary)' : 'var(--border)'}`,
                  background: active === i ? 'var(--primary)' : 'var(--card)',
                  color: active === i ? '#fff' : 'var(--fg)',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: '.2s',
                  fontFamily: 'Manrope, sans-serif',
                }}
              >
                <span style={{ marginRight: 6 }}>{d.icon}</span>{d.goal}
              </button>
            ))}
          </div>
        </section>

        {/* Before / After showcase */}
        <div className="card au" style={{ padding: 24, background: demo.tint, transition: 'background .5s' }} data-testid="glow-showcase">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted-fg)', marginBottom: 10 }}>Before</p>
              <img
                src={demo.before}
                alt={`Before ${demo.goal}`}
                loading="lazy"
                referrerPolicy="no-referrer"
                data-testid="glow-before-img"
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 16, boxShadow: 'var(--shadow-s)', filter: 'grayscale(.3) brightness(.9)' }}
              />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--primary)', marginBottom: 10 }}>After</p>
              <img
                src={demo.after}
                alt={`After ${demo.goal}`}
                loading="lazy"
                referrerPolicy="no-referrer"
                data-testid="glow-after-img"
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 16, boxShadow: 'var(--shadow-m)' }}
              />
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted-fg)', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.7 }}>
            &ldquo;{demo.message}&rdquo;
          </p>
        </div>

        {/* CTA */}
        <section className="au" style={{ marginTop: 24, textAlign: 'center' }}>
          <div className="card" style={{ padding: 28 }}>
            <h3 className="fh" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Want to see <em>your</em> Glow Up?</h3>
            <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginBottom: 20, lineHeight: 1.7 }}>
              Pro members will soon be able to upload their photo and generate a personalised
              AI transformation across all four goals. Join the waitlist.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {user ? (
                <Link to="/pricing" data-testid="glow-cta-upgrade">
                  <button className="btn-p">Upgrade to Pro →</button>
                </Link>
              ) : (
                <Link to="/auth" data-testid="glow-cta-signup">
                  <button className="btn-p">Sign up for waitlist →</button>
                </Link>
              )}
              <Link to="/pricing"><button className="btn-o">See pricing</button></Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
