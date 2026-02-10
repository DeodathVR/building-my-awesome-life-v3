import React, { useEffect, useState } from 'react';

export const CandleFlame = ({ isPlaying }) => {
    const [flicker, setFlicker] = useState(0);
    const [sway, setSway] = useState(0);
    
    useEffect(() => {
        if (!isPlaying) return;
        
        const animate = () => {
            // Random flicker for realistic flame movement
            setFlicker(Math.sin(Date.now() * 0.005) * 0.1 + Math.random() * 0.05);
            setSway(Math.sin(Date.now() * 0.003) * 5);
            requestAnimationFrame(animate);
        };
        
        const animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isPlaying]);
    
    return (
        <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-background via-accent/5 to-background">
            {/* Ambient glow */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div 
                    className="w-[600px] h-[600px] rounded-full blur-3xl transition-opacity duration-300"
                    style={{
                        background: 'radial-gradient(circle, hsl(35 85% 60% / 0.15), transparent 70%)',
                        opacity: 0.7 + flicker
                    }}
                />
            </div>
            
            {/* Candle */}
            <div className="relative flex flex-col items-center">
                {/* Flame */}
                <div 
                    className="relative mb-4 transition-transform duration-100"
                    style={{
                        transform: `translateX(${sway}px) scale(${1 + flicker})`
                    }}
                >
                    {/* Outer flame */}
                    <div 
                        className="w-16 h-32 rounded-t-full rounded-b-full relative"
                        style={{
                            background: 'linear-gradient(to top, hsl(35 85% 55%), hsl(45 95% 70%), hsl(50 100% 85%))',
                            filter: 'blur(4px)',
                            opacity: 0.8
                        }}
                    />
                    
                    {/* Inner flame */}
                    <div 
                        className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-20 rounded-t-full rounded-b-full"
                        style={{
                            background: 'linear-gradient(to top, hsl(45 90% 65%), hsl(50 95% 80%), hsl(55 100% 95%))',
                            filter: 'blur(2px)'
                        }}
                    />
                    
                    {/* Core */}
                    <div 
                        className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-12 rounded-t-full rounded-b-full"
                        style={{
                            background: 'linear-gradient(to top, hsl(50 100% 75%), hsl(55 100% 90%))',
                            boxShadow: '0 0 20px hsl(50 100% 75% / 0.8)'
                        }}
                    />
                </div>
                
                {/* Wick */}
                <div className="w-1 h-6 bg-gradient-to-b from-foreground/80 to-foreground/40 rounded-full" />
                
                {/* Candle body */}
                <div className="w-20 h-48 bg-gradient-to-b from-card to-muted rounded-t-sm rounded-b-lg border border-border shadow-lg">
                    {/* Wax drip effect */}
                    <div className="w-16 h-2 bg-muted/50 rounded-full mx-auto mt-2" />
                </div>
                
                {/* Base shadow */}
                <div className="w-24 h-3 bg-foreground/5 rounded-full blur-sm mt-2" />
            </div>
            
            {/* Floating light particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1.5 h-1.5 bg-accent/40 rounded-full animate-float"
                        style={{
                            left: `${40 + i * 2}%`,
                            top: `${20 + (i % 5) * 15}%`,
                            animationDelay: `${i * 0.4}s`,
                            animationDuration: `${3 + i * 0.3}s`,
                            opacity: 0.3 + Math.random() * 0.4
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
