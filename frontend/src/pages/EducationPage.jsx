import React from 'react';
import { BookOpen, Lightbulb, Zap, Target, Clock, Layers, Play, ExternalLink } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const habitTips = [
  {
    id: 'start-small',
    title: 'Start Small',
    icon: Target,
    content: 'Make your habits so tiny they\'re impossible to fail. Want to meditate? Start with just one breath. Reading? One page. Exercise? One pushup. The goal is consistency, not intensity.',
    source: 'Atomic Habits'
  },
  {
    id: 'habit-stacking',
    title: 'Habit Stacking',
    icon: Layers,
    content: 'Link new habits to existing routines. Formula: "After I [CURRENT HABIT], I will [NEW HABIT]." Example: After I pour my morning coffee, I will write one thing I\'m grateful for.',
    source: 'Atomic Habits'
  },
  {
    id: 'environment-design',
    title: 'Environment Design',
    icon: Lightbulb,
    content: 'Make good habits obvious and easy. Put your book on your pillow. Keep your yoga mat rolled out. Make bad habits invisible and difficult. Remove junk food from sight.',
    source: 'Atomic Habits'
  },
  {
    id: 'two-minute-rule',
    title: 'The Two-Minute Rule',
    icon: Clock,
    content: 'When you start a new habit, it should take less than two minutes to do. "Read before bed" becomes "Read one page." The point is to master showing up.',
    source: 'Atomic Habits'
  },
  {
    id: 'never-miss-twice',
    title: 'Never Miss Twice',
    icon: Zap,
    content: 'Missing one day won\'t hurt you. Missing two begins a new streak—of not doing the habit. If you miss once, get back on track immediately. Perfection isn\'t required.',
    source: 'Atomic Habits'
  }
];

const focusExplanations = [
  {
    title: 'Why Lotus Observation Works',
    content: 'Slow, natural visuals like a lotus blooming train your attention span by giving your brain a gentle anchor. Unlike fast-moving content, these exercises strengthen your ability to sustain focus without overstimulation.'
  },
  {
    title: 'The Science of Expanding Circles',
    content: 'Rhythmic breathing exercises activate the parasympathetic nervous system, reducing cortisol and anxiety. The visual component provides a focus point that makes meditation accessible for beginners.'
  },
  {
    title: 'Breath Counting Benefits',
    content: 'Counting breaths creates a feedback loop between body and mind. Each counted breath is a small win that builds your concentration muscle, making it easier to focus on habits throughout the day.'
  }
];

// Educational videos (embeddable YouTube videos about habits and mindfulness)
const educationalVideos = [
  {
    id: 'atomic-habits',
    title: 'Atomic Habits Summary',
    description: 'Key principles from James Clear\'s bestselling book on building better habits.',
    duration: '8 min',
    embedUrl: 'https://www.youtube.com/embed/YT7tQzmGRLA',
    thumbnail: 'https://img.youtube.com/vi/YT7tQzmGRLA/maxresdefault.jpg'
  },
  {
    id: 'meditation-science',
    title: 'The Science of Meditation',
    description: 'How mindfulness changes your brain and improves focus.',
    duration: '6 min',
    embedUrl: 'https://www.youtube.com/embed/m8rRzTtP7Tc',
    thumbnail: 'https://img.youtube.com/vi/m8rRzTtP7Tc/maxresdefault.jpg'
  },
  {
    id: 'morning-routine',
    title: 'Building a Morning Routine',
    description: 'Practical steps to create a morning routine that sticks.',
    duration: '10 min',
    embedUrl: 'https://www.youtube.com/embed/X2IkOT8mLLw',
    thumbnail: 'https://img.youtube.com/vi/X2IkOT8mLLw/maxresdefault.jpg'
  }
];

