import React, { useState, useRef, useEffect } from 'react';
import { Heart, Share2, Bookmark, Play, Pause, RefreshCw, Sparkles, MessageCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Mini Daisy Animation Component for feed
const MiniDaisyBloom = ({ animate }) => (
  <div className="relative w-full h-full flex items-center justify-center">
    <div className="relative" style={{ transform: 'scale(0.6)' }}>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 origin-bottom"
          style={{ transform: `translate(-50%, -100%) rotate(${i * 30}deg)` }}
        >
          <div 
            className="w-5 h-16 rounded-full"
            style={{
              background: 'linear-gradient(to top, #ea580c, #f97316, #fbbf24, #fde047)',
              transform: animate ? 'scaleY(1)' : 'scaleY(0.3)',
              transformOrigin: 'bottom',
              transition: `transform ${2 + i * 0.1}s ease-out`
            }}
          />
        </div>
      ))}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700" />
    </div>
  </div>
);

// Mini Lotus Animation Component
const MiniLotusBloom = ({ animate }) => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
    <img 
      src="https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?w=400&q=80"
      alt="Lotus"
      className="absolute inset-0 w-full h-full object-cover"
      style={{
        transform: animate ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 8s ease-out'
      }}
    />
  </div>
);

// Expanding Circle Animation
const MiniExpandingCircle = ({ animate }) => (
  <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
    <div 
      className="w-24 h-24 rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(77, 182, 172, 0.8) 0%, transparent 70%)',
        transform: animate ? 'scale(2)' : 'scale(1)',
        transition: 'transform 4s ease-in-out'
      }}
    />
    {animate && (
      <p className="absolute text-white/80 text-lg font-light animate-pulse">
        Breathe...
      </p>
    )}
  </div>
);

// Cosmic particles overlay
const CosmicParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-white/40"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 2}s`
        }}
      />
    ))}
    <style>{`
      @keyframes twinkle {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.5); }
      }
    `}</style>
  </div>
);

// Feed content data
const generateFeedContent = () => [
  {
    id: 1,
    type: 'conspiracy',
    category: 'Witty Conspiracy',
    visual: 'lotus',
    text: "Missed your alarm? Universe just gifted you extra bloom time. You're worth waiting for. 🌸",
    subtext: "Today's Success Conspiracy",
    gradient: 'from-primary/20 via-transparent to-transparent'
  },
  {
    id: 2,
    type: 'reframe',
    category: 'Awesome Reframe',
    visual: 'daisy',
    text: "That rainy day? Perfect setup for cozy habit stacking.",
    subtext: "Reframe your perspective",
    gradient: 'from-accent/20 via-transparent to-transparent'
  },
  {
    id: 3,
    type: 'affirmation',
    category: 'Bloom Moment',
    visual: 'circle',
    text: "Breathe in possibility... Exhale doubt... The universe cheers your next step.",
    subtext: "60-second bloom session",
    gradient: 'from-secondary/30 via-transparent to-transparent'
  },
  {
    id: 4,
    type: 'quickwin',
    category: 'Quick Win Spotlight',
    visual: 'stats',
    text: "Someone turned a delay into a 5-day streak. Your turn?",
    subtext: "Community inspiration",
    streak: 5,
    gradient: 'from-primary/20 via-transparent to-transparent'
  },
  {
    id: 5,
    type: 'cosmic',
    category: 'Cosmic Teaser',
    visual: 'cosmic',
    text: "Hey superstar, you're doing better than you think—keep blooming. ✨",
    subtext: "AI Coach whisper",
    gradient: 'from-purple-500/20 via-transparent to-transparent'
  },
  {
    id: 6,
    type: 'conspiracy',
    category: 'Witty Conspiracy',
    visual: 'daisy',
    text: "Late to the meeting? The universe needed everyone to take a breath before your brilliance arrived.",
    subtext: "Today's Success Conspiracy",
    gradient: 'from-accent/20 via-transparent to-transparent'
  },
  {
    id: 7,
    type: 'affirmation',
    category: 'Bloom Moment',
    visual: 'lotus',
    text: "Every petal that opens is a worry released. Watch, breathe, bloom.",
    subtext: "Morning affirmation",
    gradient: 'from-primary/20 via-transparent to-transparent'
  }
];

