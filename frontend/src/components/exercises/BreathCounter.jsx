import React, { useEffect, useState } from 'react';

export const BreathCounter = ({ isPlaying }) => {
    const [breathCount, setBreathCount] = useState(0);
    const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale, hold
    const [phaseProgress, setPhaseProgress] = useState(0);
    const [scale, setScale] = useState(0.5);
    
    useEffect(() => {
        if (!isPlaying) {
            setBreathCount(0);
            setPhase('inhale');
            setPhaseProgress(0);
            setScale(0.5);
            return;
        }
        
        // Breathing pattern: 4s inhale, 2s hold, 4s exhale, 2s hold = 12s cycle
        const phaseDurations = {
            inhale: 4000,
            'hold-in': 2000,
            exhale: 4000,
            'hold-out': 2000
        };
        
        const totalCycle = 12000;
        let cycleStart = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - cycleStart;
            const cycleTime = elapsed % totalCycle;
            
            // Determine current phase
            if (cycleTime < phaseDurations.inhale) {
                setPhase('inhale');
                const progress = cycleTime / phaseDurations.inhale;
                setPhaseProgress(progress);
                setScale(0.5 + progress * 0.5);
            } else if (cycleTime < phaseDurations.inhale + phaseDurations['hold-in']) {
                setPhase('hold-in');
                setPhaseProgress(1);
                setScale(1);
            } else if (cycleTime < phaseDurations.inhale + phaseDurations['hold-in'] + phaseDurations.exhale) {
                setPhase('exhale');
                const progress = (cycleTime - phaseDurations.inhale - phaseDurations['hold-in']) / phaseDurations.exhale;
                setPhaseProgress(progress);
                setScale(1 - progress * 0.5);
            } else {
                setPhase('hold-out');
                setPhaseProgress(1);
                setScale(0.5);
            }
            
            // Count completed breaths
            if (elapsed > 0 && cycleTime < 100) {
                setBreathCount(prev => prev + 1);
            }
            
            requestAnimationFrame(animate);
        };
        
        const animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isPlaying]);
    
    const getPhaseText = () => {
        switch(phase) {
            case 'inhale': return 'Breathe In';
            case 'hold-in': return 'Hold';
            case 'exhale': return 'Breathe Out';
            case 'hold-out': return 'Hold';
            default: return '';
        }
    };
    
    const getPhaseColor = () => {
        switch(phase) {
            case 'inhale': return 'from-primary/70 to-secondary/70';
            case 'hold-in': return 'from-secondary/70 to-accent/70';
            case 'exhale': return 'from-accent/70 to-primary/70';
            case 'hold-out': return 'from-primary/70 to-secondary/70';
            default: return 'from-primary/70 to-secondary/70';
        }
    };
    
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
            {/* Breath Count */}
            <div className="absolute top-20 text-center">
                <div className="text-6xl font-serif text-foreground mb-2">
                    {breathCount}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">
                    Breath Cycles
                </div>
            </div>
            
            {/* Main breathing circle */}
            <div className="relative flex items-center justify-center">
                {/* Outer guide ring */}
                <div className="absolute w-[400px] h-[400px] border-2 border-primary/20 rounded-full" />
                
                {/* Animated breathing circle */}
                <div
                    className={`absolute rounded-full bg-gradient-to-br ${getPhaseColor()} backdrop-blur-sm transition-all duration-100 ease-linear shadow-2xl`}
                    style={{
                        width: `${scale * 350}px`,
                        height: `${scale * 350}px`,
                        boxShadow: `0 0 ${scale * 60}px hsl(var(--primary) / 0.4)`
                    }}
                >
                    {/* Inner glow */}
                    <div className="absolute inset-8 rounded-full bg-primary-light/30 blur-2xl" />
                </div>
                
                {/* Phase text */}
                <div className="relative text-center z-10">
                    <div className="text-3xl font-serif font-light text-foreground">
                        {getPhaseText()}
                    </div>
                    {(phase === 'hold-in' || phase === 'hold-out') && (
                        <div className="text-sm text-muted-foreground mt-2">
                            2 seconds
                        </div>
                    )}
                    {(phase === 'inhale' || phase === 'exhale') && (
                        <div className="text-sm text-muted-foreground mt-2">
                            4 seconds
                        </div>
                    )}
                </div>
            </div>
            
            {/* Progress indicator dots */}
            <div className="absolute bottom-20 flex gap-2">
                {['inhale', 'hold-in', 'exhale', 'hold-out'].map((p, i) => (
                    <div
                        key={p}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            phase === p ? 'bg-primary scale-125' : 'bg-muted'
                        }`}
                    />
                ))}
            </div>
            
            {/* Ambient particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
                        style={{
                            left: `${10 + i * 7}%`,
                            top: `${15 + (i % 4) * 20}%`,
                            animationDelay: `${i * 0.25}s`,
                            animationDuration: `${4 + i * 0.3}s`
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
