import React, { useEffect, useState } from 'react';
import flowerSunrise  from '@/assets/flower-cutout-sunrise.png';
import flowerOcean    from '@/assets/flower-cutout-ocean.png';
import flowerBlossom  from '@/assets/flower-cutout-blossom.png';
import flowerLavender from '@/assets/flower-cutout-lavender.png';

/**
 * Flower Observation — Nano-Banana photorealistic mandala flower that blooms slowly
 * from tiny to full-scale on a matching gradient background. Four color palettes:
 * Sunrise (warm), Ocean (teal), Blossom (rose), Lavender (violet).
 *
 * `flowerPalettes` is consumed by ExercisePlayer's palette dropdown.
 */

export const flowerPalettes = {
    sunrise: {
        name: 'Sunrise',
        // small color swatch shown in the dropdown
        swatch: 'linear-gradient(135deg, #FFB86B 0%, #FF8A5C 100%)',
        image: flowerSunrise,
        background:
            'radial-gradient(ellipse at 50% 45%, #FFF4E2 0%, #FBE8D6 30%, #F4D5C0 62%, #ECBFAC 100%)',
        glow: 'radial-gradient(circle, rgba(255,220,150,0.35) 0%, rgba(255,205,130,0.12) 40%, transparent 75%)',
        particle: '#FFE9B5',
        particleShadow: 'rgba(255,214,138,0.85)',
        drop: 'rgba(230,150,80,0.25)',
    },
    ocean: {
        name: 'Ocean',
        swatch: 'linear-gradient(135deg, #4FE3D6 0%, #2AB6C4 100%)',
        image: flowerOcean,
        background:
            'radial-gradient(ellipse at 50% 45%, #EAF9F7 0%, #CFEEE9 30%, #A9DDDA 62%, #7EC6C4 100%)',
        glow: 'radial-gradient(circle, rgba(130,220,220,0.35) 0%, rgba(90,190,210,0.12) 40%, transparent 75%)',
        particle: '#DFF5F3',
        particleShadow: 'rgba(130,220,220,0.9)',
        drop: 'rgba(50,130,150,0.25)',
    },
    blossom: {
        name: 'Blossom',
        swatch: 'linear-gradient(135deg, #FF7FB1 0%, #F5527F 100%)',
        image: flowerBlossom,
        background:
            'radial-gradient(ellipse at 50% 45%, #FFF1F1 0%, #FCD9DE 30%, #F6B9C6 62%, #E8879F 100%)',
        glow: 'radial-gradient(circle, rgba(255,180,210,0.35) 0%, rgba(255,140,180,0.12) 40%, transparent 75%)',
        particle: '#FFDCE6',
        particleShadow: 'rgba(255,150,190,0.9)',
        drop: 'rgba(200,80,120,0.25)',
    },
    lavender: {
        name: 'Lavender',
        swatch: 'linear-gradient(135deg, #BFA5FF 0%, #8B78F0 100%)',
        image: flowerLavender,
        background:
            'radial-gradient(ellipse at 50% 45%, #F5EEFC 0%, #E4D6F7 30%, #CDB8ED 62%, #A88CD9 100%)',
        glow: 'radial-gradient(circle, rgba(200,180,255,0.35) 0%, rgba(170,140,240,0.12) 40%, transparent 75%)',
        particle: '#EDE0FF',
        particleShadow: 'rgba(180,150,240,0.9)',
        drop: 'rgba(120,90,200,0.25)',
    },
};

export const FlowerAnimation = ({ isPlaying, duration, palette = 'sunrise' }) => {
    const [scale, setScale] = useState(0.15);
    const cfg = flowerPalettes[palette] || flowerPalettes.sunrise;

    useEffect(() => {
        if (!isPlaying) {
            setScale(0.15);
            return;
        }
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
                background: cfg.background,
                transition: 'background 500ms ease',
            }}
        >
            {/* Soft glow behind the flower */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute', left: '50%', top: '50%',
                    width: '80vmin', height: '80vmin', borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: cfg.glow,
                    filter: 'blur(20px)', pointerEvents: 'none',
                    transition: 'background 500ms ease',
                }}
            />

            {/* Flower — grows from small to full-scale */}
            <img
                src={cfg.image}
                alt=""
                aria-hidden="true"
                data-testid="flower-image"
                style={{
                    position: 'absolute',
                    left: '50%', top: '50%',
                    width: '90vmin', maxWidth: 1200, height: 'auto',
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    transformOrigin: '50% 50%',
                    filter: `drop-shadow(0 20px 40px ${cfg.drop})`,
                    transition: 'transform 100ms linear',
                    pointerEvents: 'none',
                }}
            />

            {/* Floating particles */}
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {Array.from({ length: 16 }).map((_, i) => (
                    <span
                        key={i}
                        style={{
                            position: 'absolute',
                            left: `${(i * 37) % 100}%`,
                            top: `${(i * 53) % 100}%`,
                            width: 4, height: 4, borderRadius: '50%',
                            background: `radial-gradient(circle, ${cfg.particle} 0%, ${cfg.particleShadow} 60%, transparent 100%)`,
                            boxShadow: `0 0 8px ${cfg.particleShadow}`,
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
                    0%, 100% { opacity: 0.25; transform: translateY(0) scale(0.85); }
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