const AwesomeFeedPage = () => {
  const navigate = useNavigate();
  const { habits, stats } = useApp();
  const [feedItems, setFeedItems] = useState(generateFeedContent());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedItems, setSavedItems] = useState([]);
  const [likedItems, setLikedItems] = useState([]);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);

  // Auto-animate visuals
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setIsAnimating(prev => !prev);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handleSwipe = (direction) => {
    if (direction === 'up' && currentIndex < feedItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(true);
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsAnimating(true);
    }
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    if (Math.abs(diff) > 50) {
      handleSwipe(diff > 0 ? 'up' : 'down');
    }
  };

  const handleWheel = (e) => {
    if (e.deltaY > 0) {
      handleSwipe('up');
    } else {
      handleSwipe('down');
    }
  };

  const handleSave = (itemId) => {
    if (savedItems.includes(itemId)) {
      setSavedItems(prev => prev.filter(id => id !== itemId));
      toast.info('Removed from journal');
    } else {
      setSavedItems(prev => [...prev, itemId]);
      toast.success('Saved to journal! 📝');
    }
  };

  const handleLike = (itemId) => {
    if (!likedItems.includes(itemId)) {
      setLikedItems(prev => [...prev, itemId]);
      toast.success('Loved it! 💚');
    }
  };

  const handleShare = () => {
    toast.success('Shared anonymously to community! 🌟');
  };

  const handleBloomSession = () => {
    navigate('/focus');
    toast.info('Starting a bloom session...');
  };

  const handleRefresh = () => {
    setFeedItems([...generateFeedContent()].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    toast.success('Fresh inspiration loaded! ✨');
  };

  const currentItem = feedItems[currentIndex];

  const renderVisual = (visual, animate) => {
    switch (visual) {
      case 'lotus':
        return <MiniLotusBloom animate={animate} />;
      case 'daisy':
        return <MiniDaisyBloom animate={animate} />;
      case 'circle':
        return <MiniExpandingCircle animate={animate} />;
      case 'stats':
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">{stats?.max_streak || 5}</div>
              <div className="text-white/80">day streak achieved</div>
            </div>
          </div>
        );
      case 'cosmic':
        return (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center">
            <Sparkles className="w-20 h-20 text-yellow-400 animate-pulse" />
          </div>
        );
      default:
        return <MiniLotusBloom animate={animate} />;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-background z-40 overflow-hidden"
      data-testid="awesome-feed-page"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-background via-background/80 to-transparent">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold text-foreground">Awesome Feed</h1>
            <p className="text-xs text-muted-foreground">Making You Awesome</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            className="rounded-full"
            data-testid="feed-refresh-button"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Feed Container */}
      <div 
        ref={containerRef}
        className="h-full w-full pt-20 pb-32 md:pb-8"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div className="max-w-lg mx-auto h-full px-4">
          {/* Current Feed Item */}
          <div 
            className="relative h-full rounded-3xl overflow-hidden shadow-float bg-card border border-border/50"
            data-testid={`feed-item-${currentItem.id}`}
          >
            {/* Visual Background */}
            <div className="absolute inset-0">
              {renderVisual(currentItem.visual, isAnimating)}
              <div className={`absolute inset-0 bg-gradient-to-t ${currentItem.gradient}`} />
              <CosmicParticles />
            </div>

            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-6">
              {/* Category badge */}
              <div className="mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                  {currentItem.category}
                </span>
              </div>

              {/* Main text */}
              <p className="text-2xl md:text-3xl font-heading font-semibold text-white leading-tight mb-3 drop-shadow-lg">
                {currentItem.text}
              </p>

              {/* Subtext */}
              <p className="text-white/70 text-sm mb-6">
                {currentItem.subtext}
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBloomSession}
                  className="rounded-full glass"
                  data-testid="feed-bloom-button"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Quick Bloom
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleLike(currentItem.id)}
                  className={`rounded-full ${likedItems.includes(currentItem.id) ? 'text-red-500' : 'text-white/80'}`}
                  data-testid="feed-like-button"
                >
                  <Heart className={`w-5 h-5 ${likedItems.includes(currentItem.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSave(currentItem.id)}
                  className={`rounded-full ${savedItems.includes(currentItem.id) ? 'text-primary' : 'text-white/80'}`}
                  data-testid="feed-save-button"
                >
                  <Bookmark className={`w-5 h-5 ${savedItems.includes(currentItem.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  className="rounded-full text-white/80"
                  data-testid="feed-share-button"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Side navigation indicators */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              {feedItems.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-1.5 h-6 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            {/* Swipe hints */}
            {currentIndex > 0 && (
              <button 
                onClick={() => handleSwipe('down')}
                className="absolute top-24 left-1/2 -translate-x-1/2 text-white/50 animate-bounce"
              >
                <ChevronUp className="w-6 h-6" />
              </button>
            )}
            {currentIndex < feedItems.length - 1 && (
              <button 
                onClick={() => handleSwipe('up')}
                className="absolute bottom-28 left-1/2 -translate-x-1/2 text-white/50 animate-bounce"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            )}

            {/* Play/Pause for animations */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute top-24 right-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/50 transition-colors"
              data-testid="feed-play-pause"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

          {/* Feed counter */}
          <div className="text-center mt-4 text-sm text-muted-foreground">
            {currentIndex + 1} of {feedItems.length} • Swipe for more
          </div>
        </div>
      </div>

      {/* AI personalization hint */}
      <div className="absolute bottom-20 md:bottom-4 left-0 right-0 flex justify-center">
        <div className="glass px-4 py-2 rounded-full text-xs text-muted-foreground flex items-center gap-2">
          <MessageCircle className="w-3 h-3" />
          Personalized based on your {habits.length} habits
        </div>
      </div>
    </div>
  );
};

export default AwesomeFeedPage;
