import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Volume2, VolumeX, Brain, MessageCircle, Mic, Trophy, Target, Activity } from "lucide-react";

interface CoachingMessage {
  id: string;
  type: 'form_feedback' | 'motivation' | 'technical' | 'adaptation' | 'celebration';
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  exercise_context?: string;
}

interface PhoenixAICoachProps {
  currentExercise?: any;
  currentSet?: number;
  isResting?: boolean;
  userLevel?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  onCoachingToggle?: (enabled: boolean) => void;
  realTimeBiometrics?: any;
}

export default function PhoenixAICoach({ 
  currentExercise, 
  currentSet = 1,
  isResting = false,
  userLevel = 'intermediate',
  onCoachingToggle,
  realTimeBiometrics
}: PhoenixAICoachProps) {
  const { toast } = useToast();
  const [isCoachingEnabled, setIsCoachingEnabled] = useState(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState<CoachingMessage[]>([]);
  const speechSynthesis = useRef<any>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis;
    }
    
    // Initial welcome message
    if (isCoachingEnabled) {
      addCoachingMessage('motivation', 
        `Welcome to your Phoenix session! I'm your AI coach and I'll guide you through every rep. ${userLevel === 'advanced' || userLevel === 'elite' ? 'You can toggle me off anytime in settings.' : "Let's unlock your potential together!"}`,
        'high'
      );
    }
  }, []);

  useEffect(() => {
    // Provide exercise-specific coaching when exercise changes
    if (currentExercise && isCoachingEnabled) {
      generateExerciseCoaching();
    }
  }, [currentExercise, currentSet]);

  useEffect(() => {
    // React to biometric changes
    if (realTimeBiometrics?.heart_rate && isCoachingEnabled) {
      generateBiometricCoaching();
    }
  }, [realTimeBiometrics]);

  const addCoachingMessage = (type: CoachingMessage['type'], message: string, priority: CoachingMessage['priority'] = 'medium') => {
    const newMessage: CoachingMessage = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      priority,
      exercise_context: currentExercise?.name
    };
    
    setMessages(prev => [...prev, newMessage].slice(-8)); // Keep last 8 messages
    
    // Speak high priority messages or when voice is enabled
    if ((priority === 'high' || priority === 'critical') && isVoiceEnabled && isCoachingEnabled) {
      speakMessage(message);
    }
  };

  const speakMessage = (message: string) => {
    if (!speechSynthesis.current || !isVoiceEnabled) return;
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.7;
    
    // Select a professional voice
    const voices = speechSynthesis.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Alex') || 
      voice.name.includes('Daniel') || 
      voice.name.includes('Samantha') ||
      voice.lang.includes('en-US')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    speechSynthesis.current.speak(utterance);
  };

  const generateExerciseCoaching = () => {
    if (!currentExercise) return;

    const exerciseCoaching = {
      'Barbell Bench Press': [
        "Keep your core tight and maintain that arch",
        "Control the descent, explode up",
        "Drive through your heels, chest up",
        "Perfect! Feel that chest activation"
      ],
      'Squats': [
        "Depth is looking good, drive through those heels",
        "Keep that chest proud, core engaged",
        "Perfect hip hinge pattern",
        "Excellent form! You're moving like an athlete"
      ],
      'Deadlift': [
        "Engage those lats, bar stays close",
        "Drive the floor away with your feet",
        "Hip hinge is textbook perfect",
        "Lock it out strong! Chest up, shoulders back"
      ],
      'Pull-ups': [
        "Full range of motion, control the negative",
        "Engage those lats, think elbows to hips",
        "Strong! Feel that back working",
        "Powerful pull! Your strength is showing"
      ]
    };

    const generalCoaching = [
      "Focus on the mind-muscle connection here",
      "This is where champions are made",
      "Feel that target muscle working",
      "Your form is dialed in perfectly",
      "Every rep counts - make it matter",
      "Smooth and controlled movement"
    ];

    const coaching = exerciseCoaching[currentExercise.name] || generalCoaching;
    const randomCoaching = coaching[Math.floor(Math.random() * coaching.length)];
    
    addCoachingMessage('technical', randomCoaching, 'medium');

    // Set-specific coaching
    if (currentSet === 1) {
      addCoachingMessage('motivation', "First set! Set the tone for the entire workout", 'low');
    } else if (currentSet >= (currentExercise.sets - 1)) {
      addCoachingMessage('motivation', "Final set! Leave everything on the platform", 'high');
    }
  };

  const generateBiometricCoaching = () => {
    const hr = realTimeBiometrics.heart_rate;
    
    if (hr > 180) {
      addCoachingMessage('adaptation', "Heart rate is elevated. Focus on your breathing between sets", 'high');
    } else if (hr > 160 && !isResting) {
      addCoachingMessage('technical', "Great intensity! Maintain this effort", 'medium');
    } else if (hr < 120 && !isResting) {
      addCoachingMessage('motivation', "Push the pace! You've got more in the tank", 'medium');
    }
  };

  const generateRestCoaching = () => {
    const restMessages = [
      "Use this time to visualize your next set",
      "Deep breaths - let that heart rate settle",
      "Hydrate and prepare mentally",
      "Feel your muscles recovering",
      "Next set is going to be even better",
      "Stay focused, you're doing amazing"
    ];
    
    const message = restMessages[Math.floor(Math.random() * restMessages.length)];
    addCoachingMessage('motivation', message, 'low');
  };

  const toggleCoaching = (enabled: boolean) => {
    setIsCoachingEnabled(enabled);
    onCoachingToggle?.(enabled);
    
    if (enabled) {
      addCoachingMessage('motivation', "I'm back! Ready to help you dominate this workout", 'medium');
    } else {
      // Stop any current speech
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel();
      }
    }
  };

  const getMessageIcon = (type: CoachingMessage['type']) => {
    switch (type) {
      case 'form_feedback':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'motivation':
        return <Trophy className="h-4 w-4 text-orange-500" />;
      case 'technical':
        return <Brain className="h-4 w-4 text-purple-500" />;
      case 'adaptation':
        return <MessageCircle className="h-4 w-4 text-yellow-500" />;
      case 'celebration':
        return <Trophy className="h-4 w-4 text-green-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: CoachingMessage['priority']) => {
    const variants = {
      low: "bg-gray-100 text-gray-600",
      medium: "bg-blue-100 text-blue-600", 
      high: "bg-orange-100 text-orange-600",
      critical: "bg-red-100 text-red-600"
    };
    
    return <Badge className={variants[priority]}>{priority}</Badge>;
  };

  if (!isCoachingEnabled) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-500">
              <Brain className="h-5 w-5" />
              AI Coach (Disabled)
            </CardTitle>
            <Switch
              checked={isCoachingEnabled}
              onCheckedChange={toggleCoaching}
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            AI coaching is disabled. Toggle on to receive real-time guidance and motivation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Brain className="h-5 w-5" />
            Phoenix AI Coach
            <Badge variant="secondary" className="bg-orange-100 text-orange-600">
              Live
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className="text-orange-600"
            >
              {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Switch
              checked={isCoachingEnabled}
              onCheckedChange={toggleCoaching}
            />
          </div>
        </div>
        <CardDescription className="text-orange-600">
          {userLevel === 'advanced' || userLevel === 'elite' 
            ? "World-class coaching at your fingertips - toggle off anytime"
            : "Real-time form feedback and motivation"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live coaching controls */}
        <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Label htmlFor="voice-coaching">Voice Coaching</Label>
            <Badge variant={isVoiceEnabled ? "default" : "outline"}>
              {isVoiceEnabled ? "On" : "Off"}
            </Badge>
          </div>
          <Switch
            id="voice-coaching"
            checked={isVoiceEnabled}
            onCheckedChange={setIsVoiceEnabled}
          />
        </div>

        {/* Real-time coaching messages */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {messages.slice(-5).map((message) => (
            <div 
              key={message.id} 
              className="p-3 bg-white/70 rounded-lg border border-orange-100"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  {getMessageIcon(message.type)}
                  <span className="text-xs font-medium text-orange-700">
                    {message.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                {getPriorityBadge(message.priority)}
              </div>
              <p className="text-sm text-orange-800 leading-relaxed">
                {message.message}
              </p>
              <p className="text-xs text-orange-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
                {message.exercise_context && ` • ${message.exercise_context}`}
              </p>
            </div>
          ))}
        </div>

        {/* Current status */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Current Focus</span>
          </div>
          <p className="text-sm text-blue-700">
            {isResting 
              ? "Recovery phase - preparing for next set" 
              : currentExercise 
                ? `${currentExercise.name} - Set ${currentSet}/${currentExercise.sets}`
                : "Ready for next exercise"
            }
          </p>
        </div>

        {/* Quick actions for rest periods */}
        {isResting && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={generateRestCoaching}
              className="text-orange-600 border-orange-200"
            >
              <Mic className="h-3 w-3 mr-1" />
              Rest Tip
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}