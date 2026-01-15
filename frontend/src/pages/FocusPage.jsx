import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Clock, Flower, Circle, Wind, X, Music, Sun } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { toast } from 'sonner';

// Animated Daisy Bloom Component - CSS-based flower animation
const AnimatedDaisyBloom = ({ isPlaying }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Stem */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 bg-gradient-to-t from-green-700 to-green-500 rounded-full origin-bottom"
        style={{
          height: isPlaying ? '35%' : '10%',
          transition: 'height 8s ease-out'
        }}
      />
      
      {/* Leaves */}
      <div 
        className="absolute bottom-[20%] left-1/2 origin-bottom-left"
        style={{
          transform: isPlaying ? 'translateX(-50%) rotate(-45deg) scale(1)' : 'translateX(-50%) rotate(-45deg) scale(0)',
          transition: 'transform 6s ease-out 4s'
        }}
      >
        <div className="w-8 h-16 bg-gradient-to-t from-green-600 to-green-400 rounded-full" />
      </div>
      <div 
        className="absolute bottom-[25%] left-1/2 origin-bottom-right"
        style={{
          transform: isPlaying ? 'translateX(-50%) rotate(45deg) scale(1)' : 'translateX(-50%) rotate(45deg) scale(0)',
          transition: 'transform 6s ease-out 5s'
        }}
      >
        <div className="w-8 h-14 bg-gradient-to-t from-green-600 to-green-400 rounded-full" />
      </div>

      {/* Flower head container */}
      <div 
        className="absolute top-[15%] left-1/2 -translate-x-1/2"
        style={{
          opacity: isPlaying ? 1 : 0,
          transform: isPlaying ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.3)',
          transition: 'all 10s ease-out 6s'
        }}
      >
        {/* Outer petals layer */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`outer-${i}`}
            className="absolute left-1/2 top-1/2 origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
            }}
          >
            <div
              className="w-6 h-20 rounded-full bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-300"
              style={{
                transform: isPlaying ? 'scaleY(1) scaleX(1)' : 'scaleY(0) scaleX(0.5)',
                transformOrigin: 'bottom center',
                transition: `transform ${12 + i * 0.5}s ease-out ${8 + i * 0.3}s`,
                boxShadow: 'inset 0 -10px 20px rgba(234, 88, 12, 0.3)'
              }}
            />
          </div>
        ))}
        
        {/* Inner petals layer */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`inner-${i}`}
            className="absolute left-1/2 top-1/2 origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${i * 30 + 15}deg)`,
            }}
          >
            <div
              className="w-5 h-14 rounded-full bg-gradient-to-t from-orange-400 via-yellow-300 to-yellow-200"
              style={{
                transform: isPlaying ? 'scaleY(1) scaleX(1)' : 'scaleY(0) scaleX(0.5)',
                transformOrigin: 'bottom center',
                transition: `transform ${14 + i * 0.4}s ease-out ${12 + i * 0.25}s`,
                boxShadow: 'inset 0 -8px 15px rgba(251, 146, 60, 0.4)'
              }}
            />
          </div>
        ))}

        {/* Center disc */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-green-600 via-green-700 to-green-800"
          style={{
            width: isPlaying ? '48px' : '16px',
            height: isPlaying ? '48px' : '16px',
            transition: 'all 8s ease-out 6s',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3), 0 0 20px rgba(34, 197, 94, 0.3)'
          }}
        >
          {/* Center texture dots */}
          {isPlaying && [...Array(7)].map((_, i) => (
            <div
              key={`dot-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full bg-green-900/60"
              style={{
                top: `${30 + Math.sin(i * 0.9) * 20}%`,
                left: `${30 + Math.cos(i * 0.9) * 20}%`,
                opacity: isPlaying ? 1 : 0,
                transition: `opacity 2s ease-out ${18 + i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Gentle floating particles */}
      {isPlaying && [...Array(6)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full bg-yellow-300/40"
          style={{
            left: `${20 + i * 12}%`,
            animation: `float ${4 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
            top: `${30 + Math.sin(i) * 20}%`
          }}
        />
      ))}
    </div>
  );
};

// Breathing pattern: Inhale 4s, Hold 2-4s, Exhale 6s (total ~12-14s cycle)
const BREATH_INHALE = 4000;
const BREATH_HOLD = 3000;
const BREATH_EXHALE = 6000;
const BREATH_CYCLE = BREATH_INHALE + BREATH_HOLD + BREATH_EXHALE;

const exercises = [
  {
    id: 'lotus',
    name: 'Lotus Observation',
    description: 'Watch the sacred lotus bloom in a serene pond. Let its gentle unfolding calm your mind.',
    icon: Flower,
    duration: 300, // 5 minutes default
    instructions: 'Sit comfortably, breathe deeply, and focus on the lotus blooming.',
    // Royalty-free nature video from Pixabay
    videoUrl: 'https://cdn.pixabay.com/video/2020/05/25/40130-424930959_large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?w=1200&q=80'
  },
  {
    id: 'expanding-circle',
    name: 'Expanding Circle',
    description: 'Follow the circle\'s rhythm: expand on inhale, hold, contract on exhale.',
    icon: Circle,
    bgClass: 'focus-zen-bg',
    duration: 180, // 3 minutes
    instructions: 'Breathe with the circle: Inhale (4s) → Hold (3s) → Exhale (6s)'
  },
  {
    id: 'breath-counter',
    name: 'Breath Counter',
    description: 'Count your breaths mindfully with guided timing. Each breath brings clarity.',
    icon: Wind,
    bgClass: 'focus-meditation-bg',
    duration: 240, // 4 minutes
    instructions: 'Follow the rhythm: Inhale 4s → Hold 3s → Exhale 6s'
  },
  {
    id: 'daisy-bloom',
    name: 'Yellow Daisy Bloom',
    description: 'Watch a vibrant yellow-orange daisy bloom slowly, petal by petal. An uplifting alternative for focus training.',
    icon: Sun,
    duration: 300, // 5 minutes
    instructions: 'Sit comfortably, breathe deeply, and observe the gentle unfolding. If your mind wanders, gently return your attention.',
    isAnimated: true,
    thumbnailGradient: 'from-yellow-400 via-orange-400 to-orange-500'
  }
];

// Ambient music from Pixabay (royalty-free)
const AMBIENT_MUSIC_URL = 'https://cdn.pixabay.com/audio/2024/11/04/audio_4956b4edd1.mp3';

const FocusPage = () => {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [duration, setDuration] = useState(300);
  const [isMuted, setIsMuted] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [breathPhase, setBreathPhase] = useState('ready'); // ready, inhale, hold, exhale
  const [breathCount, setBreathCount] = useState(0);
  const [circleScale, setCircleScale] = useState(1);
  const [phaseProgress, setPhaseProgress] = useState(0);
  
  const timerRef = useRef(null);
  const breathTimerRef = useRef(null);
  const phaseTimerRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(AMBIENT_MUSIC_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle music toggle
  useEffect(() => {
    if (audioRef.current) {
      if (musicEnabled && isPlaying) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicEnabled, isPlaying]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    };
  }, []);

  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
    setTimeRemaining(exercise.duration);
    setDuration(exercise.duration);
    setBreathCount(0);
    setBreathPhase('ready');
    setCircleScale(1);
    setPhaseProgress(0);
  };

  // Breathing cycle with proper timing
  const runBreathCycle = useCallback(() => {
    // Inhale phase (4 seconds)
    setBreathPhase('inhale');
    setCircleScale(1.8);
    setPhaseProgress(0);
    
    let progress = 0;
    if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    phaseTimerRef.current = setInterval(() => {
      progress += 100;
      setPhaseProgress(Math.min(progress / BREATH_INHALE * 100, 100));
    }, 100);

    breathTimerRef.current = setTimeout(() => {
      // Hold phase (3 seconds)
      setBreathPhase('hold');
      setPhaseProgress(0);
      progress = 0;
      
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
      phaseTimerRef.current = setInterval(() => {
        progress += 100;
        setPhaseProgress(Math.min(progress / BREATH_HOLD * 100, 100));
      }, 100);

      breathTimerRef.current = setTimeout(() => {
        // Exhale phase (6 seconds)
        setBreathPhase('exhale');
        setCircleScale(1);
        setPhaseProgress(0);
        progress = 0;
        
        if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
        phaseTimerRef.current = setInterval(() => {
          progress += 100;
          setPhaseProgress(Math.min(progress / BREATH_EXHALE * 100, 100));
        }, 100);

        breathTimerRef.current = setTimeout(() => {
          // Increment breath count and restart cycle
          setBreathCount(prev => prev + 1);
          runBreathCycle();
        }, BREATH_EXHALE);
      }, BREATH_HOLD);
    }, BREATH_INHALE);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      // Pause
      if (timerRef.current) clearInterval(timerRef.current);
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
      setIsPlaying(false);
      setBreathPhase('ready');
    } else {
      // Play
      setIsPlaying(true);
      
      // Main timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            clearTimeout(breathTimerRef.current);
            clearInterval(phaseTimerRef.current);
            setIsPlaying(false);
            setBreathPhase('ready');
            if (audioRef.current) audioRef.current.pause();
            toast.success('Session complete!', { description: 'Great job staying focused.' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start breath animation for circle and breath counter
      if (selectedExercise?.id === 'expanding-circle' || selectedExercise?.id === 'breath-counter') {
        runBreathCycle();
      }
    }
  }, [isPlaying, selectedExercise, runBreathCycle]);

  const resetExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    setIsPlaying(false);
    setTimeRemaining(selectedExercise?.duration || duration);
    setBreathCount(0);
    setBreathPhase('ready');
    setCircleScale(1);
    setPhaseProgress(0);
    if (audioRef.current) audioRef.current.pause();
  };

  const exitExercise = () => {
    resetExercise();
    setSelectedExercise(null);
    setMusicEnabled(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathText = () => {
    switch (breathPhase) {
      case 'inhale': return 'Inhale...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Exhale...';
      default: return 'Press play to begin';
    }
  };

  const getBreathDuration = () => {
    switch (breathPhase) {
      case 'inhale': return '4 seconds';
      case 'hold': return '3 seconds';
      case 'exhale': return '6 seconds';
      default: return '';
    }
  };

  // Full screen exercise view
  if (selectedExercise) {
    return (
      <div 
        className={`fixed inset-0 z-50 ${selectedExercise.bgClass || 'bg-slate-900'} bg-cover bg-center`}
        data-testid={`focus-exercise-${selectedExercise.id}`}
      >
        {/* Video background for Lotus */}
        {selectedExercise.id === 'lotus' && (
          <div className="absolute inset-0">
            <video
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
              poster={selectedExercise.posterUrl}
            >
              <source src={selectedExercise.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Animated Daisy Bloom background */}
        {selectedExercise.id === 'daisy-bloom' && (
          <div className="absolute inset-0">
            <AnimatedDaisyBloom isPlaying={isPlaying} />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-6">
          {/* Back button */}
          <button
            onClick={exitExercise}
            className="absolute top-6 left-6 glass-dark px-4 py-2 rounded-full text-sm hover:bg-white/20 transition-colors flex items-center gap-2"
            data-testid="exit-exercise-button"
          >
            <X className="w-4 h-4" />
            Exit
          </button>

          {/* Timer & Music controls */}
          <div className="absolute top-6 right-6 flex items-center gap-3">
            {/* Music Toggle */}
            <button
              onClick={() => setMusicEnabled(!musicEnabled)}
              className={`glass-dark px-4 py-3 rounded-full flex items-center gap-2 transition-colors ${musicEnabled ? 'bg-primary/30' : ''}`}
              data-testid="music-toggle"
            >
              <Music className="w-5 h-5" />
              <span className="text-sm">{musicEnabled ? 'Music On' : 'Music Off'}</span>
            </button>
            
            {/* Timer */}
            <div className="glass-dark px-6 py-3 rounded-full">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-mono font-bold" data-testid="focus-timer">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>

          {/* Main exercise area */}
          <div className="text-center max-w-2xl">
            {selectedExercise.id === 'lotus' && (
              <div className="space-y-8">
                <h2 className="font-heading text-4xl font-bold drop-shadow-lg">Lotus Observation</h2>
                <p className="text-xl md:text-2xl font-light opacity-90 drop-shadow-md">
                  {selectedExercise.instructions}
                </p>
                <p className="text-lg opacity-70">
                  Watch the sacred lotus bloom. Let its gentle unfolding bring peace to your mind.
                </p>
              </div>
            )}

            {selectedExercise.id === 'daisy-bloom' && (
              <div className="space-y-6">
                <h2 className="font-heading text-4xl font-bold drop-shadow-lg text-gray-800">Yellow Daisy Bloom</h2>
                <p className="text-xl font-light text-gray-700 drop-shadow-sm">
                  {selectedExercise.instructions}
                </p>
              </div>
            )}

            {selectedExercise.id === 'expanding-circle' && (
              <div className="space-y-8">
                {/* Breathing Circle */}
                <div className="relative flex items-center justify-center h-80">
                  {/* Outer ring */}
                  <div 
                    className="absolute w-64 h-64 rounded-full border-4 border-white/20"
                    style={{ transform: 'scale(1.8)' }}
                  />
                  
                  {/* Animated circle */}
                  <div 
                    className="w-48 h-48 rounded-full flex items-center justify-center transition-all ease-in-out"
                    style={{ 
                      transform: `scale(${circleScale})`,
                      transitionDuration: breathPhase === 'inhale' ? '4s' : breathPhase === 'exhale' ? '6s' : '0.3s',
                      background: `radial-gradient(circle, ${
                        breathPhase === 'inhale' ? 'rgba(77, 182, 172, 0.8)' :
                        breathPhase === 'hold' ? 'rgba(255, 213, 79, 0.8)' :
                        breathPhase === 'exhale' ? 'rgba(77, 182, 172, 0.4)' :
                        'rgba(77, 182, 172, 0.5)'
                      } 0%, transparent 70%)`
                    }}
                  />
                  
                  {/* Center text */}
                  <div className="absolute text-center">
                    <p className="text-3xl font-semibold mb-1">{getBreathText()}</p>
                    <p className="text-lg opacity-70">{getBreathDuration()}</p>
                  </div>
                </div>

                {/* Progress bar */}
                {breathPhase !== 'ready' && (
                  <div className="w-64 mx-auto">
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white/80 transition-all duration-100 ease-linear rounded-full"
                        style={{ width: `${phaseProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedExercise.id === 'breath-counter' && (
              <div className="space-y-8">
                {/* Breath counter display */}
                <div className="flex flex-col items-center gap-6">
                  <div 
                    className="w-56 h-56 md:w-72 md:h-72 rounded-full flex flex-col items-center justify-center transition-all ease-in-out border-4"
                    style={{
                      transitionDuration: breathPhase === 'inhale' ? '4s' : breathPhase === 'exhale' ? '6s' : '0.3s',
                      transform: `scale(${breathPhase === 'inhale' || breathPhase === 'hold' ? 1.15 : 1})`,
                      background: breathPhase === 'inhale' ? 'rgba(77, 182, 172, 0.6)' :
                                  breathPhase === 'hold' ? 'rgba(255, 213, 79, 0.5)' :
                                  breathPhase === 'exhale' ? 'rgba(77, 182, 172, 0.3)' :
                                  'rgba(77, 182, 172, 0.2)',
                      borderColor: breathPhase === 'hold' ? 'rgba(255, 213, 79, 0.8)' : 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <span className="text-6xl md:text-8xl font-bold" data-testid="breath-count">
                      {breathCount}
                    </span>
                    <span className="text-lg opacity-80 mt-2">breaths</span>
                  </div>
                </div>

                {/* Breath phase text */}
                <div className="space-y-2">
                  <p className="text-3xl font-semibold">{getBreathText()}</p>
                  <p className="text-xl opacity-70">{getBreathDuration()}</p>
                </div>

                {/* Progress bar */}
                {breathPhase !== 'ready' && (
                  <div className="w-72 mx-auto">
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-100 ease-linear rounded-full ${
                          breathPhase === 'hold' ? 'bg-yellow-400' : 'bg-white/80'
                        }`}
                        style={{ width: `${phaseProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-2 opacity-60">
                      <span>Inhale 4s</span>
                      <span>Hold 3s</span>
                      <span>Exhale 6s</span>
                    </div>
                  </div>
                )}
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
            const isLotus = exercise.id === 'lotus';
            
            return (
              <Card
                key={exercise.id}
                className="group cursor-pointer overflow-hidden rounded-3xl shadow-float hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
                onClick={() => startExercise(exercise)}
                data-testid={`exercise-card-${exercise.id}`}
              >
                <div className={`relative h-64 ${exercise.bgClass || ''} bg-cover bg-center`}>
                  {/* Lotus preview image */}
                  {isLotus && (
                    <img 
                      src="https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?w=600&q=80"
                      alt="Lotus bloom"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
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
            <h3 className="font-heading text-xl font-semibold mb-4">Breathing Pattern (4-3-6)</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-primary">1</span>
                <span><strong className="text-foreground">Inhale (4s):</strong> Breathe in deeply through your nose</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-accent-foreground">2</span>
                <span><strong className="text-foreground">Hold (3s):</strong> Gently hold your breath</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-primary">3</span>
                <span><strong className="text-foreground">Exhale (6s):</strong> Slowly release through your mouth</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                Toggle ambient music for deeper relaxation
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FocusPage;
