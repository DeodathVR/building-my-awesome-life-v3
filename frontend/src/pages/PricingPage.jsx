import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './shared-pages.css';

const PRO_KEY = 'alu_isPro';

const TIERS = [
  {
    id: 'free', name: 'Free', tagline: 'Start your journey',
    monthly: 0, annual: 0,
    cta: 'Get Started Free', ctaStyle: 'outline',
    featured: false,
    features: [
      { label: 'Habit tracking (unlimited habits)', included: true },
      { label: 'Home dashboard', included: true },
      { label: 'Community access', included: true },
      { label: '5 starter focus games (1 per type)', included: true },
      { label: 'AI Coach — 5 messages/day', included: 'partial', note: '5/day' },
      { label: '1 free Glow Up transformation', included: 'partial', note: '1 only' },
      { label: 'All 15 focus mini-games', included: false },
      { label: 'Unlimited Glow Up + AI refinement', included: false },
      { label: 'HD download & social share', included: false },
      { label: 'Advanced analytics', included: false },
      { label: 'Early access to new features', included: false },
      { label: 'Family members (up to 5)', included: false },
    ],
  },
  {
    id: 'pro', name: 'Pro', tagline: 'For the serious habit builder',
    monthly: 9.99, annual: 99.99,
    cta: 'Start 7-Day Free Trial', ctaStyle: 'primary',
    featured: true, badge: 'Most Popular',
    features: [
      { label: 'Habit tracking (unlimited habits)', included: true },
      { label: 'Home dashboard', included: true },
      { label: 'Community access', included: true },
      { label: '5 starter focus games (1 per type)', included: true },
      { label: 'AI Coach — unlimited', included: true },
      { label: 'Unlimited Glow Up transformations', included: true },
      { label: 'All 15 focus mini-games', included: true },
      { label: 'AI refinement dialog', included: true },
      { label: 'HD download & social share', included: true },
      { label: 'Advanced analytics', included: true },
      { label: 'Early access to new features', included: true },
      { label: 'Family members (up to 5)', included: false },
    ],
  },
  {
    id: 'family', name: 'Family', tagline: 'Build habits together',
    monthly: 19.99, annual: 199.99,
    cta: 'Start Family Trial', ctaStyle: 'primary',
    featured: false, badge: 'Best Value',
    features: [
      { label: 'Habit tracking (unlimited habits)', included: true },
      { label: 'Home dashboard', included: true },
      { label: 'Community access', included: true },
      { label: '5 starter focus games (1 per type)', included: true },
      { label: 'AI Coach — unlimited', included: true },
      { label: 'Unlimited Glow Up transformations', included: true },
      { label: 'All 15 focus mini-games', included: true },
      { label: 'AI refinement dialog', included: true },
      { label: 'HD download & social share', included: true },
      { label: 'Advanced analytics', included: true },
      { label: 'Early access to new features', included: true },
      { label: 'Family members (up to 5)', included: true },
    ],
  },
];

const FAQS = [
  { q: 'Can I cancel anytime?', a: 'Yes — cancel before your trial ends and you won\'t be charged. Cancel your subscription any time from account settings with immediate effect.' },
  { q: 'What counts as a "Glow Up transformation"?', a: 'Each time you upload a photo and generate an AI transformation result, that uses one credit. Refining an existing result does not count as a new transformation.' },
  { q: 'How do Focus Games count toward the free tier?', a: 'Free users get one game from each challenge type. All 10 games are available to Pro and Family subscribers.' },
  { q: 'Does the Family plan share a single subscription?', a: 'Yes — one account holder manages the subscription. Up to 4 additional family members can join, each with their own separate habits, streaks, and Glow Ups.' },
  { q: 'Is my photo data secure?', a: 'Your photos are encrypted in transit and at rest. They are processed solely for generating your transformation and are never used to train AI models.' },
  { q: 'What payment methods do you accept?', a: 'All major credit/debit cards via Stripe. Apple Pay and Google Pay coming soon.' },
];

const CheckIcon = ({ included }) => {
  if (included === true) return <div className="check yes">✓</div>;
  if (included === false) return <div className="check no">–</div>;
  return <div className="check partial" title="Limited">~</div>;
};

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

