import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, X, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useApp } from '../context/AppContext';
import useVoiceRecognition from '../hooks/useVoiceRecognition';
import { toast } from 'sonner';

const VoiceCommandCenter = () => {
  const { habits, createHabit, logHabit, chatWithCoach } = useApp();
  const { 
    isListening, 
    transcript, 
    error, 
    isSupported, 
    startListening, 
    stopListening,
    resetTranscript 
  } = useVoiceRecognition();

  const [feedback, setFeedback] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Process voice commands
  const processCommand = useCallback(async (text) => {
    const lowerText = text.toLowerCase().trim();
    setProcessing(true);
    setFeedback('Processing...');

    try {
      // Log habit completion patterns
      const logPatterns = [
        /(?:i\s+)?(?:completed?|done|finished|did)\s+(?:my\s+)?(.+)/i,
        /(?:log|mark)\s+(.+?)\s+(?:as\s+)?(?:done|completed?|finished)/i,
        /(.+?)\s+(?:is\s+)?(?:done|completed?|finished)/i
      ];

      for (const pattern of logPatterns) {
        const match = lowerText.match(pattern);
        if (match) {
          const habitName = match[1].trim();
          const habit = habits.find(h => 
            h.name.toLowerCase().includes(habitName) || 
            habitName.includes(h.name.toLowerCase())
          );
          
          if (habit) {
            await logHabit(habit.id, true);
            setFeedback(`Logged! "${habit.name}" marked as done. Great job!`);
            toast.success(`${habit.name} completed!`, {
              description: `Current streak: ${habit.streak + 1} days`
            });
            setProcessing(false);
            return;
          }
        }
      }

      // Add new habit patterns
      const addPatterns = [
        /(?:add|create|new)\s+habit[:\s]+(.+)/i,
        /(?:add|create)\s+(.+?)\s+(?:as\s+a\s+)?habit/i
      ];

      for (const pattern of addPatterns) {
        const match = lowerText.match(pattern);
        if (match) {
          const habitName = match[1].trim();
          await createHabit({ name: habitName, description: 'Created via voice command', frequency: 'daily' });
          setFeedback(`Added! New habit "${habitName}" created.`);
          toast.success('Habit created!', { description: habitName });
          setProcessing(false);
          return;
        }
      }

      // AI Coach query patterns
      const coachPatterns = [
        /(?:how\s+(?:do\s+i|can\s+i|to))\s+(.+)/i,
        /(?:what|why|when|where|suggest|help|advice|tips?)\s+(.+)/i,
        /(?:coach|ai|assistant)[,:\s]+(.+)/i
      ];

      for (const pattern of coachPatterns) {
        const match = lowerText.match(pattern);
        if (match || lowerText.includes('motivation') || lowerText.includes('habit')) {
          const response = await chatWithCoach(text);
          setFeedback(response.response);
          toast.info('AI Coach', { description: response.response.substring(0, 100) + '...' });
          setProcessing(false);
          return;
        }
      }

      // Default: Try to match any habit name
      const habit = habits.find(h => lowerText.includes(h.name.toLowerCase()));
      if (habit) {
        await logHabit(habit.id, true);
        setFeedback(`Logged! "${habit.name}" marked as done.`);
        toast.success(`${habit.name} completed!`);
        setProcessing(false);
        return;
      }

      setFeedback("I didn't understand that. Try 'Log meditation done' or 'Add habit: Exercise'");
    } catch (err) {
      setFeedback('Sorry, something went wrong. Please try again.');
      console.error('Voice command error:', err);
    }
    
    setProcessing(false);
  }, [habits, logHabit, createHabit, chatWithCoach]);

  // Handle transcript changes
  useEffect(() => {
    if (transcript && !isListening && !processing) {
      processCommand(transcript);
    }
  }, [transcript, isListening, processing, processCommand]);

  // Clear feedback after delay
  useEffect(() => {
    if (feedback && !processing) {
      const timer = setTimeout(() => {
        setFeedback('');
        resetTranscript();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback, processing, resetTranscript]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setFeedback('Listening...');
      startListening();
    }
  };

  return (
    <>
      {/* Floating Voice Button */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end gap-3">
        {/* Help Button */}
        <Dialog open={showHelp} onOpenChange={setShowHelp}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="w-10 h-10 rounded-full shadow-soft"
              data-testid="voice-help-button"
            >
              <HelpCircle className="w-5 h-5" strokeWidth={1.5} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" data-testid="voice-help-dialog">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Voice Commands</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Log Habits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>"I completed my meditation"</li>
                  <li>"Log workout done"</li>
                  <li>"Reading is finished"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Add Habits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>"Add habit: Morning stretches"</li>
                  <li>"Create new habit drink water"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Ask AI Coach</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>"How to stay motivated?"</li>
                  <li>"Suggest habits for better focus"</li>
                  <li>"Tips for building routines"</li>
                </ul>
              </div>
              {!isSupported && (
                <div className="p-3 bg-accent/20 rounded-xl text-sm">
                  <p className="font-medium text-accent-foreground">Browser Notice</p>
                  <p className="text-muted-foreground mt-1">
                    Voice commands work best in Chrome or Edge. For other browsers, use text input.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Main Voice Button */}
        <button
          onClick={handleMicClick}
          disabled={!isSupported}
          data-testid="voice-command-button"
          className={`
            w-14 h-14 rounded-full flex items-center justify-center
            transition-all duration-300 transform hover:scale-105
            ${isListening 
              ? 'bg-destructive text-destructive-foreground voice-pulse listening' 
              : 'bg-primary text-primary-foreground voice-pulse shadow-hover'
            }
            ${!isSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" strokeWidth={1.5} />
          ) : (
            <Mic className="w-6 h-6" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Feedback Toast */}
      {(feedback || error || (isListening && transcript)) && (
        <div 
          className="voice-feedback animate-slide-up"
          data-testid="voice-feedback"
        >
          <div className="glass px-6 py-4 rounded-2xl shadow-float max-w-sm mx-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                error ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'
              }`}>
                {isListening ? (
                  <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {isListening && transcript && (
                  <p className="text-sm text-muted-foreground italic mb-1">"{transcript}"</p>
                )}
                <p className="text-sm font-medium">{error || feedback}</p>
              </div>
              <button 
                onClick={() => { setFeedback(''); resetTranscript(); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceCommandCenter;
