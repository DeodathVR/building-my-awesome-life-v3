import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Mic, MicOff, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { useApp } from '../context/AppContext';
import useVoiceRecognition from '../hooks/useVoiceRecognition';
import { toast } from 'sonner';

const suggestedQuestions = [
  "How can I build a morning routine?",
  "Suggest habits for better focus",
  "Tips for maintaining streaks",
  "How to stay motivated?",
  "What habits help reduce stress?"
];

const AICoachPage = () => {
  const { chatWithCoach, habits } = useApp();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your AI habit coach. I can see you have ${habits.length} habits tracked. How can I help you build your awesome life today?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { 
    isListening, 
    transcript, 
    error, 
    isSupported, 
    startListening, 
    stopListening,
    resetTranscript 
  } = useVoiceRecognition();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript && !isListening) {
      setInputValue(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

  const handleSend = async (text = inputValue) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatWithCoach(text.trim(), sessionId);
      setSessionId(response.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch (err) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    }
    
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen pb-32 md:pb-8 px-6 py-8" data-testid="ai-coach-page">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
            AI Habit Coach
          </h1>
          <p className="text-muted-foreground">
            Get personalized advice powered by Gemini AI
          </p>
        </div>

        {/* Chat Container */}
        <Card className="rounded-2xl shadow-float border-border/50 overflow-hidden">
          {/* Messages Area */}
          <ScrollArea className="h-[400px] md:h-[500px] p-6">
            <div className="space-y-6">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  data-testid={`chat-message-${idx}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-primary' 
                      : 'bg-secondary'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Bot className="w-4 h-4 text-secondary-foreground" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[80%] px-4 py-3 ${
                      message.role === 'user'
                        ? 'chat-message-user'
                        : 'chat-message-ai'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div className="chat-message-ai px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          {messages.length <= 2 && (
            <div className="px-6 py-4 border-t border-border/50 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(question)}
                    className="px-3 py-1.5 text-sm bg-background border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
                    data-testid={`suggested-question-${idx}`}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-border/50 bg-card">
            {error && (
              <p className="text-sm text-destructive mb-2 px-2">{error}</p>
            )}
            <div className="flex gap-3">
              {isSupported && (
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleVoice}
                  className="rounded-xl flex-shrink-0"
                  data-testid="coach-voice-button"
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </Button>
              )}
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Ask your coach anything..."}
                className="rounded-xl"
                disabled={isLoading}
                data-testid="coach-input"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                className="rounded-xl px-6"
                data-testid="coach-send-button"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Card className="p-5 rounded-2xl shadow-soft border-border/50">
            <h3 className="font-heading font-semibold mb-2">Personalized Advice</h3>
            <p className="text-sm text-muted-foreground">
              Your coach knows about your habits and streaks, providing context-aware suggestions.
            </p>
          </Card>
          <Card className="p-5 rounded-2xl shadow-soft border-border/50">
            <h3 className="font-heading font-semibold mb-2">Voice Enabled</h3>
            <p className="text-sm text-muted-foreground">
              Use the microphone to speak your questions instead of typing.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AICoachPage;
