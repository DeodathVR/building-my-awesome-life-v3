import React, { useEffect, useState } from 'react';

// Color palette definitions
const colorPalettes = {
    sunrise: {
        name: 'Sunrise',
        preview: 'bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500',
        outerPetals: [
            'hsl(45 85% 70%)',   // Soft yellow
            'hsl(35 80% 65%)',   // Golden orange
            'hsl(25 75% 60%)',   // Warm orange
            'hsl(40 90% 72%)',   // Bright yellow
            'hsl(30 85% 68%)',   // Peachy orange
            'hsl(50 80% 68%)',   // Light gold
            'hsl(20 70% 62%)',   // Deep orange
            'hsl(42 88% 70%)',   // Sunny yellow
        ],
        innerPetals: [
            'hsl(38 90% 75%)',   // Pale gold
            'hsl(45 85% 78%)',   // Cream yellow
            'hsl(32 80% 72%)',   // Soft peach
            'hsl(48 88% 76%)',   // Light yellow
            'hsl(28 75% 70%)',   // Warm coral
            'hsl(52 82% 74%)',   // Butter yellow
            'hsl(35 78% 73%)',   // Apricot
            'hsl(42 86% 77%)',   // Pale gold
        ],
        highlight: 'hsl(50 95% 85%)',
        innerHighlight: 'hsl(55 90% 88%)',
        center: ['hsl(45 90% 65%)', 'hsl(40 85% 55%)', 'hsl(30 80% 45%)'],
        centerMid: 'hsl(35 80% 50%)',
        centerInner: 'hsl(30 85% 45%)',
        glow: 'radial-gradient(circle, hsl(45 70% 80% / 0.3), hsl(35 60% 70% / 0.1), transparent)',
        particles: ['hsl(45 80% 70% / 0.4)', 'hsl(35 75% 65% / 0.4)'],
        background: 'from-background via-amber-50/30 to-orange-50/20'
    },
    ocean: {
        name: 'Ocean',
        preview: 'bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400',
        outerPetals: [
            'hsl(180 45% 65%)',   // Soft teal
            'hsl(170 50% 60%)',   // Sea green
            'hsl(190 40% 68%)',   // Light cyan
            'hsl(175 55% 62%)',   // Aqua
            'hsl(185 45% 66%)',   // Sky teal
            'hsl(165 50% 58%)',   // Mint
            'hsl(195 42% 64%)',   // Pale blue
            'hsl(172 52% 60%)',   // Seafoam
        ],
        innerPetals: [
            'hsl(178 50% 72%)',   // Light teal
            'hsl(168 55% 75%)',   // Pale mint
            'hsl(188 45% 74%)',   // Soft cyan
            'hsl(173 58% 73%)',   // Aqua light
            'hsl(183 48% 76%)',   // Ice blue
            'hsl(163 52% 71%)',   // Seafoam light
            'hsl(193 44% 73%)',   // Powder blue
            'hsl(170 56% 74%)',   // Mint cream
        ],
        highlight: 'hsl(175 60% 88%)',
        innerHighlight: 'hsl(180 55% 90%)',
        center: ['hsl(175 50% 55%)', 'hsl(170 55% 45%)', 'hsl(165 60% 38%)'],
        centerMid: 'hsl(168 55% 42%)',
        centerInner: 'hsl(165 60% 35%)',
        glow: 'radial-gradient(circle, hsl(175 50% 75% / 0.3), hsl(170 45% 65% / 0.1), transparent)',
        particles: ['hsl(175 55% 65% / 0.4)', 'hsl(165 50% 60% / 0.4)'],
        background: 'from-background via-teal-50/30 to-cyan-50/20'
    },
    blossom: {
        name: 'Blossom',
        preview: 'bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400',
        outerPetals: [
            'hsl(340 70% 75%)',   // Soft pink
            'hsl(350 65% 70%)',   // Rose
            'hsl(330 60% 72%)',   // Light magenta
            'hsl(345 72% 73%)',   // Blush
            'hsl(355 68% 68%)',   // Coral pink
            'hsl(325 62% 74%)',   // Orchid
            'hsl(338 70% 71%)',   // Pink rose
            'hsl(348 66% 72%)',   // Salmon pink
        ],
        innerPetals: [
            'hsl(342 72% 80%)',   // Pale pink
            'hsl(352 68% 82%)',   // Light rose
            'hsl(332 64% 81%)',   // Soft orchid
            'hsl(347 74% 79%)',   // Baby pink
            'hsl(357 70% 78%)',   // Peach pink
            'hsl(327 66% 82%)',   // Lavender pink
            'hsl(340 72% 80%)',   // Cotton candy
            'hsl(350 68% 81%)',   // Shell pink
        ],
        highlight: 'hsl(345 75% 90%)',
        innerHighlight: 'hsl(350 70% 92%)',
        center: ['hsl(340 60% 60%)', 'hsl(335 65% 50%)', 'hsl(330 70% 42%)'],
        centerMid: 'hsl(335 65% 48%)',
        centerInner: 'hsl(330 70% 40%)',
        glow: 'radial-gradient(circle, hsl(345 60% 80% / 0.3), hsl(340 55% 70% / 0.1), transparent)',
        particles: ['hsl(345 65% 75% / 0.4)', 'hsl(335 60% 70% / 0.4)'],
        background: 'from-background via-pink-50/30 to-rose-50/20'
    },
    lavender: {
        name: 'Lavender',
        preview: 'bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400',
        outerPetals: [
            'hsl(270 50% 72%)',   // Soft lavender
            'hsl(280 45% 68%)',   // Light purple
            'hsl(260 48% 70%)',   // Periwinkle
            'hsl(275 52% 69%)',   // Orchid purple
            'hsl(285 46% 67%)',   // Violet
            'hsl(265 50% 71%)',   // Soft indigo
            'hsl(272 48% 70%)',   // Lilac
            'hsl(278 44% 68%)',   // Amethyst
        ],
        innerPetals: [
            'hsl(272 52% 78%)',   // Pale lavender
            'hsl(282 48% 80%)',   // Light orchid
            'hsl(262 50% 79%)',   // Soft periwinkle
            'hsl(277 54% 77%)',   // Thistle
            'hsl(287 48% 76%)',   // Mauve
            'hsl(267 52% 80%)',   // Pale violet
            'hsl(274 50% 78%)',   // Wisteria
            'hsl(280 46% 79%)',   // Heather
        ],
        highlight: 'hsl(275 55% 88%)',
        innerHighlight: 'hsl(280 50% 90%)',
        center: ['hsl(270 45% 58%)', 'hsl(268 50% 48%)', 'hsl(265 55% 40%)'],
        centerMid: 'hsl(268 52% 45%)',
        centerInner: 'hsl(265 58% 38%)',
        glow: 'radial-gradient(circle, hsl(275 45% 78% / 0.3), hsl(270 40% 68% / 0.1), transparent)',
        particles: ['hsl(275 50% 72% / 0.4)', 'hsl(265 45% 68% / 0.4)'],
        background: 'from-background via-violet-50/30 to-purple-50/20'
    }
};

