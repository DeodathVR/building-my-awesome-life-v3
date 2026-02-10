import React, { useEffect, useState } from 'react';

export const FlowerAnimation = ({ isPlaying, duration }) => {
    const [scale, setScale] = useState(0.3);
    const [rotation, setRotation] = useState(0);
    
    useEffect(() => {
        if (!isPlaying) {
            setScale(0.3);
            setRotation(0);
            return;
        }
        
        const totalFrames = duration * 60 * 60; // 60 fps
        let frame = 0;
        
        const animate = () => {
            if (frame < totalFrames) {
                const progress = frame / totalFrames;
                setScale(0.3 + progress * 0.7); // Scale from 0.3 to 1
                setRotation(progress * 360); // Full rotation
                frame++;
                requestAnimationFrame(animate);
            }
        };
        
        const animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isPlaying, duration]);
    
    return (
        <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5">
            {/* Ambient Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-breathe" />
            </div>
            
            {/* Flower SVG */}
            <div 
                className="relative transition-all duration-100 ease-linear"
                style={{ 
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                }}
            >
                <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-2xl">
                    {/* Petals */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                        <g key={angle} transform={`rotate(${angle} 150 150)`}>
                            <ellipse
                                cx="150"
                                cy="80"
                                rx="35"
                                ry="70"
                                fill="hsl(192 35% 75%)"
                                opacity={0.7 + (i * 0.04)}
                                className="transition-all duration-1000"
                            />
                        </g>
                    ))}
                    
                    {/* Inner Petals */}
                    {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, i) => (
                        <g key={angle} transform={`rotate(${angle} 150 150)`}>
                            <ellipse
                                cx="150"
                                cy="95"
                                rx="25"
                                ry="55"
                                fill="hsl(162 25% 80%)"
                                opacity={0.6 + (i * 0.05)}
                                className="transition-all duration-1000"
                            />
                        </g>
                    ))}
                    
                    {/* Center */}
                    <circle
                        cx="150"
                        cy="150"
                        r="30"
                        fill="hsl(180 25% 65%)"
                        className="animate-breathe"
                    />
                    <circle
                        cx="150"
                        cy="150"
                        r="20"
                        fill="hsl(162 30% 55%)"
                        opacity="0.8"
                    />
                </svg>
            </div>
            
            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-primary/30 rounded-full animate-float"
                        style={{
                            left: `${20 + i * 15}%`,
                            top: `${30 + (i % 3) * 20}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${4 + i}s`
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
