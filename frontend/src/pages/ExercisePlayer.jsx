import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';
import { FlowerAnimation } from '@/components/exercises/FlowerAnimation';
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
        defaultDuration: 5
    },
    'expanding-circle': {
        title: 'Expanding Circle',
        defaultDuration: 4
    },
    'candle-flame': {
        title: 'Candle Flame Flicker',
        defaultDuration: 5
    },
    'breath-counter': {
        title: 'Breath Counter',
        defaultDuration: 5
    }
};

export const ExercisePlayer = () => {
    const { exerciseId } = useParams();
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(exerciseDetails[exerciseId]?.defaultDuration || 5);
    const [timeRemaining, setTimeRemaining] = useState(duration * 60);
    const [showControls, setShowControls] = useState(true);
    const timerRef = useRef(null);
    const hideControlsTimer = useRef(null);
    
    const ExerciseComponent = exerciseComponents[exerciseId];
    const details = exerciseDetails[exerciseId];
    
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
    
    return (
        <div 
            className="fixed inset-0 bg-background flex items-center justify-center z-50"
            onMouseMove={handleMouseMove}
            data-testid="exercise-player"
        >
            {/* Back Button */}
            <Button
                variant="ghost"
                size="icon"
                className={`fixed top-6 left-6 z-50 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-300 ${
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
                <h1 className="text-2xl font-serif font-light text-foreground">
                    {details.title}
                </h1>
            </div>
            
            {/* Exercise Animation */}
            <div className="w-full h-full flex items-center justify-center">
                <ExerciseComponent isPlaying={isPlaying} duration={duration} />
            </div>
            
            {/* Controls */}
            <div 
                className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
                    showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}
            >
                <Card className="m-6 p-6 bg-card/80 backdrop-blur-md border-border">
                    <div className="max-w-2xl mx-auto space-y-6">
                        {/* Timer Display */}
                        <div className="text-center">
                            <div className="text-4xl font-serif text-foreground mb-2" data-testid="timer-display">
                                {formatTime(timeRemaining)}
                            </div>
                            <div className="text-sm text-muted-foreground">
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
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
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
