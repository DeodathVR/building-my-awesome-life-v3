import React, { useEffect, useRef, useState } from 'react';
import breathScene from '@/assets/breath-scene.png';

/**
 * Breath Counter — box breathing (4-4-4-4).
 *   Breathe In (4s) → Hold (4s) → Breathe Out (4s) → Hold (4s)  ⇒  16s cycle
 *
 * The scene is a photorealistic Nano-Banana sacred-geometry composition used as
 * the full-page background. The central sphere in the image is static; a subtle
 * animated glow overlay + phase cue at the top guide the breath.
 */

const PHASES = [
    { key: 'inhale',    label: 'Breathe In',  seconds: 4 },
    { key: 'hold-in',   label: 'Hold',        seconds: 4 },
    { key: 'exhale',    label: 'Breathe Out', seconds: 4 },
    { key: 'hold-out',  label: 'Hold',        seconds: 4 },
];
const CYCLE_MS = PHASES.reduce((a, p) => a + p.seconds * 1000, 0);

const phaseAt = (elapsedMs) => {
    let t = elapsedMs % CYCLE_MS;
    for (let i = 0; i < PHASES.length; i++) {
        const dur = PHASES[i].seconds * 1000;
        if (t < dur) {
            return { index: i, phase: PHASES[i], elapsedInPhase: t };
        }
        t -= dur;
    }
    return { index: 0, phase: PHASES[0], elapsedInPhase: 0 };
};

export const BreathCounter = ({ isPlaying }) => {
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [countdown, setCountdown] = useState(PHASES[0].seconds);
    const [cycleCount, setCycleCount] = useState(0);
    // sphereScale drives the animated glow overlay (grow on inhale, shrink on exhale)
    const [sphereScale, setSphereScale] = useState(0.85);

    const startRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        if (!isPlaying) {
            setPhaseIndex(0);
            setCountdown(PHASES[0].seconds);
            setCycleCount(0);
            setSphereScale(0.85);
            startRef.current = null;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            return;
        }

        startRef.current = performance.now();
        let lastCycle = 0;

        const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

        const tick = () => {
            const now = performance.now();
            const elapsed = now - startRef.current;
            const { index, phase, elapsedInPhase } = phaseAt(elapsed);
            const secondsLeft = Math.max(1, Math.ceil((phase.seconds * 1000 - elapsedInPhase) / 1000));

            setPhaseIndex(index);
            setCountdown(secondsLeft);

            // Sphere breathing overlay scale
            const p = elapsedInPhase / (phase.seconds * 1000);
            let s;
            if (phase.key === 'inhale')      s = 0.85 + easeInOutSine(p) * 0.25;
            else if (phase.key === 'hold-in')  s = 1.10;
            else if (phase.key === 'exhale') s = 1.10 - easeInOutSine(p) * 0.25;
            else /* hold-out */              s = 0.85;
            setSphereScale(s);

            const currentCycle = Math.floor(elapsed / CYCLE_MS);
            if (currentCycle !== lastCycle) {
                lastCycle = currentCycle;
                setCycleCount(currentCycle);
            }

            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [isPlaying]);

    const currentPhase = PHASES[phaseIndex];

    return (
        <div
            className="breath-scene"
            data-testid="breath-scene"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                backgroundColor: '#EFE6E6',
                backgroundImage: `url(${breathScene})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Soft top vignette to guarantee readable header/phase text */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background:
                        'linear-gradient(180deg, rgba(255,246,235,0.55) 0%, rgba(255,246,235,0) 22%, rgba(255,246,235,0) 70%, rgba(255,246,235,0.55) 100%)',
                }}
            />

            {/* Phase cue — italic teal, sits below the app title */}
            <div
                style={{
                    position: 'absolute',
                    top: 72,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    textAlign: 'center',
                    color: '#3E9C8C',
                }}
            >
                <div
                    data-testid="breath-phase-label"
                    style={{
                        fontSize: 26,
                        fontStyle: 'italic',
                        fontWeight: 400,
                        letterSpacing: 0.5,
                        transition: 'opacity 300ms ease',
                    }}
                >
                    {currentPhase.label}
                </div>
                <div
                    data-testid="breath-phase-countdown"
                    style={{ fontSize: 48, fontWeight: 300, marginTop: 6, color: '#2C6D62' }}
                >
                    {countdown}
                </div>
            </div>

            {/* Cycle counter — bottom left, small */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: 32,
                    transform: 'translateY(-50%)',
                    textAlign: 'right',
                    color: 'rgba(60,80,90,0.65)',
                }}
                data-testid="breath-cycle-count"
            >
                <div style={{ fontSize: 48, fontWeight: 300, color: '#3E9C8C' }}>{cycleCount}</div>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>Cycles</div>
            </div>

            {/* Sphere glow overlay — pulses with the breath, right over the sphere in the image */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '22vmin',
                    height: '22vmin',
                    minWidth: 180,
                    minHeight: 180,
                    borderRadius: '50%',
                    transform: `translate(-50%, -50%) scale(${sphereScale})`,
                    background:
                        'radial-gradient(circle at 40% 38%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 40%, rgba(126,200,184,0.35) 66%, rgba(255,205,140,0.30) 80%, rgba(255,205,140,0) 100%)',
                    filter: 'blur(6px)',
                    transition: 'transform 120ms linear',
                    pointerEvents: 'none',
                    mixBlendMode: 'screen',
                }}
                data-testid="breath-sphere-glow"
            />

            {/* Phase progress dots */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 10,
                }}
                data-testid="breath-phase-dots"
            >
                {PHASES.map((p, i) => (
                    <span
                        key={p.key}
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: i === phaseIndex ? '#3E9C8C' : 'rgba(62,156,140,0.28)',
                            boxShadow: i === phaseIndex ? '0 0 8px rgba(62,156,140,0.7)' : 'none',
                            transition: 'background 240ms ease, box-shadow 240ms ease',
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