const PricingCard = ({ tier, annual, onSelect, proActive, idx }) => {
  const price = annual ? tier.annual : tier.monthly;
  const perMonth = annual && tier.annual > 0 ? (tier.annual / 12).toFixed(2) : null;
  return (
    <div className={`price-card au${tier.featured ? ' featured' : ''}`} style={{ animationDelay: `${idx * .08}s` }}>
      {tier.badge && (
        <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: tier.id === 'family' ? 'linear-gradient(135deg,var(--sage),var(--sage-d))' : 'linear-gradient(135deg,var(--primary),var(--primary-d))', color: '#fff', fontSize: 11, fontWeight: 800, padding: '5px 16px', borderRadius: 99, boxShadow: '0 4px 12px rgba(77,182,172,.35)', whiteSpace: 'nowrap' }}>{tier.badge}</div>
      )}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--muted-fg)', marginBottom: 6 }}>{tier.tagline}</p>
        <h2 className="fh" style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{tier.name}</h2>
        {price === 0 ? (
          <div>
            <p className="mono" style={{ fontSize: 42, fontWeight: 800, color: 'var(--fg)', lineHeight: 1 }}>Free</p>
            <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginTop: 4 }}>forever</p>
          </div>
        ) : annual && perMonth ? (
          <div>
            <p className="mono" style={{ fontSize: 42, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>${perMonth}<span style={{ fontSize: 16, fontWeight: 500, color: 'var(--muted-fg)' }}>/mo</span></p>
            <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 4 }}>billed ${tier.annual}/yr · <span style={{ color: 'var(--primary)', fontWeight: 700 }}>2 months free</span></p>
          </div>
        ) : (
          <div>
            <p className="mono" style={{ fontSize: 42, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>${price}<span style={{ fontSize: 16, fontWeight: 500, color: 'var(--muted-fg)' }}>/mo</span></p>
            <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 4 }}>billed monthly</p>
          </div>
        )}
      </div>
      <div style={{ marginBottom: 24 }}>
        {tier.id === 'free' ? (
          <Link to="/"><button className="btn-o" style={{ width: '100%' }}>Get Started Free</button></Link>
        ) : proActive && tier.id === 'pro' ? (
          <button className="btn-p" style={{ width: '100%', background: 'var(--sage-d)', cursor: 'default' }}>✓ You're on Pro</button>
        ) : (
          <button className="btn-p" style={{ width: '100%' }} onClick={() => onSelect(tier)} data-testid={`select-${tier.id}`}>{tier.cta}</button>
        )}
        {tier.id !== 'free' && <p style={{ fontSize: 11, color: 'var(--muted-fg)', textAlign: 'center', marginTop: 8 }}>7-day free trial · Cancel anytime</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {tier.features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckIcon included={f.included} />
            <span style={{ fontSize: 13, color: f.included ? 'var(--fg)' : 'var(--muted-fg)', lineHeight: 1.4 }}>
              {f.label}
              {f.note && <span style={{ fontSize: 11, color: 'var(--accent-fg)', fontWeight: 700, marginLeft: 4 }}>({f.note})</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [proActive, setProActive] = useState(() => localStorage.getItem(PRO_KEY) === 'true');
  const [toast, setToast] = useState(null);

  const handleSelect = (tier) => {
    localStorage.setItem(PRO_KEY, 'true');
    setProActive(true);
    setToast(`Welcome to ${tier.name}! Your 7-day trial has started.`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDowngrade = () => {
    localStorage.removeItem(PRO_KEY);
    setProActive(false);
    setToast('Subscription cancelled. You\'re back on the Free plan.');
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="alu-s" data-testid="pricing-page">
      <div className="orb" style={{ left: '-5%', top: '-5%', width: 420, height: 420, background: 'rgba(77,182,172,0.07)', filter: 'blur(130px)', animationDuration: '13s' }} />
      <div className="orb" style={{ left: '80%', top: '75%', width: 360, height: 360, background: 'rgba(255,213,79,0.06)', filter: 'blur(110px)', animationDuration: '17s', animationDelay: '2s' }} />
      <div className="grid-dot-bg" />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <section style={{ textAlign: 'center', paddingTop: 56, paddingBottom: 48 }} className="au">
          {proActive && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--primary-l)', border: '1.5px solid rgba(77,182,172,.3)', borderRadius: 99, padding: '8px 18px', marginBottom: 20 }}>
              <span style={{ fontSize: 14 }}>✓</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>You're on Pro — enjoy all features!</span>
              <button onClick={handleDowngrade} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--muted-fg)', fontFamily: 'Manrope,sans-serif', textDecoration: 'underline' }}>Cancel</button>
            </div>
          )}
          <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, color: 'var(--primary)', marginBottom: 12 }}>Simple, transparent pricing</p>
          <h1 className="fh" style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.05, letterSpacing: -.5, marginBottom: 14 }}>
            Invest in your <span className="glow-text">best self</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--muted-fg)', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Start free. Upgrade when you're ready to unlock the full power of your habit ecosystem.
          </p>
          <div className="toggle-wrap">
            <button className={`toggle-btn${!annual ? ' active' : ''}`} onClick={() => setAnnual(false)} data-testid="monthly-toggle">Monthly</button>
            <button className={`toggle-btn${annual ? ' active' : ''}`} onClick={() => setAnnual(true)} data-testid="annual-toggle">
              Annual <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 800, background: 'linear-gradient(135deg,var(--primary),var(--primary-d))', color: '#fff', padding: '1px 7px', borderRadius: 20 }}>−17%</span>
            </button>
          </div>
        </section>

        {/* Pricing cards */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start', paddingBottom: 64 }} className="resp-grid-3">
          {TIERS.map((tier, i) => <PricingCard key={tier.id} tier={tier} annual={annual} onSelect={handleSelect} proActive={proActive} idx={i} />)}
        </section>

        {/* Comparison table */}
        <section style={{ marginBottom: 64 }}>
          <h2 className="fh" style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>Everything included</h2>
          <div style={{ background: 'var(--card)', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(207,216,220,.5)', boxShadow: 'var(--shadow-s)' }}>
            <div className="comp-row" style={{ background: 'var(--primary-l)', fontWeight: 800 }}>
              <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--primary)' }}>Feature</span>
              {TIERS.map(t => <span key={t.id} className="comp-cell" style={{ color: t.featured ? 'var(--primary)' : 'var(--fg)', fontSize: 14 }}>{t.name}</span>)}
            </div>
            {[
              ['Habit tracking', true, true, true],
              ['Home dashboard', true, true, true],
              ['Community access', true, true, true],
              ['Starter focus games (5)', true, true, true],
              ['All 10 focus mini-games', false, true, true],
              ['Glow Up transformations', '1 free', 'Unlimited', 'Unlimited'],
              ['AI refinement dialog', false, true, true],
              ['HD download & share', false, true, true],
              ['AI Coach', '5/day', 'Unlimited', 'Unlimited'],
              ['Advanced analytics', false, true, true],
              ['Early feature access', false, true, true],
              ['Family members', '1', '1', 'Up to 5'],
            ].map(([label, ...vals], i) => (
              <div key={i} className="comp-row">
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>{label}</span>
                {vals.map((v, j) => (
                  <div key={j} className="comp-cell">
                    {v === true ? <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 15 }}>✓</span>
                      : v === false ? <span style={{ color: 'var(--border)', fontSize: 15 }}>–</span>
                        : <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-fg)', background: 'rgba(255,213,79,.2)', padding: '2px 7px', borderRadius: 20 }}>{v}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 64 }} className="resp-grid-3">
          {[
            { quote: 'I\'ve tried every habit app. This one actually stuck — the focus games made it addictive in the best way.', name: 'Sarah M.', role: 'Product designer' },
            { quote: 'The Glow Up feature genuinely motivated me. Seeing my potential self every morning changed something.', name: 'James T.', role: 'Entrepreneur' },
            { quote: 'My whole family uses it now. The concentration games became our evening ritual.', name: 'Priya K.', role: 'Educator' },
          ].map((t, i) => (
            <div key={i} className="card" style={{ padding: '22px 24px' }}>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--fg)', fontStyle: 'italic', marginBottom: 14 }}>"{t.quote}"</p>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</p>
              <p style={{ fontSize: 11, color: 'var(--muted-fg)' }}>{t.role}</p>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 680, margin: '0 auto 64px' }}>
          <h2 className="fh" style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>Common questions</h2>
          <div className="card" style={{ padding: '8px 24px' }}>
            {FAQS.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--primary-l) 0%, rgba(255,213,79,.08) 100%)', borderRadius: 28, padding: '48px 32px', border: '1.5px solid rgba(77,182,172,.2)' }}>
          <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, color: 'var(--primary)', marginBottom: 12 }}>Start today</p>
          <h2 className="fh" style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>7 days free, no card required</h2>
          <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginBottom: 28, lineHeight: 1.7 }}>Join thousands building their awesome life — one habit at a time.</p>
          {!proActive ? (
            <button className="btn-p" style={{ maxWidth: 280, display: 'block', margin: '0 auto' }} onClick={() => handleSelect(TIERS[1])} data-testid="bottom-cta-btn">
              Start Free Trial →
            </button>
          ) : (
            <Link to="/"><button className="btn-p" style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}>Go to Your Dashboard →</button></Link>
          )}
          <p style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 12 }}>Cancel anytime · No hidden fees · Secure payments via Stripe</p>
        </section>
      </div>

      {toast && (
        <div className="toast-msg">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} style={{ background: 'rgba(255,255,255,.25)', border: 'none', borderRadius: 50, width: 20, height: 20, cursor: 'pointer', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
      )}
    </div>
  );
}
