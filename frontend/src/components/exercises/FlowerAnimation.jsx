import React, { useEffect, useState } from 'react';

export const FlowerAnimation = ({ isPlaying, duration }) => {
    const [scale, setScale] = useState(0.2);
    const [rotation, setRotation] = useState(0);
    
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
                // Scale from 0.2 to 1.4 (larger final size, same pace)
                setScale(0.2 + progress * 1.2);
                setRotation(progress * 360); // Full rotation
                frame++;
                requestAnimationFrame(animate);
            }
        };
        
        const animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isPlaying, duration]);
    
    // Pointed petal path - creates a leaf/petal shape with pointed tip
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
    
    // Color palettes for petals - warm tones with yellow and orange
    const outerPetalColors = [
        'hsl(45 85% 70%)',   // Soft yellow
        'hsl(35 80% 65%)',   // Golden orange
        'hsl(25 75% 60%)',   // Warm orange
        'hsl(40 90% 72%)',   // Bright yellow
        'hsl(30 85% 68%)',   // Peachy orange
        'hsl(50 80% 68%)',   // Light gold
        'hsl(20 70% 62%)',   // Deep orange
        'hsl(42 88% 70%)',   // Sunny yellow
    ];
    
    const innerPetalColors = [
        'hsl(38 90% 75%)',   // Pale gold
        'hsl(45 85% 78%)',   // Cream yellow
        'hsl(32 80% 72%)',   // Soft peach
        'hsl(48 88% 76%)',   // Light yellow
        'hsl(28 75% 70%)',   // Warm coral
        'hsl(52 82% 74%)',   // Butter yellow
        'hsl(35 78% 73%)',   // Apricot
        'hsl(42 86% 77%)',   // Pale gold
    ];
    
    return (
        <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-background via-amber-50/30 to-orange-50/20">
            {/* Ambient Glow - warm tones */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div 
                    className="w-[500px] h-[500px] rounded-full blur-3xl animate-breathe"
                    style={{ background: 'radial-gradient(circle, hsl(45 70% 80% / 0.3), hsl(35 60% 70% / 0.1), transparent)' }}
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
                    {/* Outer Petals - pointed with warm colors */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                        <g key={`outer-${angle}`} transform={`rotate(${angle} 200 200)`}>
                            <path
                                d={createPetalPath(200, 60, 40, 100)}
                                fill={outerPetalColors[i]}
                                opacity={0.85}
                                className="transition-all duration-1000"
                            />
                            {/* Petal highlight */}
                            <path
                                d={createPetalPath(200, 70, 20, 60)}
                                fill="hsl(50 95% 85%)"
                                opacity={0.4}
                            />
                        </g>
                    ))}
                    
                    {/* Inner Petals - pointed with softer warm colors */}
                    {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, i) => (
                        <g key={`inner-${angle}`} transform={`rotate(${angle} 200 200)`}>
                            <path
                                d={createPetalPath(200, 90, 30, 75)}
                                fill={innerPetalColors[i]}
                                opacity={0.9}
                                className="transition-all duration-1000"
                            />
                            {/* Petal highlight */}
                            <path
                                d={createPetalPath(200, 100, 15, 45)}
                                fill="hsl(55 90% 88%)"
                                opacity={0.5}
                            />
                        </g>
                    ))}
                    
                    {/* Center - warm golden tones */}
                    <circle
                        cx="200"
                        cy="200"
                        r="40"
                        fill="url(#centerGradient)"
                        className="animate-breathe"
                    />
                    <circle
                        cx="200"
                        cy="200"
                        r="28"
                        fill="hsl(35 80% 50%)"
                        opacity="0.9"
                    />
                    <circle
                        cx="200"
                        cy="200"
                        r="18"
                        fill="hsl(30 85% 45%)"
                        opacity="0.8"
                    />
                    
                    {/* Gradient definitions */}
                    <defs>
                        <radialGradient id="centerGradient" cx="40%" cy="40%">
                            <stop offset="0%" stopColor="hsl(45 90% 65%)" />
                            <stop offset="50%" stopColor="hsl(40 85% 55%)" />
                            <stop offset="100%" stopColor="hsl(30 80% 45%)" />
                        </radialGradient>
                    </defs>
                </svg>
            </div>
            
            {/* Floating particles - warm colors */}
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
                            background: i % 2 === 0 ? 'hsl(45 80% 70% / 0.4)' : 'hsl(35 75% 65% / 0.4)'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