export const FlowerAnimation = ({ isPlaying, duration, palette = 'sunrise' }) => {
    const [scale, setScale] = useState(0.2);
    const [rotation, setRotation] = useState(0);
    
    const colors = colorPalettes[palette] || colorPalettes.sunrise;
    
    useEffect(() => {
        if (!isPlaying) {
            setScale(0.2);
            setRotation(0);
            return;
        }
        
        const totalFrames = duration * 60 * 60; // 60 fps
        let frame = 0;
        
        const animate = () => {
            if (frame < totalFrames) {
                const progress = frame / totalFrames;
                setScale(0.2 + progress * 1.2);
                setRotation(progress * 360);
                frame++;
                requestAnimationFrame(animate);
            }
        };
        
        const animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isPlaying, duration]);
    
    // Pointed petal path
    const createPetalPath = (cx, tipY, baseWidth, height) => {
        const baseY = tipY + height;
        const controlOffset = height * 0.4;
        
        return `
            M ${cx} ${tipY}
            C ${cx - baseWidth * 0.8} ${tipY + controlOffset}, 
              ${cx - baseWidth} ${baseY - controlOffset}, 
              ${cx} ${baseY}
            C ${cx + baseWidth} ${baseY - controlOffset}, 
              ${cx + baseWidth * 0.8} ${tipY + controlOffset}, 
              ${cx} ${tipY}
        `;
    };
    
    return (
        <div className={`relative w-full h-full flex items-center justify-center bg-gradient-to-br ${colors.background}`}>
            {/* Ambient Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div 
                    className="w-[500px] h-[500px] rounded-full blur-3xl animate-breathe"
                    style={{ background: colors.glow }}
                />
            </div>
            
            {/* Flower SVG */}
            <div 
                className="relative transition-all duration-100 ease-linear"
                style={{ 
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                }}
            >
                <svg width="400" height="400" viewBox="0 0 400 400" className="drop-shadow-2xl">
                    {/* Outer Petals */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                        <g key={`outer-${angle}`} transform={`rotate(${angle} 200 200)`}>
                            <path
                                d={createPetalPath(200, 60, 40, 100)}
                                fill={colors.outerPetals[i]}
                                opacity={0.85}
                                className="transition-all duration-1000"
                            />
                            <path
                                d={createPetalPath(200, 70, 20, 60)}
                                fill={colors.highlight}
                                opacity={0.4}
                            />
                        </g>
                    ))}
                    
                    {/* Inner Petals */}
                    {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, i) => (
                        <g key={`inner-${angle}`} transform={`rotate(${angle} 200 200)`}>
                            <path
                                d={createPetalPath(200, 90, 30, 75)}
                                fill={colors.innerPetals[i]}
                                opacity={0.9}
                                className="transition-all duration-1000"
                            />
                            <path
                                d={createPetalPath(200, 100, 15, 45)}
                                fill={colors.innerHighlight}
                                opacity={0.5}
                            />
                        </g>
                    ))}
                    
                    {/* Center */}
                    <circle
                        cx="200"
                        cy="200"
                        r="40"
                        fill={`url(#centerGradient-${palette})`}
                        className="animate-breathe"
                    />
                    <circle
                        cx="200"
                        cy="200"
                        r="28"
                        fill={colors.centerMid}
                        opacity="0.9"
                    />
                    <circle
                        cx="200"
                        cy="200"
                        r="18"
                        fill={colors.centerInner}
                        opacity="0.8"
                    />
                    
                    {/* Gradient definitions */}
                    <defs>
                        <radialGradient id={`centerGradient-${palette}`} cx="40%" cy="40%">
                            <stop offset="0%" stopColor={colors.center[0]} />
                            <stop offset="50%" stopColor={colors.center[1]} />
                            <stop offset="100%" stopColor={colors.center[2]} />
                        </radialGradient>
                    </defs>
                </svg>
            </div>
            
            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full animate-float"
                        style={{
                            left: `${15 + i * 12}%`,
                            top: `${25 + (i % 3) * 20}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${4 + i}s`,
                            background: colors.particles[i % 2]
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

// Export palette options for use in ExercisePlayer
export const flowerPalettes = colorPalettes;
