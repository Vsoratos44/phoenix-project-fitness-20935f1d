import { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useMobilePlatform } from '@/hooks/useMobilePlatform';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings as SettingsIcon,
  Heart,
  Timer,
  Flame
} from 'lucide-react';

interface MobileWorkoutSessionProps {
  workout?: any;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
}

export const MobileWorkoutSession = ({ 
  workout, 
  onStart, 
  onPause, 
  onReset 
}: MobileWorkoutSessionProps) => {
  const { isNative, platform } = useMobilePlatform();
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);

  useEffect(() => {
    if (isNative) {
      Device.getInfo().then(setDeviceInfo);
    }
  }, [isNative]);

  const handleHapticFeedback = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (isNative) {
      await Haptics.impact({ style });
    }
  };

  const handleStart = async () => {
    await handleHapticFeedback(ImpactStyle.Heavy);
    setIsActive(true);
    onStart?.();
  };

  const handlePause = async () => {
    await handleHapticFeedback(ImpactStyle.Light);
    setIsActive(false);
    onPause?.();
  };

  const handleReset = async () => {
    await handleHapticFeedback(ImpactStyle.Medium);
    setIsActive(false);
    setWorkoutTime(0);
    onReset?.();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Mobile Device Info */}
      {isNative && deviceInfo && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Device Info</h3>
                <p className="text-xs text-muted-foreground">
                  {deviceInfo.model} • {platform.toUpperCase()}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                Native v1.0
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workout Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Timer className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-lg font-bold">{formatTime(workoutTime)}</div>
            <div className="text-xs text-muted-foreground">Duration</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
            <div className="text-lg font-bold">--</div>
            <div className="text-xs text-muted-foreground">Heart Rate</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <div className="text-lg font-bold">--</div>
            <div className="text-xs text-muted-foreground">Calories</div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Controls */}
      <div className="flex gap-3 justify-center">
        <Button
          size="lg"
          variant={isActive ? "secondary" : "default"}
          onClick={isActive ? handlePause : handleStart}
          className="flex-1 max-w-32"
        >
          {isActive ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          onClick={handleReset}
          className="px-6"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          className="px-6"
        >
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile-specific features notice */}
      {isNative && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-green-800 mb-2">Native Features Active</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Haptic feedback on interactions</li>
              <li>• Background workout tracking</li>
              <li>• Native fitness data integration</li>
              <li>• Optimized for {platform.toUpperCase()} devices</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};