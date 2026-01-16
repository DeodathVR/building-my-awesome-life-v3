import React, { useState, useEffect, useCallback } from 'react';
import { Star, Sparkles, Gift, Wand2, MessageCircle, Heart, ChevronRight, Plus, Trophy, Zap, RefreshCw, Quote, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Cosmic particles component
const CosmicParticles = ({ density = 20 }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(density)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full"
        style={{
          width: `${2 + Math.random() * 3}px`,
          height: `${2 + Math.random() * 3}px`,
          background: `rgba(${Math.random() > 0.5 ? '255, 213, 79' : '77, 182, 172'}, ${0.3 + Math.random() * 0.5})`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 3}s`
        }}
      />
    ))}
    <style>{`
      @keyframes twinkle {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.8); }
      }
    `}</style>
  </div>
);

// Mini lotus for backgrounds
const MiniLotus = ({ className = '' }) => (
  <img 
    src="https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?w=400&q=80"
    alt=""
    className={`object-cover ${className}`}
  />
);

// Celebration effect component
const CelebrationEffect = ({ show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <div className="relative">
        <CosmicParticles density={50} />
        <div className="text-center animate-bounce">
          <div className="text-6xl mb-4">🌟</div>
          <div className="px-6 py-3 bg-accent/90 rounded-full text-accent-foreground font-bold text-lg">
            Conspiracy Confirmed!
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Reframe suggestions
const reframeSuggestions = [
  "That awkward moment? Setup for your next bold connection. Universe winks. ✨",
  "Missed a habit? That's the universe giving you a plot twist to practice resilience—high-five from the stars! 🌟",
  "Running late? The universe needed everyone to take a breath before your brilliance arrived.",
  "Flat tire energy? Perfect pause for a daisy bloom moment. The cosmos has your back. 🌼",
  "That mistake? A cosmic redirect to something better. Trust the detour.",
  "Feeling stuck? The universe is just loading your next level. Buffering brilliance. ⏳✨",
  "Bad weather ruined plans? Cozy habit-stacking weather delivered. You're welcome. ☔🌸",
  "Plans fell through? Space cleared for something magical. Watch this spot. 👀",
  "That rejection? Universe's way of saying 'wrong door, superstar.' Better one ahead. 🚪✨",
  "Unexpected delay? Extra bloom time gifted. You're worth waiting for. 🌺"
];

// Card types for journal
const cardTypes = [
  { id: 'hidden-gift', name: 'Hidden Gift', icon: Gift, color: 'text-accent-foreground', bg: 'bg-accent/20', prompt: 'Spot a disguised win today...' },
  { id: 'starry-setup', name: 'Starry Setup', icon: Star, color: 'text-primary', bg: 'bg-primary/20', prompt: 'What small setup led to success?' },
  { id: 'cheeky-wink', name: 'Cheeky Wink', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/20', prompt: 'Universe sent a playful sign...' }
];

const SuccessConspiracyPage = () => {
  const navigate = useNavigate();
  const { habits, stats, chatWithCoach } = useApp();
  
  // Local storage state
  const [conspiracies, setConspiracies] = useState(() => {
    const saved = localStorage.getItem('conspiracies');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [cosmicPoints, setCosmicPoints] = useState(() => {
    const saved = localStorage.getItem('cosmicPoints');
    return saved ? parseInt(saved) : 0;
  });
  
  const [journalEntries, setJournalEntries] = useState(() => {
    const saved = localStorage.getItem('conspiracyJournal');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [communityPosts, setCommunityPosts] = useState(() => {
    const saved = localStorage.getItem('conspiracyFeed');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "The universe just hooked me up with a cancelled meeting that gave me time to hit my meditation streak!", likes: 12, time: '2h ago' },
      { id: 2, text: "Flat tire this morning = found $20 while waiting for help. Conspiracy confirmed! 🌟", likes: 24, time: '4h ago' },
      { id: 3, text: "Missed train → met someone who told me about this app. Universe playing matchmaker!", likes: 18, time: '6h ago' }
    ];
  });

  const [newConspiracy, setNewConspiracy] = useState('');
  const [newPost, setNewPost] = useState('');
  const [activeCard, setActiveCard] = useState(null);
  const [cardEntry, setCardEntry] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentReframe, setCurrentReframe] = useState(reframeSuggestions[0]);
  const [isLoadingReframe, setIsLoadingReframe] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('conspiracies', JSON.stringify(conspiracies));
  }, [conspiracies]);

  useEffect(() => {
    localStorage.setItem('cosmicPoints', cosmicPoints.toString());
  }, [cosmicPoints]);

  useEffect(() => {
    localStorage.setItem('conspiracyJournal', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('conspiracyFeed', JSON.stringify(communityPosts));
  }, [communityPosts]);

  // Check for milestone celebrations
  useEffect(() => {
    if (cosmicPoints > 0 && cosmicPoints % 50 === 0) {
      setShowCelebration(true);
    }
  }, [cosmicPoints]);

  // Get AI reframe
  const getAIReframe = useCallback(async () => {
    setIsLoadingReframe(true);
    try {
      const response = await chatWithCoach(
        "Give me a short, witty Success Conspiracy reframe (1-2 sentences). Make it playful, warm, and remind me the universe is conspiring for my success. Include an emoji.",
        null
      );
      setCurrentReframe(response.response);
    } catch (err) {
      // Fallback to pre-written suggestions
      setCurrentReframe(reframeSuggestions[Math.floor(Math.random() * reframeSuggestions.length)]);
    }
    setIsLoadingReframe(false);
  }, [chatWithCoach]);

  // Add conspiracy
  const addConspiracy = () => {
    if (!newConspiracy.trim()) return;
    
    const conspiracy = {
      id: Date.now(),
      text: newConspiracy,
      date: new Date().toISOString(),
      points: 10
    };
    
    setConspiracies(prev => [conspiracy, ...prev]);
    setCosmicPoints(prev => prev + 10);
    setNewConspiracy('');
    toast.success('+10 Cosmic Points! 🌟', { description: 'The universe noticed your awareness!' });
  };

  // Add journal entry
  const addJournalEntry = () => {
    if (!cardEntry.trim() || !activeCard) return;
    
    const entry = {
      id: Date.now(),
      type: activeCard.id,
      text: cardEntry,
      date: new Date().toISOString()
    };
    
    setJournalEntries(prev => [entry, ...prev]);
    setCosmicPoints(prev => prev + 15);
    setCardEntry('');
    setActiveCard(null);
    toast.success('+15 Cosmic Points! ✨', { description: `${activeCard.name} captured!` });
  };

  // Add community post
  const addCommunityPost = () => {
    if (!newPost.trim()) return;
    
    const post = {
      id: Date.now(),
      text: newPost,
      likes: 0,
      time: 'Just now'
    };
    
    setCommunityPosts(prev => [post, ...prev]);
    setCosmicPoints(prev => prev + 5);
    setNewPost('');
    toast.success('Shared with the cosmos! 🌌');
  };

  // Like post
  const likePost = (postId) => {
    setCommunityPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, likes: p.likes + 1 } : p
    ));
  };

  const todayConspiracies = conspiracies.filter(c => 
    new Date(c.date).toDateString() === new Date().toDateString()
  );

  return (
    <div className="min-h-screen pb-32 md:pb-8" data-testid="success-conspiracy-page">
      {/* Celebration Effect */}
      <CelebrationEffect show={showCelebration} onComplete={() => setShowCelebration(false)} />

      {/* Hero Section with Intro */}
      <section className="relative py-12 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <CosmicParticles density={25} />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <Card className="p-8 rounded-3xl shadow-float border-border/50 glass overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
              <MiniLotus className="w-full h-full rounded-full" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                    Success Conspiracy
                  </h1>
                  <p className="text-sm text-muted-foreground">The universe is plotting your success</p>
                </div>
              </div>
              
              <div className="bg-secondary/30 rounded-2xl p-5 mb-6">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  What is Inverse Paranoia?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Instead of fearing the worst, choose to see the <strong className="text-foreground">universe as your loving co-conspirator</strong>—rigging 
                  everything to help you win. A challenge? A lesson. A delay? Extra bloom time. 
                  This tab is your daily reminder to spot the wins hiding in plain sight. 🌸
                </p>
              </div>

              {/* Cosmic Points Display */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-accent/20 rounded-full flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent-foreground fill-accent-foreground" />
                    <span className="font-bold text-lg text-accent-foreground" data-testid="cosmic-points">
                      {cosmicPoints}
                    </span>
                    <span className="text-sm text-accent-foreground/70">Cosmic Points</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/focus')}
                  className="rounded-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Bloom Session
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {/* Daily Conspiracy Quest */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-semibold">Daily Conspiracy Quest</h2>
          </div>
          
          <Card className="p-6 rounded-2xl shadow-soft border-border/50">
            <p className="text-muted-foreground mb-4">
              🌟 <em>The universe sent a plot twist today—what is it trying to help you with?</em>
            </p>
            
            <div className="flex gap-3 mb-4">
              <Input
                placeholder="e.g., 'Flat tire = time for daisy bloom!'"
                value={newConspiracy}
                onChange={(e) => setNewConspiracy(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addConspiracy()}
                className="rounded-xl"
                data-testid="conspiracy-input"
              />
              <Button 
                onClick={addConspiracy}
                disabled={!newConspiracy.trim()}
                className="rounded-xl px-6"
                data-testid="add-conspiracy-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log
              </Button>
            </div>

            {/* Today's conspiracies */}
            {todayConspiracies.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Today's conspiracies ({todayConspiracies.length}/3):</p>
                {todayConspiracies.slice(0, 3).map(c => (
                  <div key={c.id} className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl">
                    <Star className="w-4 h-4 text-accent-foreground flex-shrink-0" />
                    <span className="text-sm">{c.text}</span>
                    <span className="ml-auto text-xs text-primary font-medium">+{c.points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        {/* Witty AI Reframe */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-semibold">Cosmic Reframe</h2>
          </div>
          
          <Card className="p-6 rounded-2xl shadow-soft border-border/50 relative overflow-hidden">
            <CosmicParticles density={10} />
            <div className="relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium text-foreground leading-relaxed mb-4">
                    {isLoadingReframe ? (
                      <span className="animate-pulse">Consulting the cosmos...</span>
                    ) : (
                      currentReframe
                    )}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={getAIReframe}
                    disabled={isLoadingReframe}
                    className="rounded-full"
                    data-testid="refresh-reframe-button"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingReframe ? 'animate-spin' : ''}`} />
                    New Reframe
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Conspiracy Journal Cards */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Quote className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-semibold">Conspiracy Journal</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {cardTypes.map((card) => {
              const Icon = card.icon;
              const isActive = activeCard?.id === card.id;
              
              return (
                <Card 
                  key={card.id}
                  className={`p-5 rounded-2xl shadow-soft border-border/50 cursor-pointer transition-all hover:-translate-y-1 ${
                    isActive ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setActiveCard(isActive ? null : card)}
                  data-testid={`card-${card.id}`}
                >
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <h3 className="font-heading font-semibold mb-1">{card.name}</h3>
                  <p className="text-sm text-muted-foreground">{card.prompt}</p>
                  
                  {isActive && (
                    <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                      <Textarea
                        placeholder="Write your reflection..."
                        value={cardEntry}
                        onChange={(e) => setCardEntry(e.target.value)}
                        className="rounded-xl resize-none"
                        rows={3}
                      />
                      <Button 
                        size="sm" 
                        onClick={addJournalEntry}
                        disabled={!cardEntry.trim()}
                        className="rounded-full w-full"
                      >
                        Save Entry (+15 pts)
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Recent journal entries */}
          {journalEntries.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Recent entries:</p>
              {journalEntries.slice(0, 3).map(entry => {
                const cardType = cardTypes.find(c => c.id === entry.type);
                const Icon = cardType?.icon || Star;
                return (
                  <div key={entry.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                    <Icon className={`w-4 h-4 ${cardType?.color || 'text-primary'} mt-0.5`} />
                    <p className="text-sm flex-1">{entry.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Milestones */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-semibold">Conspiracy Milestones</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { points: 50, label: 'Cosmic Initiate', unlocked: cosmicPoints >= 50 },
              { points: 100, label: 'Star Spotter', unlocked: cosmicPoints >= 100 },
              { points: 250, label: 'Universe Ally', unlocked: cosmicPoints >= 250 },
              { points: 500, label: 'Conspiracy Master', unlocked: cosmicPoints >= 500 }
            ].map((milestone, idx) => (
              <Card 
                key={idx}
                className={`p-4 rounded-2xl text-center transition-all ${
                  milestone.unlocked 
                    ? 'bg-accent/20 border-accent/50' 
                    : 'bg-muted/30 border-border/50 opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  milestone.unlocked ? 'bg-accent' : 'bg-muted'
                }`}>
                  <Star className={`w-5 h-5 ${milestone.unlocked ? 'text-accent-foreground fill-accent-foreground' : 'text-muted-foreground'}`} />
                </div>
                <p className="font-semibold text-sm">{milestone.label}</p>
                <p className="text-xs text-muted-foreground">{milestone.points} pts</p>
                {milestone.unlocked && (
                  <span className="text-xs text-primary font-medium">✓ Unlocked</span>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Community Conspiracy Feed */}
        <section className="pb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-semibold">Conspiracy Feed</h2>
          </div>
          
          <Card className="p-6 rounded-2xl shadow-soft border-border/50 mb-4">
            <p className="text-sm text-muted-foreground mb-3">Share your conspiracy with the cosmos:</p>
            <div className="flex gap-3">
              <Input
                placeholder="The universe just hooked me up with..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCommunityPost()}
                className="rounded-xl"
                data-testid="community-post-input"
              />
              <Button 
                onClick={addCommunityPost}
                disabled={!newPost.trim()}
                className="rounded-xl"
                data-testid="share-conspiracy-button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          <div className="space-y-3">
            {communityPosts.slice(0, 5).map((post, idx) => (
              <Card 
                key={post.id}
                className={`p-4 rounded-2xl border-border/50 ${idx === 0 ? 'bg-accent/10 border-accent/30' : ''}`}
              >
                {idx === 0 && (
                  <div className="flex items-center gap-1 text-xs text-accent-foreground font-medium mb-2">
                    <Star className="w-3 h-3" />
                    Conspiracy of the Day
                  </div>
                )}
                <p className="text-foreground mb-3">{post.text}</p>
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => likePost(post.id)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`like-post-${post.id}`}
                  >
                    <Heart className={`w-4 h-4 ${post.likes > 0 ? 'fill-primary text-primary' : ''}`} />
                    {post.likes}
                  </button>
                  <span className="text-xs text-muted-foreground">{post.time}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SuccessConspiracyPage;
