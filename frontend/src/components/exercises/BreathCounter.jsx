import React, { useEffect, useState, useRef } from 'react';

export const BreathCounter = ({ isPlaying }) => {
    const [breathCount, setBreathCount] = useState(0);
    const [phase, setPhase] = useState('inhale');
    const [scale, setScale] = useState(0.5);
    const [textOpacity, setTextOpacity] = useState(1);
    const [displayText, setDisplayText] = useState('Breathe In');
    const [displayDuration, setDisplayDuration] = useState('4 seconds');
    const lastPhaseRef = useRef('inhale');
    const cycleCountRef = useRef(0);
    const animationRef = useRef(null);
    
    useEffect(() => {
        // Reset everything when not playing
        if (!isPlaying) {
            setBreathCount(0);
            setPhase('inhale');
            setScale(0.5);
            setTextOpacity(1);
            setDisplayText('Breathe In');
            setDisplayDuration('4 seconds');
            lastPhaseRef.current = 'inhale';
            cycleCountRef.current = 0;
            
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
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
        const cycleStart = Date.now();
        
        // Easing function for smoother scale transitions
        const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
        
        const animate = () => {
            const elapsed = Date.now() - cycleStart;
            const cycleTime = elapsed % totalCycle;
            const currentCycleNumber = Math.floor(elapsed / totalCycle);
            
            let newPhase;
            let newScale;
            
            // Determine current phase with smooth easing
            if (cycleTime < phaseDurations.inhale) {
                newPhase = 'inhale';
                const progress = cycleTime / phaseDurations.inhale;
                const easedProgress = easeInOutSine(progress);
                newScale = 0.5 + easedProgress * 0.5;
            } else if (cycleTime < phaseDurations.inhale + phaseDurations['hold-in']) {
                newPhase = 'hold-in';
                newScale = 1;
            } else if (cycleTime < phaseDurations.inhale + phaseDurations['hold-in'] + phaseDurations.exhale) {
                newPhase = 'exhale';
                const progress = (cycleTime - phaseDurations.inhale - phaseDurations['hold-in']) / phaseDurations.exhale;
                const easedProgress = easeInOutSine(progress);
                newScale = 1 - easedProgress * 0.5;
            } else {
                newPhase = 'hold-out';
                newScale = 0.5;
            }
            
            setScale(newScale);
            
            // Handle phase transitions with fade
            if (newPhase !== lastPhaseRef.current) {
                // Fade out
                setTextOpacity(0);
                
                // After fade out, update text and fade in
                setTimeout(() => {
                    setPhase(newPhase);
                    switch(newPhase) {
                        case 'inhale':
                            setDisplayText('Breathe In');
                            setDisplayDuration('4 seconds');
                            break;
                        case 'hold-in':
                            setDisplayText('Hold');
                            setDisplayDuration('2 seconds');
                            break;
                        case 'exhale':
                            setDisplayText('Breathe Out');
                            setDisplayDuration('4 seconds');
                            break;
                        case 'hold-out':
                            setDisplayText('Hold');
                            setDisplayDuration('2 seconds');
                            break;
                        default:
                            break;
                    }
                    // Fade in
                    setTimeout(() => setTextOpacity(1), 50);
                }, 300);
                
                lastPhaseRef.current = newPhase;
            }
            
            // Count completed breath cycles - only increment when entering a new cycle
            if (currentCycleNumber > cycleCountRef.current) {
                cycleCountRef.current = currentCycleNumber;
                setBreathCount(currentCycleNumber);
            }
            
            animationRef.current = requestAnimationFrame(animate);
        };
        
        animationRef.current = requestAnimationFrame(animate);
        
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [isPlaying]);
    
    // Get circle style - static when not playing, animated when playing
    const getCircleStyle = () => {
        const hue1 = 174; // primary (teal)
        const hue2 = 162; // secondary (sage)
        const hue3 = 180; // accent (calm teal)
        
        const normalizedScale = (scale - 0.5) * 2; // 0 to 1
        
        return {
            width: `${scale * 350}px`,
            height: `${scale * 350}px`,
            background: `radial-gradient(circle at 30% 30%, 
                hsl(${hue1} 43% ${55 + normalizedScale * 10}% / 0.8), 
                hsl(${hue2} 20% ${60 + normalizedScale * 5}% / 0.7), 
                hsl(${hue3} 18% ${55 + normalizedScale * 10}% / 0.6))`,
            boxShadow: `0 0 ${scale * 60}px hsl(174 43% 51% / ${0.3 + normalizedScale * 0.2})`,
            transition: isPlaying ? 'background 0.8s ease-in-out, box-shadow 0.5s ease-in-out' : 'none'
        };
    };
    
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
            {/* Breath Count */}
            <div className="absolute top-20 text-center">
                <div className="text-6xl font-serif text-foreground mb-2 transition-all duration-500">
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
                
                {/* Animated breathing circle with smooth transitions */}
                <div
                    className="absolute rounded-full backdrop-blur-sm shadow-2xl"
                    style={getCircleStyle()}
                >
                    {/* Inner glow */}
                    <div className="absolute inset-8 rounded-full bg-primary-light/30 blur-2xl transition-all duration-700" />
                </div>
                
                {/* Phase text with fade transition */}
                <div 
                    className="relative text-center z-10 transition-opacity duration-300 ease-in-out"
                    style={{ opacity: textOpacity }}
                >
                    <div className="text-3xl font-serif font-light text-foreground">
                        {displayText}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                        {displayDuration}
                    </div>
                </div>
            </div>
            
            {/* Progress indicator dots with smooth transitions */}
            <div className="absolute bottom-20 flex gap-3">
                {['inhale', 'hold-in', 'exhale', 'hold-out'].map((p) => (
                    <div
                        key={p}
                        className={`w-3 h-3 rounded-full transition-all duration-500 ease-in-out ${
                            phase === p 
                                ? 'bg-primary scale-125 shadow-lg shadow-primary/30' 
                                : 'bg-muted/50'
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
