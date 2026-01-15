import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Clock, Flower, Circle, Wind } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { toast } from 'sonner';

const exercises = [
  {
    id: 'flower',
    name: 'Flower Observation',
    description: 'Focus on the petals unfolding. Let your thoughts settle like dewdrops.',
    icon: Flower,
    bgClass: 'focus-flower-bg',
    duration: 300, // 5 minutes default
    instructions: 'Sit comfortably, breathe deeply, and focus on the flower blooming.'
  },
  {
    id: 'expanding-circle',
    name: 'Expanding Circle',
    description: 'Watch the circle grow with your breath. Inhale as it expands, exhale as it contracts.',
    icon: Circle,
    bgClass: 'focus-zen-bg',
    duration: 180, // 3 minutes
    instructions: 'Follow the rhythm: Inhale... Exhale...'
  },
  {
    id: 'breath-counter',
    name: 'Breath Counter',
    description: 'Count your breaths mindfully. Each breath brings clarity.',
    icon: Wind,
    bgClass: 'focus-meditation-bg',
    duration: 240, // 4 minutes
    instructions: 'Breathe in for 4 seconds, hold for 4, exhale for 4.'
  }
];

const FocusPage = () => {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [duration, setDuration] = useState(300);
  const [isMuted, setIsMuted] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [circleScale, setCircleScale] = useState(1);
  const timerRef = useRef(null);
  const breathTimerRef = useRef(null);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, []);

  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
    setTimeRemaining(exercise.duration);
    setDuration(exercise.duration);
    setBreathCount(0);
  };

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      // Pause
      if (timerRef.current) clearInterval(timerRef.current);
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      setIsPlaying(false);
    } else {
      // Play
      setIsPlaying(true);
      
      // Main timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            clearInterval(breathTimerRef.current);
            setIsPlaying(false);
            toast.success('Session complete!', { description: 'Great job staying focused.' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Breath animation timer (4 seconds per phase)
      if (selectedExercise?.id === 'expanding-circle' || selectedExercise?.id === 'breath-counter') {
        let phase = 'inhale';
        breathTimerRef.current = setInterval(() => {
          if (phase === 'inhale') {
            phase = 'exhale';
            setBreathPhase('exhale');
            setCircleScale(1);
            if (selectedExercise?.id === 'breath-counter') {
              setBreathCount(prev => prev + 1);
            }
          } else {
            phase = 'inhale';
            setBreathPhase('inhale');
            setCircleScale(1.5);
          }
        }, 4000);
        // Initial state
        setCircleScale(1.5);
        setBreathPhase('inhale');
      }
    }
  }, [isPlaying, selectedExercise]);

  const resetExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    setIsPlaying(false);
    setTimeRemaining(selectedExercise?.duration || duration);
    setBreathCount(0);
    setBreathPhase('inhale');
    setCircleScale(1);
  };

  const exitExercise = () => {
    resetExercise();
    setSelectedExercise(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Full screen exercise view
  if (selectedExercise) {
    return (
      <div 
        className={`fixed inset-0 z-50 ${selectedExercise.bgClass} bg-cover bg-center`}
        data-testid={`focus-exercise-${selectedExercise.id}`}
      >
        {/* Overlay */}
        <div className="absolute inset-0 focus-overlay" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-6">
          {/* Back button */}
          <button
            onClick={exitExercise}
            className="absolute top-6 left-6 glass-dark px-4 py-2 rounded-full text-sm hover:bg-white/20 transition-colors"
            data-testid="exit-exercise-button"
          >
            ← Back
          </button>

          {/* Timer */}
          <div className="absolute top-6 right-6 glass-dark px-6 py-3 rounded-full">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-2xl font-mono font-bold" data-testid="focus-timer">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          {/* Main exercise area */}
          <div className="text-center max-w-2xl">
            {selectedExercise.id === 'flower' && (
              <div className="space-y-8">
                <div 
                  className={`w-64 h-64 md:w-80 md:h-80 mx-auto rounded-full overflow-hidden shadow-2xl ${isPlaying ? 'animate-pulse-soft' : ''}`}
                >
                  <img
                    src="https://images.unsplash.com/photo-1746091926647-4dea870bb1eb?crop=entropy&cs=srgb&fm=jpg&w=600&q=85"
                    alt="Blooming flower"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xl md:text-2xl font-light opacity-90">
                  {selectedExercise.instructions}
                </p>
              </div>
            )}

            {selectedExercise.id === 'expanding-circle' && (
              <div className="space-y-8">
                <div className="expanding-circle-container h-80">
                  <div 
                    className="expanding-circle transition-all duration-[4000ms] ease-in-out"
                    style={{ 
                      transform: `scale(${circleScale})`,
                      opacity: isPlaying ? 1 : 0.5
                    }}
                  />
                </div>
                <p className="text-3xl font-light animate-pulse">
                  {breathPhase === 'inhale' ? 'Inhale...' : 'Exhale...'}
                </p>
              </div>
            )}

            {selectedExercise.id === 'breath-counter' && (
              <div className="space-y-8">
                <div className="flex flex-col items-center gap-6">
                  <div 
                    className={`w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${
                      breathPhase === 'inhale' ? 'bg-primary/60 scale-125' : 'bg-primary/30 scale-100'
                    }`}
                  >
                    <span className="text-6xl md:text-8xl font-bold" data-testid="breath-count">
                      {breathCount}
                    </span>
                  </div>
                  <p className="text-2xl font-light">Breaths completed</p>
                </div>
                <p className="text-xl opacity-80">
                  {breathPhase === 'inhale' ? 'Breathe in... 4 seconds' : 'Breathe out... 4 seconds'}
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-4">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="w-12 h-12 rounded-full glass-dark border-0"
              data-testid="mute-button"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            
            <Button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 border-0"
              data-testid="play-pause-button"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" fill="currentColor" />
              ) : (
                <Play className="w-8 h-8" fill="currentColor" />
              )}
            </Button>

            <Button
              variant="secondary"
              size="icon"
              onClick={resetExercise}
              className="w-12 h-12 rounded-full glass-dark border-0"
              data-testid="reset-button"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          {/* Duration slider */}
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-64 glass-dark px-6 py-4 rounded-2xl">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Duration</span>
              <span>{formatTime(duration)}</span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={([value]) => {
                setDuration(value);
                if (!isPlaying) setTimeRemaining(value);
              }}
              min={60}
              max={600}
              step={60}
              disabled={isPlaying}
              className="w-full"
              data-testid="duration-slider"
            />
          </div>
        </div>
      </div>
    );
  }

  // Exercise selection view
  return (
    <div className="min-h-screen pb-32 md:pb-8 px-6 py-8" data-testid="focus-page">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Focus Practices
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Interactive concentration exercises to build mindfulness and support your habit journey.
          </p>
        </div>

        {/* Exercises Grid */}
        <div className="grid md:grid-cols-3 gap-6 stagger-children">
          {exercises.map((exercise) => {
            const Icon = exercise.icon;
            return (
              <Card
                key={exercise.id}
                className="group cursor-pointer overflow-hidden rounded-3xl shadow-float hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
                onClick={() => startExercise(exercise)}
                data-testid={`exercise-card-${exercise.id}`}
              >
                <div className={`relative h-64 ${exercise.bgClass} bg-cover bg-center`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm opacity-80">{formatTime(exercise.duration)}</span>
                    </div>
                    <h3 className="font-heading text-xl font-semibold mb-2">{exercise.name}</h3>
                    <p className="text-sm opacity-80 line-clamp-2">{exercise.description}</p>
                  </div>
                </div>
                <div className="p-5 bg-card">
                  <Button className="w-full rounded-full group-hover:bg-primary/90">
                    <Play className="w-4 h-4 mr-2" fill="currentColor" />
                    Start Session
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <Card className="p-8 rounded-2xl shadow-soft border-border/50">
            <h3 className="font-heading text-xl font-semibold mb-4">Why Focus Practices?</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Builds attention span:</strong> Training your focus muscle helps you stay on task with your habits.
              </p>
              <p>
                <strong className="text-foreground">Reduces stress:</strong> Mindful breathing activates your parasympathetic nervous system.
              </p>
              <p>
                <strong className="text-foreground">Enhances habit success:</strong> A calm mind makes better decisions about following through.
              </p>
            </div>
          </Card>

          <Card className="p-8 rounded-2xl shadow-soft border-border/50">
            <h3 className="font-heading text-xl font-semibold mb-4">Tips for Best Results</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                Find a quiet space with minimal distractions
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                Start with shorter sessions (1-3 minutes) and build up
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                Practice at the same time daily for consistency
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                If your mind wanders, gently return to the exercise
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FocusPage;
