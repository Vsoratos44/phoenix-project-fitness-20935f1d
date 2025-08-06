import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Watch, 
  Bluetooth, 
  Wifi, 
  Heart, 
  Activity, 
  Battery,
  Smartphone,
  Zap,
  TrendingUp,
  Settings,
  Sync,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  Gauge
} from "lucide-react";

interface WearableDevice {
  id: string;
  name: string;
  type: 'fitness_tracker' | 'smartwatch' | 'heart_rate_monitor' | 'smartphone';
  brand: string;
  model: string;
  isConnected: boolean;
  batteryLevel?: number;
  lastSync?: string;
  capabilities: string[];
}

interface BiometricReading {
  timestamp: string;
  heart_rate?: number;
  hrv?: number;
  calories?: number;
  steps?: number;
  active_minutes?: number;
  stress_level?: number;
  sleep_score?: number;
}

interface SyncSettings {
  auto_sync: boolean;
  sync_frequency: number; // minutes
  data_types: string[];
  workout_detection: boolean;
  heart_rate_zones: boolean;
}

export default function WearableIntegration() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [devices, setDevices] = useState<WearableDevice[]>([]);
  const [recentReadings, setRecentReadings] = useState<BiometricReading[]>([]);
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    auto_sync: true,
    sync_frequency: 15,
    data_types: ['heart_rate', 'hrv', 'calories', 'steps'],
    workout_detection: true,
    heart_rate_zones: true
  });
  const [isScanning, setIsScanning] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
    loadRecentBiometrics();
    setupAutoSync();
  }, []);

  const loadDevices = () => {
    // Simulate connected devices
    const mockDevices: WearableDevice[] = [
      {
        id: '1',
        name: 'Apple Watch Series 9',
        type: 'smartwatch',
        brand: 'Apple',
        model: 'Series 9',
        isConnected: true,
        batteryLevel: 85,
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        capabilities: ['heart_rate', 'hrv', 'calories', 'steps', 'workout_detection', 'gps']
      },
      {
        id: '2',
        name: 'Polar H10',
        type: 'heart_rate_monitor',
        brand: 'Polar',
        model: 'H10',
        isConnected: false,
        capabilities: ['heart_rate', 'hrv']
      },
      {
        id: '3',
        name: 'iPhone 15 Pro',
        type: 'smartphone',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        isConnected: true,
        batteryLevel: 67,
        lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        capabilities: ['steps', 'calories', 'workout_detection']
      }
    ];
    setDevices(mockDevices);
  };

  const loadRecentBiometrics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('biometric_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('source', 'wearable')
        .order('recorded_at', { ascending: false })
        .limit(24); // Last 24 readings

      if (error) throw error;

      const readings = (data || []).map(log => ({
        timestamp: log.recorded_at,
        heart_rate: log.resting_heart_rate,
        hrv: log.hrv_score,
        calories: Math.round(Math.random() * 500 + 1500), // Simulated
        steps: Math.round(Math.random() * 5000 + 5000), // Simulated
        active_minutes: Math.round(Math.random() * 60 + 30), // Simulated
        stress_level: log.stress_level,
        sleep_score: log.sleep_quality_score
      }));

      setRecentReadings(readings);
    } catch (error) {
      console.error('Error loading biometric data:', error);
    }
  };

  const setupAutoSync = () => {
    if (syncSettings.auto_sync) {
      const interval = setInterval(() => {
        syncAllDevices();
      }, syncSettings.sync_frequency * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  };

  const scanForDevices = async () => {
    setIsScanning(true);
    
    try {
      if ('bluetooth' in navigator) {
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [
            { services: ['heart_rate'] },
            { services: ['fitness_machine'] },
            { namePrefix: 'Polar' },
            { namePrefix: 'Garmin' }
          ],
          optionalServices: ['battery_service', 'device_information']
        });

        if (device) {
          const newDevice: WearableDevice = {
            id: device.id,
            name: device.name || 'Unknown Device',
            type: 'heart_rate_monitor',
            brand: 'Unknown',
            model: 'Unknown',
            isConnected: false,
            capabilities: ['heart_rate']
          };
          
          setDevices(prev => [...prev, newDevice]);
          
          toast({
            title: "🔍 Device Found",
            description: `Found ${device.name}. Click connect to pair.`
          });
        }
      } else {
        // Simulate finding devices
        setTimeout(() => {
          toast({
            title: "📱 Demo Mode",
            description: "Bluetooth scanning simulated. Real devices would appear here."
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Bluetooth scan error:', error);
      toast({
        title: "Scan Error",
        description: "Make sure Bluetooth is enabled and device is in pairing mode.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const connectDevice = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    try {
      // Simulate connection
      setDevices(prev => 
        prev.map(d => 
          d.id === deviceId 
            ? { ...d, isConnected: true, lastSync: new Date().toISOString() }
            : d
        )
      );

      // Start simulated data collection
      if (device.capabilities.includes('heart_rate')) {
        startHeartRateSimulation(deviceId);
      }

      toast({
        title: "✅ Device Connected",
        description: `${device.name} is now connected and syncing data.`
      });
    } catch (error) {
      console.error('Device connection error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to device.",
        variant: "destructive"
      });
    }
  };

  const disconnectDevice = (deviceId: string) => {
    setDevices(prev => 
      prev.map(d => 
        d.id === deviceId 
          ? { ...d, isConnected: false }
          : d
      )
    );

    toast({
      title: "Device Disconnected",
      description: "Device has been disconnected."
    });
  };

  const startHeartRateSimulation = (deviceId: string) => {
    const interval = setInterval(() => {
      if (!devices.find(d => d.id === deviceId)?.isConnected) {
        clearInterval(interval);
        return;
      }

      const reading: BiometricReading = {
        timestamp: new Date().toISOString(),
        heart_rate: Math.floor(Math.random() * 40 + 60), // 60-100 bpm
        hrv: Math.floor(Math.random() * 50 + 25), // 25-75 ms
        calories: Math.floor(Math.random() * 10 + 5), // 5-15 per minute
        steps: Math.floor(Math.random() * 3), // 0-3 per minute
        active_minutes: Math.random() > 0.8 ? 1 : 0
      };

      setRecentReadings(prev => [reading, ...prev.slice(0, 23)]);
      saveBiometricReading(reading);
    }, 60000); // Every minute
  };

  const saveBiometricReading = async (reading: BiometricReading) => {
    if (!user) return;

    try {
      await supabase
        .from('biometric_logs')
        .insert({
          user_id: user.id,
          resting_heart_rate: reading.heart_rate,
          hrv_score: reading.hrv,
          recorded_at: reading.timestamp,
          source: 'wearable'
        });
    } catch (error) {
      console.error('Error saving biometric reading:', error);
    }
  };

  const syncAllDevices = async () => {
    const connectedDevices = devices.filter(d => d.isConnected);
    
    for (const device of connectedDevices) {
      setDevices(prev => 
        prev.map(d => 
          d.id === device.id 
            ? { ...d, lastSync: new Date().toISOString() }
            : d
        )
      );
    }

    setLastSyncTime(new Date().toISOString());
    
    if (connectedDevices.length > 0) {
      toast({
        title: "🔄 Sync Complete",
        description: `Synced data from ${connectedDevices.length} device(s).`
      });
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartwatch': return <Watch className="h-5 w-5" />;
      case 'heart_rate_monitor': return <Heart className="h-5 w-5" />;
      case 'fitness_tracker': return <Activity className="h-5 w-5" />;
      case 'smartphone': return <Smartphone className="h-5 w-5" />;
      default: return <Watch className="h-5 w-5" />;
    }
  };

  const getLatestReading = (type: string) => {
    const latest = recentReadings[0];
    if (!latest) return 'No data';
    
    switch (type) {
      case 'heart_rate': return `${latest.heart_rate || '--'} bpm`;
      case 'hrv': return `${latest.hrv || '--'} ms`;
      case 'calories': return `${latest.calories || '--'} cal`;
      case 'steps': return `${latest.steps || '--'} steps`;
      default: return 'No data';
    }
  };

  const formatLastSync = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wearable Integration</h1>
          <p className="text-muted-foreground">
            Connect and sync data from your fitness devices
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={syncAllDevices} variant="outline">
            <Sync className="mr-2 h-4 w-4" />
            Sync All
          </Button>
          <Button onClick={scanForDevices} disabled={isScanning}>
            {isScanning ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
            ) : (
              <Bluetooth className="mr-2 h-4 w-4" />
            )}
            Scan Devices
          </Button>
        </div>
      </div>

      {/* Connected Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Watch className="h-5 w-5" />
            Connected Devices
          </CardTitle>
          <CardDescription>
            Manage your connected fitness devices and sensors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {devices.map((device) => (
            <Card key={device.id} className={device.isConnected ? "border-green-200 bg-green-50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device.type)}
                    <div>
                      <h4 className="font-semibold">{device.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {device.brand} {device.model}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {device.isConnected && device.batteryLevel && (
                      <div className="flex items-center gap-1 text-sm">
                        <Battery className="h-4 w-4" />
                        <span>{device.batteryLevel}%</span>
                      </div>
                    )}
                    
                    <Badge variant={device.isConnected ? "default" : "outline"}>
                      {device.isConnected ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Connected
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Disconnected
                        </>
                      )}
                    </Badge>
                    
                    {device.isConnected ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => disconnectDevice(device.id)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => connectDevice(device.id)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
                
                {device.isConnected && (
                  <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Last sync: {formatLastSync(device.lastSync)}</span>
                    <div className="flex gap-2">
                      {device.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline" className="text-xs">
                          {capability.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {devices.length === 0 && (
            <div className="text-center py-8">
              <Watch className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">No Devices Connected</h3>
              <p className="text-muted-foreground mb-4">
                Scan for nearby devices to start collecting biometric data
              </p>
              <Button onClick={scanForDevices}>
                <Bluetooth className="mr-2 h-4 w-4" />
                Scan for Devices
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Data Dashboard */}
      {recentReadings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Real-time Biometrics
            </CardTitle>
            <CardDescription>
              Live data from your connected devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{recentReadings[0]?.heart_rate || '--'}</p>
                  <p className="text-xs text-muted-foreground">Heart Rate (BPM)</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{recentReadings[0]?.hrv || '--'}</p>
                  <p className="text-xs text-muted-foreground">HRV (ms)</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{recentReadings[0]?.calories || '--'}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{recentReadings[0]?.steps || '--'}</p>
                  <p className="text-xs text-muted-foreground">Steps</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sync Settings
          </CardTitle>
          <CardDescription>
            Configure how your devices sync data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto Sync</h4>
              <p className="text-sm text-muted-foreground">
                Automatically sync data from connected devices
              </p>
            </div>
            <Switch
              checked={syncSettings.auto_sync}
              onCheckedChange={(checked) => 
                setSyncSettings(prev => ({ ...prev, auto_sync: checked }))
              }
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Sync Frequency</h4>
              <span className="text-sm text-muted-foreground">
                {syncSettings.sync_frequency} minutes
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={syncSettings.sync_frequency}
              onChange={(e) => 
                setSyncSettings(prev => ({ 
                  ...prev, 
                  sync_frequency: parseInt(e.target.value) 
                }))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Workout Detection</h4>
              <p className="text-sm text-muted-foreground">
                Automatically detect and track workouts
              </p>
            </div>
            <Switch
              checked={syncSettings.workout_detection}
              onCheckedChange={(checked) => 
                setSyncSettings(prev => ({ ...prev, workout_detection: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Heart Rate Zones</h4>
              <p className="text-sm text-muted-foreground">
                Use heart rate zones for training intensity
              </p>
            </div>
            <Switch
              checked={syncSettings.heart_rate_zones}
              onCheckedChange={(checked) => 
                setSyncSettings(prev => ({ ...prev, heart_rate_zones: checked }))
              }
            />
          </div>
          
          {lastSyncTime && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last sync: {formatLastSync(lastSyncTime)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}