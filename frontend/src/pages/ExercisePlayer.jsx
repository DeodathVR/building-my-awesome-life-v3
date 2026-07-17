import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, ArrowLeft, Palette } from 'lucide-react';
import { FlowerAnimation, flowerPalettes } from '@/components/exercises/FlowerAnimation';
import { ExpandingCircle } from '@/components/exercises/ExpandingCircle';
import { CandleFlame } from '@/components/exercises/CandleFlame';
import { BreathCounter } from '@/components/exercises/BreathCounter';

const exerciseComponents = {
    'flower-observation': FlowerAnimation,
    'expanding-circle': ExpandingCircle,
    'candle-flame': CandleFlame,
    'breath-counter': BreathCounter
};

const exerciseDetails = {
    'flower-observation': {
        title: 'Flower Observation',
        defaultDuration: 5,
        hasPalettes: true,
        theme: 'default'
    },
    'expanding-circle': {
        title: 'Circle Concentration',
        defaultDuration: 4,
        hasPalettes: false,
        theme: 'pastel'
    },
    'candle-flame': {
        title: 'Candle Flame Flicker',
        defaultDuration: 5,
        hasPalettes: false,
        theme: 'dark-navy'
    },
    'breath-counter': {
        title: 'Breath Counter',
        defaultDuration: 5,
        hasPalettes: false,
        theme: 'pastel'
    }
};

// Per-exercise page theming (background + control-card styling) so the entire
// player surface reads as one cinematic scene.
const themeStyles = {
    'default': {
        pageBg: undefined,
        titleColor: undefined,
        controlCard: 'bg-card/80 backdrop-blur-md border-border',
        timerText: 'text-foreground',
        subText: 'text-muted-foreground',
        backBtnBg: 'bg-card/80 hover:bg-card',
    },
    'dark-navy': {
        pageBg: '#060B18',
        titleColor: '#E6ECF6',
        controlCard: 'bg-white/[0.06] backdrop-blur-xl border-white/15 shadow-[0_0_60px_rgba(126,200,184,0.18),inset_0_1px_0_rgba(255,255,255,0.14)] ring-1 ring-white/10',
        timerText: 'text-white',
        subText: 'text-white/60',
        backBtnBg: 'bg-white/10 hover:bg-white/20 text-white',
    },
    'pastel': {
        pageBg: 'linear-gradient(120deg, #FFE9D2 0%, #F7EAD9 22%, #EFE6E6 48%, #E6DDEA 72%, #DED3E4 100%)',
        titleColor: '#26333F',
        controlCard: 'bg-white/45 backdrop-blur-md border-white/60',
        timerText: 'text-slate-800',
        subText: 'text-slate-600',
        backBtnBg: 'bg-white/60 hover:bg-white/80 text-slate-800',
    },
};

