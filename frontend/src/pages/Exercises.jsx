import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flower2, Circle, Flame, Wind } from 'lucide-react';

const exercises = [
    {
        id: 'flower-observation',
        title: 'Flower Observation',
        description: 'Watch a beautiful lotus flower bloom slowly, petal by petal. Perfect for deep focus training.',
        icon: Flower2,
        color: 'primary',
        duration: '5 min',
        instructions: 'Sit comfortably, breathe deeply, and focus solely on the flower\'s petals unfolding. If your mind wanders, gently return your attention to the bloom.'
    },
    {
        id: 'expanding-circle',
        title: 'Circle Concentration',
        description: 'Gaze softly at a gentle, glowing circle. Its subtle presence brings calm and stillness to a busy mind.',
        icon: Circle,
        color: 'secondary',
        duration: '3-5 min',
        instructions: 'Rest your gaze on the circle\'s center. Let its soft glow fill your awareness. When thoughts arise, simply return to the circle. Allow the calm to settle in naturally.'
    },
    {
        id: 'candle-flame',
        title: 'Candle Flame Flicker',
        description: 'Gaze at a simulated candle flame as it dances gently, bringing warmth and calm to your practice.',
        icon: Flame,
        color: 'accent',
        duration: '3-7 min',
        instructions: 'Fix your gaze on the flame\'s tip. Notice its gentle movements without trying to control them. Let your thoughts settle like the steady flame.'
    },
    {
        id: 'breath-counter',
        title: 'Breath Counter',
        description: 'A simple guided breathing exercise with visual cues to help you maintain a steady, calming rhythm.',
        icon: Wind,
        color: 'primary',
        duration: '2-10 min',
        instructions: 'Follow the visual breathing prompts. Inhale when the circle expands, exhale when it contracts. Count each complete breath cycle.'
    }
];

export const Exercises = () => {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6 sm:px-8 lg:px-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light text-foreground mb-6 animate-fade-in">
                        Concentration Exercises
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        Choose a practice that resonates with you. Each exercise is designed to gently guide your attention and deepen your focus.
                    </p>
                </div>
                
                {/* Exercise Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {exercises.map((exercise, index) => {
                        const Icon = exercise.icon;
                        return (
                            <Card 
                                key={exercise.id} 
                                className="p-8 bg-card border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                data-testid={`exercise-card-${exercise.id}`}
                            >
                                {/* Icon */}
                                <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary/10`}>
                                    <Icon className={`w-8 h-8 text-primary`} />
                                </div>
                                
                                {/* Content */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-2xl font-serif font-medium text-foreground">
                                            {exercise.title}
                                        </h3>
                                        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                            {exercise.duration}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        {exercise.description}
                                    </p>
                                    <p className="text-sm text-muted-foreground/80 leading-relaxed italic">
                                        {exercise.instructions}
                                    </p>
                                </div>
                                
                                {/* CTA */}
                                <Link to={`/exercise/${exercise.id}`}>
                                    <Button 
                                        className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:shadow-lg"
                                        data-testid={`start-${exercise.id}`}
                                    >
                                        Start Practice
                                    </Button>
                                </Link>
                            </Card>
                        );
                    })}
                </div>
                
                {/* Bottom Guidance */}
                <div className="mt-16 text-center">
                    <Card className="p-8 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-border">
                        <h3 className="text-xl font-serif font-medium text-foreground mb-3">
                            Tips for Effective Practice
                        </h3>
                        <ul className="text-muted-foreground space-y-2 max-w-2xl mx-auto text-left">
                            <li className="flex items-start gap-3">
                                <span className="text-primary mt-1">•</span>
                                <span>Find a quiet space where you won't be disturbed</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-primary mt-1">•</span>
                                <span>Sit comfortably with your back straight and shoulders relaxed</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-primary mt-1">•</span>
                                <span>Start with shorter sessions (2-3 minutes) and gradually increase duration</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-primary mt-1">•</span>
                                <span>When your mind wanders, gently return your focus without judgment</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-primary mt-1">•</span>
                                <span>Practice consistently for best results—even 3 minutes daily makes a difference</span>
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Exercises;
