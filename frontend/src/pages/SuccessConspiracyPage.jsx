import React, { useState, useEffect, useCallback } from 'react';
import { Star, Sparkles, Gift, Wand2, MessageCircle, Heart, Plus, Trophy, RefreshCw, Quote, Send, Flower, Brain, ArrowRight, Share2 } from 'lucide-react';
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
      @keyframes gentlePulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      @keyframes petalUnfurl {
        0% { transform: scale(0.8) rotate(-10deg); opacity: 0; }
        50% { transform: scale(1.1) rotate(5deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }
      @keyframes warmGlow {
        0% { box-shadow: 0 0 0 0 rgba(77, 182, 172, 0.4); }
        50% { box-shadow: 0 0 20px 10px rgba(77, 182, 172, 0.2); }
        100% { box-shadow: 0 0 0 0 rgba(77, 182, 172, 0); }
      }
    `}</style>
  </div>
);

// Gentle celebration component - like Yahoo Mail's satisfying but non-gamey celebration
const GentleCelebration = ({ show, message, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <div className="relative animate-[petalUnfurl_0.8s_ease-out]">
        <div className="absolute inset-0 animate-[warmGlow_2s_ease-out]" />
        <div className="text-center bg-card/95 backdrop-blur-xl px-8 py-6 rounded-3xl shadow-float border border-primary/20">
          <div className="text-4xl mb-3 animate-bounce">🌸</div>
          <p className="font-heading text-lg font-semibold text-foreground mb-1">Conspiracy Confirmed</p>
          <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Thought flip suggestions for negative self-talk
const thoughtFlips = {
  "failing": "Universe is training your resilience muscle—every stumble is a setup for your comeback story 🌱",
  "stuck": "The universe's gentle nudge to pause and bloom your focus—try a quick daisy session 🌼",
  "behind": "You're not behind, you're on your own cosmic timeline. The universe doesn't do 'late' 🌟",
  "anxious": "That flutter? Your intuition warming up for something good. Breathe with the expanding circle 💫",
  "overwhelmed": "Universe sent a pause button disguised as overwhelm. Time for a lotus bloom moment 🪷",
  "not good enough": "The stars didn't align just for 'good enough'—they aligned for uniquely, beautifully YOU ✨",
  "frustrated": "Friction creates diamonds. The universe is polishing you for something brilliant 💎",
  "tired": "Rest is part of the conspiracy too. Even flowers close at night to bloom brighter tomorrow 🌙"
};

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
  
  const [journalEntries, setJournalEntries] = useState(() => {
    const saved = localStorage.getItem('conspiracyJournal');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [thoughtEntries, setThoughtEntries] = useState(() => {
    const saved = localStorage.getItem('thoughtTracker');
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
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  // Cosmic Reframer state
  const [reframerInput, setReframerInput] = useState('');
  const [reframerResponse, setReframerResponse] = useState('');
  const [isReframing, setIsReframing] = useState(false);
  
  // Thought Tracker state
  const [negativeThought, setNegativeThought] = useState('');
  const [flippedThought, setFlippedThought] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);

  // Milestone unlocks (quiet, no numbers)
  const milestones = [
    { id: 'initiate', entries: 3, label: 'Cosmic Initiate', message: "You're already blooming into your best self" },
    { id: 'spotter', entries: 10, label: 'Star Spotter', message: "Your eyes are opening to the magic around you" },
    { id: 'ally', entries: 25, label: 'Universe Ally', message: "The cosmos recognizes a kindred spirit" },
    { id: 'master', entries: 50, label: 'Conspiracy Master', message: "You've mastered the art of seeing silver linings" }
  ];

  const totalEntries = conspiracies.length + journalEntries.length + thoughtEntries.length;

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('conspiracies', JSON.stringify(conspiracies));
  }, [conspiracies]);

  useEffect(() => {
    localStorage.setItem('conspiracyJournal', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('thoughtTracker', JSON.stringify(thoughtEntries));
  }, [thoughtEntries]);

  useEffect(() => {
    localStorage.setItem('conspiracyFeed', JSON.stringify(communityPosts));
  }, [communityPosts]);

  // Trigger gentle celebration
  const triggerCelebration = useCallback((message) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
  }, []);

  // Cosmic Reframer - AI chat (empathetic, centering-first)
  const handleReframe = async () => {
    if (!reframerInput.trim()) return;
    setIsReframing(true);
    
    const streakInfo = stats?.max_streak > 0 ? ` They have a ${stats.max_streak}-day streak.` : '';
    const habitInfo = habits.length > 0 ? ` They're working on habits like ${habits.slice(0, 2).map(h => h.name).join(' and ')}.` : '';
    
    try {
      const response = await chatWithCoach(
        `As a gentle, wise companion using the Success Conspiracy perspective (the universe is conspiring FOR their success), first validate their feeling with empathy, then offer a grounded reframe. Be warm and supportive, never dismissive. Issue: "${reframerInput}"${streakInfo}${habitInfo} Format: Start with validation (1 sentence acknowledging how they feel), then the reframe (1-2 sentences). Keep it centering and calming. No marketing or sharing suggestions.`,
        null
      );
      setReframerResponse(response.response);
    } catch (err) {
      // Fallback response - empathetic first
      setReframerResponse(`That sounds really challenging, and it's okay to feel this way. What if this moment is the universe's way of creating space for something better? Take a breath—sometimes the pause before the breakthrough feels the heaviest. 🌸`);
    }
    setIsReframing(false);
  };

  // Thought Tracker - flip negative thoughts (empathetic approach)
  const handleFlipThought = async () => {
    if (!negativeThought.trim()) return;
    setIsFlipping(true);
    
    // Check for keyword matches first
    const lowerThought = negativeThought.toLowerCase();
    let flip = null;
    
    for (const [key, value] of Object.entries(thoughtFlips)) {
      if (lowerThought.includes(key)) {
        flip = value;
        break;
      }
    }
    
    if (!flip) {
      try {
        const response = await chatWithCoach(
          `Transform this negative self-talk into a Success Conspiracy perspective (universe conspiring FOR them). First acknowledge the feeling is valid, then gently reframe. Be warm and grounded, never dismissive. Negative thought: "${negativeThought}". Reply with just the reframed thought (2 sentences max) with an emoji. No marketing or sharing suggestions.`,
          null
        );
        flip = response.response;
      } catch (err) {
        flip = "It's okay to feel this way—your feelings are valid. The universe might be using this moment to build something beautiful in you. Trust the process 🌱";
      }
    }
    
    setFlippedThought(flip);
    
    // Save to thought entries
    const entry = {
      id: Date.now(),
      original: negativeThought,
      flipped: flip,
      date: new Date().toISOString()
    };
    setThoughtEntries(prev => [entry, ...prev]);
    
    // Trigger celebration
    setTimeout(() => {
      triggerCelebration("You're rewriting your story—that takes real courage 💚");
    }, 500);
    
    setIsFlipping(false);
  };

  // Add conspiracy
  const addConspiracy = () => {
    if (!newConspiracy.trim()) return;
    
    const conspiracy = {
      id: Date.now(),
      text: newConspiracy,
      date: new Date().toISOString()
    };
    
    setConspiracies(prev => [conspiracy, ...prev]);
    setNewConspiracy('');
    
    // Gentle celebration
    triggerCelebration("You're blooming stronger every day 🌸");
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
    setCardEntry('');
    setActiveCard(null);
    
    triggerCelebration(`${activeCard.name} captured—your awareness is expanding 🌟`);
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
      {/* Gentle Celebration */}
      <GentleCelebration 
        show={showCelebration} 
        message={celebrationMessage}
        onComplete={() => setShowCelebration(false)} 
      />

      {/* Hero Section with Updated Header */}
      <section className="relative py-12 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <CosmicParticles density={25} />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <Card className="p-8 rounded-3xl shadow-float border-border/50 glass overflow-hidden">
            {/* Lotus thumbnail */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
              <img 
                src="https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?w=400&q=80"
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            
            <div className="relative z-10">
              {/* Updated Header with pulsing animation */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <Wand2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground leading-tight">
                    The Universe is out to get you
                    <span className="inline-block animate-[gentlePulse_2s_ease-in-out_infinite]">...</span>
                  </h1>
                  <p className="font-heading text-xl md:text-2xl font-semibold text-primary mt-1">
                    to become the best version of yourself!
                  </p>
                </div>
              </div>
              
              {/* Updated Explanation Card */}
              <div className="bg-secondary/30 rounded-2xl p-6 mb-6 border border-primary/10">
                <div className="flex items-start gap-3">
                  <Flower className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-foreground leading-relaxed">
                    Instead of fearing the worst, choose to see the <strong className="text-primary">universe as your loving co-conspirator</strong>—rigging 
                    everything to help you win. A challenge? A lesson. A delay? Choose to have <em>Inverse Paranoia</em> where you constantly 
                    see how the Universe is out to help <strong>YOU</strong> 🌸. This tab is your daily reminder to spot the wins hiding in plain 
                    sight and <strong className="text-primary">REFRAME</strong> your thoughts.
                  </p>
                </div>
              </div>

              {/* Soft action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/focus')}
                  className="rounded-full border-primary/30 hover:bg-primary/10"
                >
                  <Sparkles className="w-4 h-4 mr-2 text-primary" />
                  Start Bloom Session
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 space-y-8">
        
        {/* Cosmic Reframer Chat Box */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-semibold">Cosmic Reframer</h2>
            <span className="text-xs text-muted-foreground ml-2">Your supportive companion</span>
          </div>
          
          <Card className="p-6 rounded-2xl shadow-soft border-border/50 relative overflow-hidden">
            <CosmicParticles density={8} />
            <div className="relative z-10">
              <p className="text-muted-foreground mb-4">
                Share what's on your mind, and let's find the hidden opportunity together...
              </p>
              
              <div className="flex gap-3 mb-4">
                <Input
                  placeholder="e.g., 'I feel stuck' or 'I'm worried about...'"
                  value={reframerInput}
                  onChange={(e) => setReframerInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleReframe()}
                  className="rounded-xl"
                  data-testid="reframer-input"
                />
                <Button 
                  onClick={handleReframe}
                  disabled={!reframerInput.trim() || isReframing}
                  className="rounded-xl px-6"
                  data-testid="reframe-button"
                >
                  {isReframing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Reframe
                    </>
                  )}
                </Button>
              </div>

              {reframerResponse && (
                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-foreground leading-relaxed">{reframerResponse}</p>
                      <button 
                        onClick={() => {
                          setReframerInput('');
                          setReframerResponse('');
                        }}
                        className="text-xs text-primary mt-2 hover:underline"
                      >
                        Ask another question
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Thought Tracker - Re-centering */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-semibold">Thought Tracker</h2>
            <span className="text-xs text-muted-foreground ml-2">Re-center your inner dialog</span>
          </div>
          
          <Card className="p-6 rounded-2xl shadow-soft border-border/50">
            <p className="text-muted-foreground mb-4">
              <em>Catch a negative thought? Let's flip it to see the conspiracy working for you...</em>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">I'm thinking:</label>
                <Input
                  placeholder="e.g., 'I'm failing' or 'I'm not good enough'"
                  value={negativeThought}
                  onChange={(e) => setNegativeThought(e.target.value)}
                  className="rounded-xl"
                  data-testid="thought-input"
                />
              </div>
              
              <Button 
                onClick={handleFlipThought}
                disabled={!negativeThought.trim() || isFlipping}
                variant="outline"
                className="rounded-full w-full border-primary/30"
                data-testid="flip-thought-button"
              >
                {isFlipping ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                Flip to Conspiracy View
              </Button>

              {flippedThought && (
                <div className="bg-accent/10 rounded-xl p-4 border border-accent/20 animate-[petalUnfurl_0.5s_ease-out]">
                  <p className="text-sm text-muted-foreground mb-1">The universe's perspective:</p>
                  <p className="text-foreground font-medium">{flippedThought}</p>
                  <button 
                    onClick={() => {
                      setNegativeThought('');
                      setFlippedThought('');
                    }}
                    className="text-xs text-primary mt-3 hover:underline"
                  >
                    Flip another thought
                  </button>
                </div>
              )}
            </div>

            {/* Recent flipped thoughts */}
            {thoughtEntries.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border/50">
                <p className="text-sm font-medium text-muted-foreground mb-3">Recent reframes:</p>
                <div className="space-y-2">
                  {thoughtEntries.slice(0, 2).map(entry => (
                    <div key={entry.id} className="text-sm p-3 bg-muted/30 rounded-xl">
                      <span className="text-muted-foreground line-through">{entry.original}</span>
                      <span className="text-muted-foreground mx-2">→</span>
                      <span className="text-foreground">{entry.flipped}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* Daily Conspiracy Quest */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-primary" />
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
                <p className="text-sm font-medium text-foreground">Today's conspiracies:</p>
                {todayConspiracies.slice(0, 3).map(c => (
                  <div key={c.id} className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl">
                    <Star className="w-4 h-4 text-accent-foreground flex-shrink-0" />
                    <span className="text-sm">{c.text}</span>
                  </div>
                ))}
              </div>
            )}
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
                        Save Entry
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
              <p className="text-sm font-medium text-muted-foreground">Recent reflections:</p>
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

        {/* Quiet Milestones - No numbers, just affirmations */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-semibold">Your Journey</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {milestones.map((milestone) => {
              const unlocked = totalEntries >= milestone.entries;
              return (
                <Card 
                  key={milestone.id}
                  className={`p-4 rounded-2xl text-center transition-all ${
                    unlocked 
                      ? 'bg-primary/10 border-primary/30 shadow-soft' 
                      : 'bg-muted/20 border-border/30 opacity-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center transition-all ${
                    unlocked ? 'bg-primary/20 animate-[warmGlow_3s_ease-in-out_infinite]' : 'bg-muted/50'
                  }`}>
                    <Star className={`w-5 h-5 ${unlocked ? 'text-primary fill-primary/30' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="font-semibold text-sm">{milestone.label}</p>
                  {unlocked && (
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">{milestone.message}</p>
                  )}
                </Card>
              );
            })}
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

          {/* Subtle invite nudge */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Know someone who could use a cosmic perspective shift?
            </p>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toast.success("Share link copied! Invite them to bloom with you 🌸")}
              className="rounded-full text-primary"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Invite a friend to bloom
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SuccessConspiracyPage;