const EducationPage = () => {
  const [playingVideo, setPlayingVideo] = React.useState(null);

  return (
    <div className="min-h-screen pb-32 md:pb-8 px-6 py-8" data-testid="education-page">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Learn to Build Better Habits
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Evidence-based tips from behavioral science to help you build lasting habits and improve focus.
          </p>
        </div>

        {/* Educational Videos Section */}
        <section className="mb-16">
          <h2 className="font-heading text-2xl font-semibold mb-6 flex items-center gap-3">
            <Play className="w-6 h-6 text-primary" />
            Educational Videos
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {educationalVideos.map((video) => (
              <Card 
                key={video.id}
                className="rounded-2xl shadow-soft border-border/50 overflow-hidden group"
                data-testid={`video-card-${video.id}`}
              >
                {playingVideo === video.id ? (
                  <div className="aspect-video">
                    <iframe
                      src={`${video.embedUrl}?autoplay=1&rel=0`}
                      title={video.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div 
                    className="aspect-video relative cursor-pointer"
                    onClick={() => setPlayingVideo(video.id)}
                  >
                    <img 
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded text-white text-xs">
                      {video.duration}
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-heading font-semibold text-foreground mb-1">{video.title}</h4>
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Habit Tips - Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-heading text-2xl font-semibold flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              Habit Formation Tips
            </h2>
            
            <div className="grid gap-4 stagger-children">
              {habitTips.map((tip) => {
                const Icon = tip.icon;
                return (
                  <Card 
                    key={tip.id} 
                    className="p-6 rounded-2xl shadow-soft border-border/50 hover:shadow-md transition-all"
                    data-testid={`tip-card-${tip.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-heading text-lg font-semibold">{tip.title}</h3>
                          <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-secondary-foreground">
                            {tip.source}
                          </span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{tip.content}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Voice Logging Section */}
            <Card className="p-8 rounded-2xl shadow-soft border-border/50 bg-gradient-to-br from-primary/5 to-transparent mt-8">
              <div className="flex items-start gap-3 mb-4">
                <h3 className="font-heading text-xl font-semibold">Track & Reflect with Voice</h3>
                <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs font-bold rounded-full">BETA</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Use our voice logging feature to quickly mark habits as done without breaking your flow. 
                Simply say "I completed my meditation" or "Log workout done" to update your progress instantly.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-background rounded-full text-sm border">"Log meditation done"</span>
                <span className="px-3 py-1 bg-background rounded-full text-sm border">"I finished reading"</span>
                <span className="px-3 py-1 bg-background rounded-full text-sm border">"Add habit: Exercise"</span>
              </div>
              <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Works best in Chrome or Edge browsers
              </p>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Focus Practices Explanation */}
            <Card className="p-6 rounded-2xl shadow-soft border-border/50">
              <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent-foreground" />
                Why Focus Practices Work
              </h3>
              
              <Accordion type="single" collapsible className="w-full">
                {focusExplanations.map((item, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {item.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <Link to="/focus" className="block mt-4">
                <Button className="w-full rounded-full" variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  Try Focus Practices
                </Button>
              </Link>
            </Card>

            {/* Quick Tips */}
            <Card className="p-6 rounded-2xl shadow-soft border-border/50">
              <h3 className="font-heading text-lg font-semibold mb-4">Daily Checklist</h3>
              <ul className="space-y-3">
                {[
                  'Start your day with a 2-minute habit',
                  'Stack a new habit onto your morning routine',
                  'Complete one focus practice session',
                  'Voice-log at least one habit completion',
                  'Celebrate small wins'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-primary font-semibold">{idx + 1}</span>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Additional Resources */}
            <Card className="p-6 rounded-2xl shadow-soft border-border/50">
              <h3 className="font-heading text-lg font-semibold mb-4">Recommended Reading</h3>
              <ul className="space-y-3">
                <li className="text-sm">
                  <span className="font-medium text-foreground">Atomic Habits</span>
                  <span className="text-muted-foreground"> — James Clear</span>
                </li>
                <li className="text-sm">
                  <span className="font-medium text-foreground">The Power of Habit</span>
                  <span className="text-muted-foreground"> — Charles Duhigg</span>
                </li>
                <li className="text-sm">
                  <span className="font-medium text-foreground">Tiny Habits</span>
                  <span className="text-muted-foreground"> — BJ Fogg</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationPage;
