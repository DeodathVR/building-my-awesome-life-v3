import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './shared-pages.css';

const GOALS = [
  { id: 'fit', icon: '💪', label: 'Get Fit & Active', desc: 'Lean muscle, energy, and vitality' },
  { id: 'calm', icon: '🧘', label: 'Calm & Mindful', desc: 'Clarity, serenity, and inner peace' },
  { id: 'glow', icon: '✨', label: 'Glow & Confidence', desc: 'Radiant skin, posture, and presence' },
  { id: 'sharp', icon: '🧠', label: 'Sharp & Focused', desc: 'Mental clarity and peak performance' },
];

const STYLES = [
  { id: 'natural', label: 'Natural & Vibrant', desc: 'Authentic glow — healthy and radiant' },
  { id: 'aspirational', label: 'Aspirational', desc: 'Your best possible self — polished and confident' },
  { id: 'athlete', label: 'Athletic', desc: 'Strong, fit, and energised' },
  { id: 'zen', label: 'Zen & Calm', desc: 'Peaceful, balanced, serene energy' },
];

const STEPS = ['Photo', 'Goals', 'Style', 'Generate'];

export default function GlowUpPage() {
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState(null); // base64 string
  const [photoPreview, setPhotoPreview] = useState(null);
  const [goals, setGoals] = useState([]);
  const [style, setStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { image_base64, mime_type, message }
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const isPro = localStorage.getItem('alu_isPro') === 'true';
  const usedFree = localStorage.getItem('alu_glow_used') === 'true';
  const blocked = !isPro && usedFree;

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { setError('Please upload an image file (JPG, PNG, WEBP).'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB.'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];
      setPhoto(base64);
      setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!photo || goals.length === 0 || !style) { setError('Please complete all steps first.'); return; }
    setLoading(true);
    setError('');
    const prompt = `Transform this person's photo to show their best self after achieving: ${goals.map(g => GOALS.find(x => x.id === g)?.label).join(', ')}. Style: ${STYLES.find(s => s.id === style)?.label}. Make it aspirational and motivational while keeping them recognisable.`;
    const goalsText = goals.map(g => GOALS.find(x => x.id === g)?.label).join(', ');
    try {
      const res = await fetch(`${window.location.origin}/api/glow-up/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: photo, prompt, goals: goalsText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Generation failed');
      setResult(data);
      localStorage.setItem('alu_glow_used', 'true');
      setStep(4);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = `data:${result.mime_type};base64,${result.image_base64}`;
    link.download = 'glow-up-transformation.png';
    link.click();
  };

  const reset = () => { setStep(0); setPhoto(null); setPhotoPreview(null); setGoals([]); setStyle(''); setResult(null); setError(''); };

  return (
    <div className="alu-s" data-testid="glow-up-page">
      <div className="orb" style={{ left: '-5%', top: '-5%', width: 400, height: 400, background: 'rgba(129,199,132,0.07)', filter: 'blur(120px)', animationDuration: '13s' }} />
      <div className="orb" style={{ left: '85%', top: '60%', width: 340, height: 340, background: 'rgba(255,213,79,0.06)', filter: 'blur(110px)', animationDuration: '17s', animationDelay: '2s' }} />
      <div className="grid-dot-bg" />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <section className="au" style={{ paddingTop: 52, paddingBottom: 36, textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, color: 'var(--sage-d)', marginBottom: 12 }}>AI Transformation</p>
          <h1 className="fh" style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.05, letterSpacing: -.5, marginBottom: 14 }}>
            See your <span className="glow-text">Glow Up</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--muted-fg)', maxWidth: 480, margin: '0 auto', lineHeight: 1.75 }}>
            Upload a photo, set your habit goals, and let AI show you a vision of your best self.
          </p>
        </section>

        {/* Paywall for non-pro, post free use */}
        {blocked && step < 4 && (
          <div className="card au" style={{ padding: '32px 28px', textAlign: 'center', marginBottom: 32, border: '1.5px solid rgba(255,213,79,.4)' }}>
            <p style={{ fontSize: 36, marginBottom: 16 }}>🔒</p>
            <h2 className="fh" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>You've used your free transformation</h2>
            <p style={{ fontSize: 14, color: 'var(--muted-fg)', lineHeight: 1.75, marginBottom: 24 }}>Upgrade to Pro to unlock unlimited Glow Up transformations, AI refinement, and HD downloads.</p>
            <Link to="/pricing"><button className="btn-p">Upgrade to Pro — 7-day free trial</button></Link>
          </div>
        )}

        {/* Step indicator */}
        {step < 4 && !blocked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, justifyContent: 'center' }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 99, background: i < step ? 'var(--primary)' : i === step ? 'var(--primary)' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: i <= step ? '#fff' : 'var(--muted-fg)', transition: 'all .3s' }}>{i < step ? '✓' : i + 1}</div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: i === step ? 'var(--fg)' : 'var(--muted-fg)' }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, borderRadius: 2, background: i < step ? 'var(--primary)' : 'var(--muted)' }} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* STEP 0: Upload */}
        {step === 0 && !blocked && (
          <div className="card au" style={{ padding: '28px' }}>
            <h2 className="fh" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Upload Your Photo</h2>
            <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginBottom: 20, lineHeight: 1.65 }}>Use a clear, recent photo of your face. A neutral background works best.</p>
            {photoPreview ? (
              <div style={{ textAlign: 'center' }}>
                <img src={photoPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 280, borderRadius: 16, objectFit: 'cover', boxShadow: 'var(--shadow-m)', marginBottom: 16 }} />
                <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginBottom: 16 }}>Photo ready!</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button className="btn-o" onClick={() => { setPhoto(null); setPhotoPreview(null); }}>Change photo</button>
                  <button className="btn-p" onClick={() => setStep(1)} data-testid="next-step-1">Next: Set Goals →</button>
                </div>
              </div>
            ) : (
              <div
                className={`drop-zone${dragOver ? ' drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current.click()}
                data-testid="photo-drop-zone"
              >
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                <p style={{ fontSize: 36, marginBottom: 12 }}>📸</p>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Drop your photo here</p>
                <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>or click to browse · JPG, PNG, WEBP · max 10MB</p>
              </div>
            )}
            {error && <p style={{ fontSize: 13, color: '#ef4444', fontWeight: 600, marginTop: 12, textAlign: 'center' }}>{error}</p>}
          </div>
        )}

        {/* STEP 1: Goals */}
        {step === 1 && !blocked && (
          <div className="card au" style={{ padding: '28px' }}>
            <h2 className="fh" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Set Your Goals</h2>
            <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginBottom: 20, lineHeight: 1.65 }}>Select the habits and improvements you're working on. Choose 1-3.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
              {GOALS.map(g => (
                <div key={g.id} className={`chip${goals.includes(g.id) ? ' sel' : ''}`} onClick={() => setGoals(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : prev.length < 3 ? [...prev, g.id] : prev)} data-testid={`goal-${g.id}`}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{g.icon}</div>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{g.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted-fg)' }}>{g.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-o" onClick={() => setStep(0)}>← Back</button>
              <button className="btn-p" onClick={() => setStep(2)} disabled={goals.length === 0} data-testid="next-step-2">Next: Choose Style →</button>
            </div>
          </div>
        )}

        {/* STEP 2: Style */}
        {step === 2 && !blocked && (
          <div className="card au" style={{ padding: '28px' }}>
            <h2 className="fh" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Choose Your Style</h2>
            <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginBottom: 20, lineHeight: 1.65 }}>How would you like your transformation visualised?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {STYLES.map(s => (
                <div key={s.id} className={`chip${style === s.id ? ' sel' : ''}`} onClick={() => setStyle(s.id)} data-testid={`style-${s.id}`}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{s.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted-fg)' }}>{s.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-o" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-p" onClick={() => setStep(3)} disabled={!style} data-testid="next-step-3">Next: Generate →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Generate */}
        {step === 3 && !blocked && (
          <div className="card au" style={{ padding: '28px' }}>
            <h2 className="fh" style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Ready to Glow Up?</h2>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
              {photoPreview && <img src={photoPreview} alt="Your photo" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />}
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Your transformation plan:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {goals.map(g => { const goal = GOALS.find(x => x.id === g); return <span key={g} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'var(--primary-l)', color: 'var(--primary)' }}>{goal?.icon} {goal?.label}</span>; })}
                  {style && <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,213,79,.15)', color: 'var(--accent-fg)' }}>{STYLES.find(s => s.id === style)?.label}</span>}
                </div>
              </div>
            </div>
            {error && <p style={{ fontSize: 13, color: '#ef4444', fontWeight: 600, marginBottom: 14 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-o" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-p" onClick={generate} disabled={loading} data-testid="generate-btn">
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'alu-spin .7s linear infinite' }} />
                    Generating your Glow Up...
                  </span>
                ) : 'Generate My Glow Up ✨'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 12 }}>Generation takes 10-30 seconds · Powered by Gemini AI</p>
          </div>
        )}

        {/* STEP 4: Result */}
        {step === 4 && result && (
          <div className="card au" style={{ padding: '28px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, color: 'var(--sage-d)', marginBottom: 12 }}>Your Glow Up</p>
            <h2 className="fh" style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Here's your best self</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Before</p>
                {photoPreview && <img src={photoPreview} alt="Before" style={{ width: '100%', borderRadius: 14, objectFit: 'cover', aspectRatio: '1', boxShadow: 'var(--shadow-s)' }} />}
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>After</p>
                <img src={`data:${result.mime_type};base64,${result.image_base64}`} alt="Glow Up result" style={{ width: '100%', borderRadius: 14, objectFit: 'cover', aspectRatio: '1', boxShadow: 'var(--shadow-m)' }} data-testid="glow-result-img" />
              </div>
            </div>
            {result.message && <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginBottom: 24, lineHeight: 1.7, fontStyle: 'italic' }}>"{result.message}"</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {isPro ? (
                <button className="btn-p" onClick={download} data-testid="download-btn">Download HD</button>
              ) : (
                <Link to="/pricing"><button className="btn-p">Upgrade for HD Download →</button></Link>
              )}
              <button className="btn-o" onClick={reset} data-testid="try-again-btn">Try Again</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
