import React, { useEffect, useState } from 'react';

/**
 * Circle Concentration — cinematic breathing exercise
 * Pastel sacred-geometry backdrop, glowing teal orbs on 8 points,
 * central teal sphere with focus dot. Breathes with `isPlaying`.
 */
export const ExpandingCircle = ({ isPlaying }) => {
    const [scale, setScale] = useState(0.55);
    const [expanding, setExpanding] = useState(true);

    useEffect(() => {
        if (!isPlaying) {
            setScale(0.55);
            setExpanding(true);
            return;
        }

        const breathCycle = 8000; // 4s in / 4s out
        const startTime = Date.now();
        let frameId;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const cycleProgress = (elapsed % breathCycle) / breathCycle;

            if (cycleProgress < 0.5) {
                const p = cycleProgress * 2;
                setScale(0.55 + p * 0.55);
                setExpanding(true);
            } else {
                const p = (cycleProgress - 0.5) * 2;
                setScale(1.1 - p * 0.55);
                setExpanding(false);
            }

            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [isPlaying]);

    return (
        <div
            className="circle-scene"
            data-testid="circle-scene"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                background:
                    'linear-gradient(120deg, #FFE9D2 0%, #F7EAD9 22%, #EFE6E6 48%, #E6DDEA 72%, #DED3E4 100%)',
            }}
        >
            {/* Breathe In / Out cue */}
            <div
                style={{
                    position: 'absolute',
                    top: 72,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    color: '#3E9C8C',
                    fontSize: 22,
                    fontWeight: 400,
                    letterSpacing: 0.5,
                    fontStyle: 'italic',
                }}
                data-testid="breath-cue"
            >
                {expanding ? 'Breathe In' : 'Breathe Out'}
            </div>

            {/* Sacred geometry backdrop (pure SVG) */}
            <svg
                aria-hidden="true"
                data-testid="circle-mandala-backdrop"
                viewBox="0 0 800 800"
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '110%',
                    height: '110%',
                    minWidth: 900,
                    minHeight: 900,
                    opacity: 0.55,
                    pointerEvents: 'none',
                }}
            >
                <defs>
                    <linearGradient id="geo-stroke" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#F4C89A" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#B9D9CE" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#C7B7D8" stopOpacity="0.9" />
                    </linearGradient>
                    <radialGradient id="geo-glow" cx="50%" cy="50%" r="55%">
                        <stop offset="0%" stopColor="rgba(255,222,180,0.55)" />
                        <stop offset="55%" stopColor="rgba(200,220,214,0.25)" />
                        <stop offset="100%" stopColor="rgba(200,190,220,0)" />
                    </radialGradient>
                </defs>

                {/* Warm central glow */}
                <circle cx="400" cy="400" r="360" fill="url(#geo-glow)" />

                {/* Long diagonal geometry lines */}
                <g stroke="url(#geo-stroke)" strokeWidth="0.8" fill="none" opacity="0.7">
                    {Array.from({ length: 6 }).map((_, i) => {
                        const angle = (i * 180) / 6;
                        return (
                            <line
                                key={`diag-${i}`}
                                x1="100"
                                y1="400"
                                x2="700"
                                y2="400"
                                transform={`rotate(${angle} 400 400)`}
                            />
                        );
                    })}
                </g>

                {/* Overlapping triangle geometry */}
                <g stroke="url(#geo-stroke)" strokeWidth="0.9" fill="none" opacity="0.55">
                    {Array.from({ length: 3 }).map((_, i) => {
                        const angle = i * 120;
                        return (
                            <polygon
                                key={`tri-${i}`}
                                points="400,140 620,540 180,540"
                                transform={`rotate(${angle} 400 400)`}
                            />
                        );
                    })}
                </g>

                {/* Concentric rings */}
                <g stroke="url(#geo-stroke)" fill="none" opacity="0.55">
                    <circle cx="400" cy="400" r="120" strokeWidth="0.7" />
                    <circle cx="400" cy="400" r="180" strokeWidth="0.6" />
                    <circle cx="400" cy="400" r="240" strokeWidth="0.5" />
                    <circle cx="400" cy="400" r="300" strokeWidth="0.5" />
                    <circle cx="400" cy="400" r="355" strokeWidth="0.45" />
                </g>

                {/* Tiny geometric flecks (top-right area from reference) */}
                <g fill="none" stroke="url(#geo-stroke)" strokeWidth="0.6" opacity="0.6">
                    <rect x="620" y="180" width="18" height="18" transform="rotate(15 629 189)" />
                    <polygon points="710,260 725,285 695,285" />
                    <line x1="640" y1="240" x2="720" y2="200" />
                </g>

                {/* Star sparkles scattered across pastel canvas */}
                {[
                    [180, 250], [140, 520], [260, 640], [560, 660], [660, 520],
                    [700, 340], [340, 180], [500, 200], [230, 380], [580, 380],
                    [420, 610], [140, 380], [720, 460], [370, 720], [560, 100],
                ].map(([cx, cy], i) => (
                    <g key={`spark-${i}`}>
                        <circle cx={cx} cy={cy} r="1.6" fill="#FFF8E8" />
                        <circle cx={cx} cy={cy} r="4" fill="#FFF8E8" opacity="0.35" />
                    </g>
                ))}
            </svg>

            {/* 8 glowing teal orbs on outer ring — evenly spaced */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 560,
                    height: 560,
                    maxWidth: '85vmin',
                    maxHeight: '85vmin',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                }}
            >
                {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i * 360) / 8 - 90;
                    const rad = (angle * Math.PI) / 180;
                    const r = 48; // percent
                    const x = 50 + r * Math.cos(rad);
                    const y = 50 + r * Math.sin(rad);
                    return (
                        <div
                            key={`orb-${i}`}
                            data-testid={`circle-orb-${i}`}
                            style={{
                                position: 'absolute',
                                left: `${x}%`,
                                top: `${y}%`,
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                transform: 'translate(-50%, -50%)',
                                background:
                                    'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(126,200,184,0.95) 45%, rgba(126,200,184,0) 75%)',
                                boxShadow: '0 0 24px rgba(126,200,184,0.85), 0 0 48px rgba(126,200,184,0.45)',
                                animation: isPlaying
                                    ? `orb-pulse 4s ease-in-out ${i * 0.25}s infinite`
                                    : 'none',
                            }}
                        />
                    );
                })}
            </div>

            {/* Central breathing sphere */}
            <div
                data-testid="circle-central-sphere"
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    width: 260,
                    height: 260,
                    maxWidth: '38vmin',
                    maxHeight: '38vmin',
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle at 40% 38%, #EAF6F3 0%, #A6D6C9 18%, #4FA79A 55%, #2C5C56 82%, #1B3B3A 100%)',
                    boxShadow:
                        '0 0 60px rgba(126,200,184,0.55), 0 0 120px rgba(255,203,150,0.35), inset 0 0 40px rgba(255,255,255,0.35)',
                    transition: 'transform 100ms linear',
                }}
            >
                {/* Warm rim glow */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: -14,
                        borderRadius: '50%',
                        background:
                            'radial-gradient(circle, rgba(255,205,140,0) 55%, rgba(255,205,140,0.55) 68%, rgba(255,205,140,0) 82%)',
                        filter: 'blur(6px)',
                        pointerEvents: 'none',
                    }}
                />
                {/* Central focus dot */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: '#0F1B23',
                        boxShadow: '0 0 6px rgba(0,0,0,0.35)',
                    }}
                />
            </div>

            {/* Ambient floating sparkles */}
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {Array.from({ length: 22 }).map((_, i) => (
                    <span
                        key={`fleck-${i}`}
                        style={{
                            position: 'absolute',
                            left: `${(i * 41) % 100}%`,
                            top: `${(i * 53) % 100}%`,
                            width: 3,
                            height: 3,
                            borderRadius: '50%',
                            background: 'rgba(255,255,240,0.85)',
                            boxShadow: '0 0 6px rgba(255,255,240,0.85)',
                            opacity: 0.55,
                            animation: isPlaying
                                ? `circle-fleck ${5 + (i % 5)}s ease-in-out ${i * 0.2}s infinite`
                                : 'none',
                        }}
                    />
                ))}
            </div>

            <style>{`
                @keyframes orb-pulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1);   opacity: 0.9; }
                    50%      { transform: translate(-50%, -50%) scale(1.25); opacity: 1; }
                }
                @keyframes circle-fleck {
                    0%, 100% { opacity: 0.15; transform: translateY(0); }
                    50%      { opacity: 0.85; transform: translateY(-6px); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .circle-scene *, .circle-scene div { animation: none !important; }
                }
            `}</style>
        </div>
    );
};
