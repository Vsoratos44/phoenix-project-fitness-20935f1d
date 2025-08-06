import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Activity, Moon, Brain, Save } from "lucide-react";

interface BiometricData {
  weight_kg?: number;
  resting_heart_rate?: number;
  sleep_hours?: number;
  sleep_quality?: number;
  stress_level?: number;
  energy_level?: number;
  mood?: number;
  notes?: string;
}

export default function BiometricDataCollection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BiometricData>({});

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('biometric_logs')
        .insert({
          user_id: user.id,
          ...data,
          recorded_at: new Date().toISOString()
        });

      if (error) throw error;

      // Create event for Phoenix Score recalculation
      await supabase
        .from('events')
        .insert({
          user_id: user.id,
          event_type: 'biometric_data_updated',
          event_data: data as any
        });

      toast({
        title: "Biometric Data Saved!",
        description: "Your data has been recorded and will update your Phoenix Score."
      });

      setData({});
    } catch (error) {
      console.error('Error saving biometric data:', error);
      toast({
        title: "Error",
        description: "Failed to save biometric data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Daily Check-in</h2>
        <p className="text-muted-foreground">Track your key health metrics to optimize your Phoenix Score</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Physical Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Physical Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={data.weight_kg || ''}
                onChange={(e) => setData(prev => ({ ...prev, weight_kg: parseFloat(e.target.value) || undefined }))}
                placeholder="70.5"
              />
            </div>
            
            <div>
              <Label htmlFor="rhr">Resting Heart Rate (bpm)</Label>
              <Input
                id="rhr"
                type="number"
                value={data.resting_heart_rate || ''}
                onChange={(e) => setData(prev => ({ ...prev, resting_heart_rate: parseInt(e.target.value) || undefined }))}
                placeholder="60"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sleep Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-blue-500" />
              Sleep Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sleep-hours">Hours of Sleep</Label>
              <Input
                id="sleep-hours"
                type="number"
                step="0.5"
                value={data.sleep_hours || ''}
                onChange={(e) => setData(prev => ({ ...prev, sleep_hours: parseFloat(e.target.value) || undefined }))}
                placeholder="8.0"
              />
            </div>
            
            <div>
              <Label>Sleep Quality (1-10)</Label>
              <div className="px-3 py-2">
                <Slider
                  value={[data.sleep_quality || 5]}
                  onValueChange={([value]) => setData(prev => ({ ...prev, sleep_quality: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Poor</span>
                  <span>{data.sleep_quality || 5}</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mental State */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Mental State
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Stress Level (1-10)</Label>
              <div className="px-3 py-2">
                <Slider
                  value={[data.stress_level || 5]}
                  onValueChange={([value]) => setData(prev => ({ ...prev, stress_level: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Relaxed</span>
                  <span>{data.stress_level || 5}</span>
                  <span>Very Stressed</span>
                </div>
              </div>
            </div>
            
            <div>
              <Label>Mood (1-10)</Label>
              <div className="px-3 py-2">
                <Slider
                  value={[data.mood || 5]}
                  onValueChange={([value]) => setData(prev => ({ ...prev, mood: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low</span>
                  <span>{data.mood || 5}</span>
                  <span>Great</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Energy Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Energy Level (1-10)</Label>
              <div className="px-3 py-2">
                <Slider
                  value={[data.energy_level || 5]}
                  onValueChange={([value]) => setData(prev => ({ ...prev, energy_level: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Exhausted</span>
                  <span>{data.energy_level || 5}</span>
                  <span>Energized</span>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={data.notes || ''}
                onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any other observations about your health today..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={handleSave} 
        disabled={loading}
        size="lg"
        className="w-full"
      >
        <Save className="h-4 w-4 mr-2" />
        {loading ? "Saving..." : "Save Daily Check-in"}
      </Button>
    </div>
  );
}