export const ExercisePlayer = () => {
    const { exerciseId } = useParams();
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(exerciseDetails[exerciseId]?.defaultDuration || 5);
    const [timeRemaining, setTimeRemaining] = useState(duration * 60);
    const [showControls, setShowControls] = useState(true);
    const [selectedPalette, setSelectedPalette] = useState('sunrise');
    const [showPaletteSelector, setShowPaletteSelector] = useState(false);
    const timerRef = useRef(null);
    const hideControlsTimer = useRef(null);
    
    const ExerciseComponent = exerciseComponents[exerciseId];
    const details = exerciseDetails[exerciseId];
    const theme = themeStyles[details?.theme || 'default'] || themeStyles.default;
    
    useEffect(() => {
        setTimeRemaining(duration * 60);
    }, [duration]);
    
    useEffect(() => {
        if (isPlaying && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, timeRemaining]);
    
    useEffect(() => {
        if (isPlaying) {
            setShowPaletteSelector(false);
            hideControlsTimer.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        } else {
            setShowControls(true);
        }
        
        return () => {
            if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
        };
    }, [isPlaying]);
    
    const handleMouseMove = () => {
        if (isPlaying) {
            setShowControls(true);
            if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
            hideControlsTimer.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    };
    
    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };
    
    const resetTimer = () => {
        setIsPlaying(false);
        setTimeRemaining(duration * 60);
    };
    
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    if (!ExerciseComponent) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-8 text-center">
                    <h2 className="text-2xl font-serif mb-4">Exercise not found</h2>
                    <Button onClick={() => navigate('/focus')}>Back to Exercises</Button>
                </Card>
            </div>
        );
    }
    
    // Props for the exercise component
    const exerciseProps = {
        isPlaying,
        duration,
        ...(details.hasPalettes && { palette: selectedPalette })
    };
    
    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-50"
            style={theme.pageBg ? { background: theme.pageBg } : undefined}
            onMouseMove={handleMouseMove}
            data-testid="exercise-player"
        >
            {/* Back Button */}
            <Button
                variant="ghost"
                size="icon"
                className={`fixed top-6 left-6 z-50 rounded-full ${theme.backBtnBg} backdrop-blur-sm transition-all duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => navigate('/focus')}
                data-testid="back-button"
            >
                <ArrowLeft className="w-5 h-5" />
            </Button>
            
            {/* Title */}
            <div 
                className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <h1
                    className={`text-2xl font-serif font-light ${theme.titleColor ? '' : 'text-foreground'}`}
                    style={theme.titleColor ? { color: theme.titleColor } : undefined}
                >
                    {details.title}
                </h1>
            </div>
            
            {/* Palette Button (for flower observation only) */}
            {details.hasPalettes && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 transition-all duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}>
                    {!isPlaying && (
                        <span className="text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded-full">
                            Color themes available
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-card/80 backdrop-blur-sm hover:bg-card"
                        onClick={() => setShowPaletteSelector(!showPaletteSelector)}
                        data-testid="palette-button"
                    >
                        <Palette className="w-5 h-5" />
                    </Button>
                </div>
            )}
            
            {/* Palette Selector Dropdown */}
            {details.hasPalettes && showPaletteSelector && !isPlaying && (
                <div 
                    className={`fixed top-20 right-6 z-50 transition-all duration-300 ${
                        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <Card className="p-4 bg-card/95 backdrop-blur-md border-border shadow-xl">
                        <p className="text-sm font-medium text-foreground mb-3">Choose Color Theme</p>
                        <div className="flex flex-col gap-2">
                            {Object.entries(flowerPalettes).map(([key, palette]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setSelectedPalette(key);
                                        setShowPaletteSelector(false);
                                    }}
                                    className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-muted ${
                                        selectedPalette === key ? 'bg-muted ring-2 ring-primary' : ''
                                    }`}
                                    data-testid={`palette-${key}`}
                                >
                                    <div className={`w-8 h-8 rounded-full ${palette.preview}`} />
                                    <span className="text-sm text-foreground">{palette.name}</span>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
            
            {/* Exercise Animation */}
            <div className="w-full h-full flex items-center justify-center">
                <ExerciseComponent {...exerciseProps} />
            </div>
            
            {/* Controls */}
            <div 
                className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
                    showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}
            >
                <Card className={`m-6 p-6 ${theme.controlCard}`}>
                    <div className="max-w-2xl mx-auto space-y-6">
                        {/* Timer Display */}
                        <div className="text-center">
                            <div className={`text-4xl font-serif mb-2 ${theme.timerText}`} data-testid="timer-display">
                                {formatTime(timeRemaining)}
                            </div>
                            <div className={`text-sm ${theme.subText}`}>
                                {timeRemaining === 0 ? 'Session Complete' : 'Time Remaining'}
                            </div>
                        </div>
                        
                        {/* Play Controls */}
                        <div className="flex items-center justify-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full h-12 w-12"
                                onClick={resetTimer}
                                data-testid="reset-button"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </Button>
                            <Button
                                size="icon"
                                className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90"
                                onClick={togglePlay}
                                data-testid="play-pause-button"
                            >
                                {isPlaying ? (
                                    <Pause className="w-6 h-6" />
                                ) : (
                                    <Play className="w-6 h-6 ml-1" />
                                )}
                            </Button>
                            <div className="w-12" /> {/* Spacer for symmetry */}
                        </div>
                        
                        {/* Duration Slider */}
                        {!isPlaying && (
                            <div className="space-y-2">
                                <div className={`flex items-center justify-between text-sm ${theme.subText}`}>
                                    <span>Duration</span>
                                    <span>{duration} minutes</span>
                                </div>
                                <Slider
                                    value={[duration]}
                                    onValueChange={(value) => setDuration(value[0])}
                                    min={1}
                                    max={10}
                                    step={1}
                                    className="cursor-pointer"
                                    data-testid="duration-slider"
                                />
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ExercisePlayer;
