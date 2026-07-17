import React, { useEffect, useState } from 'react';
import flowerCutout from '@/assets/flower-cutout.png';

/**
 * Flower Observation — the Nano-Banana photorealistic mandala flower blooms slowly
 * from tiny to full-scale over the session duration on top of a matching warm
 * cream-peach gradient background. No borders / edges visible at any scale.
 */
export const FlowerAnimation = ({ isPlaying, duration }) => {
    const [scale, setScale] = useState(0.15);

    useEffect(() => {
        if (!isPlaying) {
            setScale(0.15);
            return;
        }
        // Grow from 0.15 → 1.0 over the full duration.
        // Uses a monotonic ease-out so growth feels natural (fast start, slow finish).
        const startTime = Date.now();
        const totalMs = duration * 60 * 1000;
        let frameId;
        const easeOut = (t) => 1 - Math.pow(1 - t, 2);
        const tick = () => {
            const elapsed = Date.now() - startTime;
            const t = Math.min(1, elapsed / totalMs);
            setScale(0.15 + easeOut(t) * 0.85);
            if (t < 1) frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [isPlaying, duration]);

    return (
        <div
            className="flower-scene"
            data-testid="flower-scene"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                // Warm cream-peach gradient that matches the flower image's own background
                // so the growing flower reads as one continuous scene with no visible edges.
                background:
                    'radial-gradient(ellipse at 50% 45%, #FFF4E2 0%, #FBE8D6 30%, #F4D5C0 62%, #ECBFAC 100%)',
            }}
        >
            {/* Soft additional glow behind where the flower will grow */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '80vmin',
                    height: '80vmin',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    background:
                        'radial-gradient(circle, rgba(255,220,150,0.35) 0%, rgba(255,205,130,0.12) 40%, transparent 75%)',
                    filter: 'blur(20px)',
                    pointerEvents: 'none',
                }}
            />

            {/* The Nano-Banana flower — grows from small to full-scale */}
            <img
                src={flowerCutout}
                alt=""
                aria-hidden="true"
                data-testid="flower-image"
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '90vmin',
                    maxWidth: 1200,
                    height: 'auto',
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    transformOrigin: '50% 50%',
                    filter: 'drop-shadow(0 20px 40px rgba(230,150,80,0.25))',
                    transition: 'transform 100ms linear',
                    pointerEvents: 'none',
                }}
            />

            {/* Tiny golden floating particles */}
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {Array.from({ length: 16 }).map((_, i) => (
                    <span
                        key={i}
                        style={{
                            position: 'absolute',
                            left: `${(i * 37) % 100}%`,
                            top: `${(i * 53) % 100}%`,
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, #FFE9B5 0%, rgba(255,201,120,0.6) 60%, transparent 100%)',
                            boxShadow: '0 0 8px rgba(255,214,138,0.8)',
                            animation: isPlaying
                                ? `flower-fleck ${5 + (i % 4)}s ease-in-out ${i * 0.25}s infinite`
                                : 'none',
                            opacity: 0.7,
                        }}
                    />
                ))}
            </div>

            <style>{`
                @keyframes flower-fleck {
                    0%, 100% { opacity: 0.25; transform: translateY(0)  scale(0.85); }
                    50%      { opacity: 0.9;  transform: translateY(-8px) scale(1.1); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .flower-scene [data-testid="flower-image"],
                    .flower-scene span { animation: none !important; }
                }
            `}</style>
        </div>
    );
};

// Keep exports compatible with existing imports in ExercisePlayer.
export const flowerPalettes = {};
