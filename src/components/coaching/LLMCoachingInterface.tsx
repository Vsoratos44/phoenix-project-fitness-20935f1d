import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  MessageSquare, 
  Send, 
  Brain, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Bot,
  User,
  Target,
  Flame,
  Heart,
  Zap,
  Clock,
  CheckCircle2
} from "lucide-react";

interface CoachingMessage {
  id: string;
  type: 'user' | 'coach';
  content: string;
  timestamp: Date;
  context?: {
    exercise?: string;
    set?: number;
    rpe?: number;
    messageType?: 'motivation' | 'form_cue' | 'progression' | 'safety' | 'general';
  };
}

interface CoachingContext {
  currentExercise?: any;
  sessionData?: any;
  userProfile?: any;
  currentSet?: number;
  currentRPE?: number;
  sessionProgress?: number;
}

interface LLMCoachingInterfaceProps {
  context: CoachingContext;
  onCoachingAction?: (action: string, data: any) => void;
}

export default function LLMCoachingInterface({ context, onCoachingAction }: LLMCoachingInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<CoachingMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [coachPersonality, setCoachPersonality] = useState<'encouraging' | 'challenging' | 'analytical'>('encouraging');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (context.sessionData && messages.length === 0) {
      const welcomeMessage: CoachingMessage = {
        id: `welcome_${Date.now()}`,
        type: 'coach',
        content: `Hey champion! I'm Phoenix, your AI coaching companion. I'm here to guide you through "${context.sessionData.name}" today. Ready to unlock your potential? Let's make every rep count! 🔥`,
        timestamp: new Date(),
        context: { messageType: 'motivation' }
      };
      setMessages([welcomeMessage]);
    }
  }, [context.sessionData]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Couldn't hear you clearly. Try typing instead.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  // Generate contextual coaching based on exercise progress
  useEffect(() => {
    if (context.currentExercise && context.currentSet) {
      generateContextualCoaching();
    }
  }, [context.currentExercise, context.currentSet]);

  const generateContextualCoaching = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('phoenix-workout-engine', {
        body: {
          action: 'generate_coaching',
          context: {
            exercise: context.currentExercise,
            set: context.currentSet,
            rpe: context.currentRPE,
            sessionProgress: context.sessionProgress,
            userProfile: context.userProfile,
            personality: coachPersonality
          }
        }
      });

      if (error) throw error;

      if (data.coaching_message) {
        const coachingMessage: CoachingMessage = {
          id: `coaching_${Date.now()}`,
          type: 'coach',
          content: data.coaching_message,
          timestamp: new Date(),
          context: {
            exercise: context.currentExercise?.name,
            set: context.currentSet,
            messageType: data.message_type || 'general'
          }
        };

        setMessages(prev => [...prev, coachingMessage]);

        // Speak the message if speech is enabled
        if (isSpeechEnabled && data.coaching_message) {
          speakMessage(data.coaching_message);
        }
      }
    } catch (error) {
      console.error('Error generating contextual coaching:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: CoachingMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Send to Phoenix LLM for coaching response
      const { data, error } = await supabase.functions.invoke('phoenix-workout-engine', {
        body: {
          action: 'chat_coaching',
          userMessage: inputMessage,
          context: {
            exercise: context.currentExercise,
            sessionData: context.sessionData,
            userProfile: context.userProfile,
            currentSet: context.currentSet,
            currentRPE: context.currentRPE,
            sessionProgress: context.sessionProgress,
            personality: coachPersonality,
            messageHistory: messages.slice(-5) // Last 5 messages for context
          }
        }
      });

      if (error) throw error;

      const coachResponse: CoachingMessage = {
        id: `coach_${Date.now()}`,
        type: 'coach',
        content: data.response,
        timestamp: new Date(),
        context: {
          messageType: data.message_type || 'general'
        }
      };

      setMessages(prev => [...prev, coachResponse]);

      // Handle any coaching actions (e.g., modify exercise, rest timer, etc.)
      if (data.action && onCoachingAction) {
        onCoachingAction(data.action, data.actionData);
      }

      // Speak response if enabled
      if (isSpeechEnabled && data.response) {
        speakMessage(data.response);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Coaching Error",
        description: "Phoenix couldn't respond. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Try to use a more natural voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') && voice.lang.includes('en')
      ) || voices.find(voice => voice.lang.includes('en')) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  const getMessageIcon = (messageType?: string) => {
    switch (messageType) {
      case 'motivation': return <Flame className="h-4 w-4 text-orange-500" />;
      case 'form_cue': return <Target className="h-4 w-4 text-blue-500" />;
      case 'progression': return <Zap className="h-4 w-4 text-purple-500" />;
      case 'safety': return <CheckCircle2 className="h-4 w-4 text-red-500" />;
      default: return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  const quickPrompts = [
    { text: "How's my form?", icon: Target },
    { text: "I'm feeling tired", icon: Heart },
    { text: "This feels too easy", icon: Zap },
    { text: "I need motivation", icon: Flame },
    { text: "Should I increase weight?", icon: Clock }
  ];

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-orange-600" />
              Phoenix Coach
              <Badge variant="secondary" className="ml-2">Live</Badge>
            </CardTitle>
            <CardDescription>
              Your AI coaching companion for real-time guidance
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
            >
              {isSpeechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <select
              value={coachPersonality}
              onChange={(e) => setCoachPersonality(e.target.value as any)}
              className="px-2 py-1 text-sm border border-input rounded bg-background"
            >
              <option value="encouraging">Encouraging</option>
              <option value="challenging">Challenging</option>
              <option value="analytical">Analytical</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'coach' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[75%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  {message.type === 'coach' && message.context?.messageType && (
                    <div className="flex-shrink-0 mt-0.5">
                      {getMessageIcon(message.context.messageType)}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                
                <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                  <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {message.context?.exercise && (
                    <>
                      <span>•</span>
                      <span>{message.context.exercise}</span>
                    </>
                  )}
                  {message.context?.set && (
                    <>
                      <span>•</span>
                      <span>Set {message.context.set}</span>
                    </>
                  )}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="max-w-[75%] p-3 rounded-lg bg-muted">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInputMessage(prompt.text)}
                className="text-xs"
              >
                <prompt.icon className="mr-1 h-3 w-3" />
                {prompt.text}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Ask Phoenix anything..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isLoading}
            />
            {recognitionRef.current && (
              <Button
                variant="ghost"
                size="sm"
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                  isListening ? 'text-red-500' : 'text-muted-foreground'
                }`}
                onClick={startListening}
                disabled={isListening || isLoading}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}