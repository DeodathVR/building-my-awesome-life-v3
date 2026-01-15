import React from 'react';
import { BookOpen, Lightbulb, Zap, Target, Clock, Layers, Play } from 'lucide-react';
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
    title: 'Why Flower Observation Works',
    content: 'Slow, natural visuals like a flower blooming train your attention span by giving your brain a gentle anchor. Unlike fast-moving content, these exercises strengthen your ability to sustain focus without overstimulation.'
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

const EducationPage = () => {
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
              <h3 className="font-heading text-xl font-semibold mb-4">Track & Reflect with Voice</h3>
              <p className="text-muted-foreground mb-4">
                Use our voice logging feature to quickly mark habits as done without breaking your flow. 
                Simply say "I completed my meditation" or "Log workout done" to update your progress instantly.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-background rounded-full text-sm border">"Log meditation done"</span>
                <span className="px-3 py-1 bg-background rounded-full text-sm border">"I finished reading"</span>
                <span className="px-3 py-1 bg-background rounded-full text-sm border">"Add habit: Exercise"</span>
              </div>
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

            {/* Video Placeholder */}
            <Card className="rounded-2xl shadow-soft border-border/50 overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <Play className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Educational Video</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-medium text-sm">Building Habits That Stick</h4>
                <p className="text-xs text-muted-foreground mt-1">5 min • Atomic Habits Summary</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationPage;
