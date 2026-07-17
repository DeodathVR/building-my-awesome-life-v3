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
    const [countdown, setCountdown] = useState(1);
    const [cycleCount, setCycleCount] = useState(0);
    // sphereScale drives the animated glow overlay (grow on inhale, shrink on exhale)
    const [sphereScale, setSphereScale] = useState(0.65);

    const startRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        if (!isPlaying) {
            setPhaseIndex(0);
            setCountdown(1);
            setCycleCount(0);
            setSphereScale(0.65);
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

            // Countdown values:
            //   Breathe In : 1 → 4 (filling up, intuitive)
            //   Hold / Out : 4 → 1 (time remaining until next phase)
            const secondsElapsed = Math.min(
                phase.seconds,
                Math.floor(elapsedInPhase / 1000) + 1
            );
            const secondsLeft = Math.max(
                1,
                Math.ceil((phase.seconds * 1000 - elapsedInPhase) / 1000)
            );
            const displayCount = phase.key === 'inhale' ? secondsElapsed : secondsLeft;

            setPhaseIndex(index);
            setCountdown(displayCount);

            // Sphere breathing overlay scale — big, visible movement.
            const p = elapsedInPhase / (phase.seconds * 1000);
            let s;
            if (phase.key === 'inhale')       s = 0.65 + easeInOutSine(p) * 0.55; // 0.65 → 1.20
            else if (phase.key === 'hold-in') s = 1.20;                            // full, held
            else if (phase.key === 'exhale')  s = 1.20 - easeInOutSine(p) * 0.55;  // 1.20 → 0.65
            else /* hold-out */               s = 0.65;                            // empty, held
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

            {/* Phase cue (top) — italic teal, sits below the app title */}
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
                        fontSize: 28,
                        fontStyle: 'italic',
                        fontWeight: 400,
                        letterSpacing: 0.5,
                        transition: 'opacity 300ms ease',
                    }}
                >
                    {currentPhase.label}
                </div>
            </div>

            {/* Countdown number — CENTER of screen, directly over the sphere */}
            <div
                data-testid="breath-phase-countdown"
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                    fontSize: 108,
                    fontWeight: 200,
                    fontFamily: 'serif',
                    color: '#FFFFFF',
                    textShadow:
                        '0 0 24px rgba(62,156,140,0.9), 0 4px 20px rgba(0,0,0,0.35), 0 0 2px rgba(255,255,255,0.9)',
                    lineHeight: 1,
                    letterSpacing: -2,
                    pointerEvents: 'none',
                }}
            >
                {countdown}
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

            {/* Animated breathing sphere overlay — grows on inhale, shrinks on exhale.
                Sits directly on top of the sphere baked into the background image so
                the composition still reads correctly, but the size change is very visible. */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '30vmin',
                    height: '30vmin',
                    minWidth: 260,
                    minHeight: 260,
                    borderRadius: '50%',
                    transform: `translate(-50%, -50%) scale(${sphereScale})`,
                    background:
                        'radial-gradient(circle at 40% 38%, #EAF6F3 0%, #A6D6C9 18%, #4FA79A 55%, #2C5C56 82%, #1B3B3A 100%)',
                    boxShadow:
                        '0 0 60px rgba(126,200,184,0.55), 0 0 140px rgba(255,203,150,0.45), inset 0 0 40px rgba(255,255,255,0.28)',
                    transition: 'transform 90ms linear',
                    pointerEvents: 'none',
                }}
                data-testid="breath-sphere"
            >
                {/* Warm rim halo — matches the gold crescent in the background */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: -18,
                        borderRadius: '50%',
                        background:
                            'radial-gradient(circle, rgba(255,205,140,0) 55%, rgba(255,205,140,0.55) 68%, rgba(255,205,140,0) 82%)',
                        filter: 'blur(6px)',
                    }}
                />
                {/* Focus dot — always centered on the sphere */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: '#0F1B23',
                        boxShadow: '0 0 6px rgba(0,0,0,0.35)',
                    }}
                />
            </div>

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
