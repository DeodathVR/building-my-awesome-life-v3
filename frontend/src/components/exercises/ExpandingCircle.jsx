import React, { useEffect, useState } from 'react';

export const ExpandingCircle = ({ isPlaying }) => {
    const [scale, setScale] = useState(0.3);
    const [expanding, setExpanding] = useState(true);
    
    useEffect(() => {
        if (!isPlaying) {
            setScale(0.3);
            setExpanding(true);
            return;
        }
        
        const breathCycle = 8000; // 8 seconds per breath cycle (4s in, 4s out)
        let startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const cycleProgress = (elapsed % breathCycle) / breathCycle;
            
            // Create smooth breathing pattern
            if (cycleProgress < 0.5) {
                // Inhale (expand)
                const progress = cycleProgress * 2;
                setScale(0.3 + progress * 0.7);
                setExpanding(true);
            } else {
                // Exhale (contract)
                const progress = (cycleProgress - 0.5) * 2;
                setScale(1 - progress * 0.7);
                setExpanding(false);
            }
            
            requestAnimationFrame(animate);
        };
        
        const animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isPlaying]);
    
    return (
        <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-background via-secondary/5 to-accent/5">
            {/* Instruction Text */}
            <div className="absolute top-20 text-center">
                <p className="text-lg text-muted-foreground font-light">
                    {expanding ? 'Breathe In' : 'Breathe Out'}
                </p>
            </div>
            
            {/* Outer Ring (visual guide) */}
            <div className="absolute w-[500px] h-[500px] border-2 border-primary/20 rounded-full" />
            
            {/* Breathing Circle */}
            <div
                className="absolute rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 backdrop-blur-sm transition-all duration-100 ease-linear shadow-2xl"
                style={{
                    width: `${scale * 400}px`,
                    height: `${scale * 400}px`,
                    boxShadow: `0 0 ${scale * 80}px hsl(var(--primary) / 0.3)`
                }}
            >
                {/* Inner glow */}
                <div className="absolute inset-4 rounded-full bg-primary-light/50 blur-xl" />
            </div>
            
            {/* Center Dot (focus point) */}
            <div className="absolute w-4 h-4 bg-foreground rounded-full" />
            
            {/* Ambient particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-3 h-3 bg-primary/20 rounded-full animate-float"
                        style={{
                            left: `${15 + i * 10}%`,
                            top: `${20 + (i % 4) * 20}%`,
                            animationDelay: `${i * 0.3}s`,
                            animationDuration: `${5 + i * 0.5}s`
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
