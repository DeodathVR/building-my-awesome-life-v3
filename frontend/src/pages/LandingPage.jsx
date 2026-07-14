/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Target, Gamepad2, Wand2, BookOpen, MessageCircle, Users, Zap, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import mandalaWatermark from '../assets/mandala-watermark.png';
import { useSEO } from '../hooks/useSEO';
import './shared-pages.css';

const FEATURES = [
  { icon: Target, title: 'Habit Tracker', desc: 'Log habits with 30-day heatmaps, streaks, and gentle nudges.', href: '/how-to-use' },
  { icon: Gamepad2, title: '15 Focus Games', desc: 'Memory, speed, deep-work, and micro-workout mini-games.', href: '/concentration-games' },
  { icon: Sparkles, title: 'Awesome Feed', desc: 'Daily AI-generated motivation, mindfulness, and micro-lessons.', href: '/feed' },
  { icon: Wand2, title: 'Success Conspiracy', desc: 'Reframe negative thoughts through a supportive cosmic lens.', href: '/conspiracy' },
  { icon: Zap, title: 'Glow Up Gallery', desc: 'AI-imagined visions of your best self. Preview instantly.', href: '/glow-up' },
  { icon: Users, title: 'Community', desc: 'Anonymous wins, challenges, and encouragement.', href: '/community' },
  { icon: BookOpen, title: 'Learn', desc: 'Bite-size research on habits, focus, and mindset science.', href: '/education' },
  { icon: MessageCircle, title: 'AI Coach', desc: 'A personalised guide that meets you where you are.', href: '/pricing' },
];

const TESTIMONIALS = [
  { quote: 'I finally stopped starting over. 47 days into meditation.', name: 'Anonymous · Trinidad' },
  { quote: 'The Cosmic Reframer talked me off the ledge at 2 a.m.', name: 'Anonymous · London' },
  { quote: 'Games make focus feel like play. My kid loves it too.', name: 'Anonymous · Toronto' },
];

export default function LandingPage() {
  useSEO({
    title: 'Habits, focus & mindful growth',
    description: 'A minimalist web app that helps you build daily habits, sharpen focus with concentration mini-games, reframe negative thoughts, and see your best self — powered by mindfulness and AI. 7-day free trial.',
    path: '/',
  });
  return (
    <div className="alu-s landing-hero" data-testid="landing-page">
      {/* Mandala hero backdrop — subtler + fade-out below the fold */}
      <div
        className="mandala-watermark mandala-v1"
        aria-hidden="true"
        data-testid="landing-mandala"
        style={{ backgroundImage: `url(${mandalaWatermark})`, opacity: 0.18 }}
      />
      {/* Radial vignette behind hero copy so text stays crisp over the mandala */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 780,
          background: 'radial-gradient(ellipse at 50% 32%, var(--bg) 0%, transparent 55%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* HERO */}
        <section className="au" style={{ paddingTop: 72, paddingBottom: 56, textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, color: 'var(--primary)', marginBottom: 16 }}>
            Building My Awesome Life Daily
          </p>
          <h1 className="fh" style={{ fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 700, lineHeight: 1.02, letterSpacing: -1.5, marginBottom: 20 }}>
            Small habits.<br />
            <span className="glow-text">Awesome life.</span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--muted-fg)', maxWidth: 620, margin: '0 auto 32px', lineHeight: 1.75 }}>
            A minimalist web app that helps you build daily habits, sharpen focus with mini-games,
            reframe negative thoughts, and see your best self — powered by mindfulness and AI.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth" data-testid="hero-cta-signup">
              <button className="btn-p" style={{ fontSize: 15, padding: '15px 34px' }}>
                Start free — 7-day trial
                <ArrowRight className="inline-block ml-2 w-4 h-4" strokeWidth={2} />
              </button>
            </Link>
            <Link to="/feed" data-testid="hero-cta-explore">
              <button className="btn-o" style={{ fontSize: 15, padding: '14px 30px' }}>
                Explore the Feed →
              </button>
            </Link>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', fontSize: 12, color: 'var(--muted-fg)', fontWeight: 600 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" strokeWidth={2} /> No credit card to browse
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" strokeWidth={2} /> Cancel anytime
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Shield className="w-3.5 h-3.5 text-primary" strokeWidth={2} /> Private &amp; secure
            </span>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="au" style={{ paddingBottom: 56, animationDelay: '.1s' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--muted-fg)', marginBottom: 8 }}>What's inside</p>
            <h2 className="fh" style={{ fontSize: 30, fontWeight: 700, marginBottom: 8 }}>Eight tools. One awesome life.</h2>
            <p style={{ fontSize: 14, color: 'var(--muted-fg)', maxWidth: 520, margin: '0 auto' }}>
              Try most features for free — no sign-up required. Upgrade to Pro to unlock everything.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {FEATURES.map(({ icon: Icon, title, desc, href }, i) => (
              <Link
                key={title}
                to={href}
                data-testid={`landing-feature-${title.toLowerCase().replace(/\s+/g, '-')}`}
                className="card"
                style={{ padding: 20, textDecoration: 'none', color: 'inherit', transition: '.25s', display: 'block' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-m)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-s)'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{title}</p>
                <p style={{ fontSize: 13, color: 'var(--muted-fg)', lineHeight: 1.55 }}>{desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="au" style={{ paddingBottom: 56, animationDelay: '.2s' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--muted-fg)', marginBottom: 6 }}>What members say</p>
            <h2 className="fh" style={{ fontSize: 26, fontWeight: 700 }}>Small shifts. Loud impact.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card" style={{ padding: 22 }} data-testid={`landing-testimonial-${i}`}>
                <p style={{ fontSize: 15, fontStyle: 'italic', lineHeight: 1.65, marginBottom: 12 }}>&ldquo;{t.quote}&rdquo;</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)' }}>— {t.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="au" style={{ paddingBottom: 32, animationDelay: '.3s', textAlign: 'center' }}>
          <div className="card" style={{ padding: '44px 28px', maxWidth: 620, margin: '0 auto', background: 'linear-gradient(135deg, var(--primary-l), var(--card))', border: '1.5px solid rgba(77,182,172,0.3)' }}>
            <h2 className="fh" style={{ fontSize: 30, fontWeight: 700, marginBottom: 12 }}>
              Ready to build your <span className="glow-text">awesome life</span>?
            </h2>
            <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginBottom: 24, lineHeight: 1.7 }}>
              Free forever tier · Pro $9.99/mo · Family $19.99/mo · 7-day free trial · Cancel anytime.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/auth" data-testid="footer-cta-signup">
                <button className="btn-p" style={{ fontSize: 15, padding: '14px 32px' }}>Create free account</button>
              </Link>
              <Link to="/pricing" data-testid="footer-cta-pricing">
                <button className="btn-o" style={{ fontSize: 15, padding: '13px 28px' }}>See pricing →</button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
