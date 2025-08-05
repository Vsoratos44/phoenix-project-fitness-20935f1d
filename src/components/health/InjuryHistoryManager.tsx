import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Trash2, 
  Shield, 
  AlertTriangle, 
  Calendar, 
  Edit,
  Save,
  X
} from "lucide-react";

interface InjuryHistory {
  id?: string;
  injury_type: string;
  affected_area: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'recovering' | 'healed';
  onset_date?: string;
  recovery_date?: string;
  contraindicated_exercises: string[];
  alternative_exercises: string[];
  notes?: string;
}

export default function InjuryHistoryManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [injuries, setInjuries] = useState<InjuryHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newInjury, setNewInjury] = useState<InjuryHistory>({
    injury_type: '',
    affected_area: '',
    severity: 'moderate',
    status: 'active',
    contraindicated_exercises: [],
    alternative_exercises: [],
    notes: ''
  });

  const injuryTypes = [
    'Muscle Strain', 'Joint Sprain', 'Tendonitis', 'Bursitis', 'Herniated Disc',
    'Fracture', 'Dislocation', 'Ligament Tear', 'Meniscus Tear', 'Rotator Cuff',
    'IT Band Syndrome', 'Plantar Fasciitis', 'Shin Splints', 'Tennis Elbow',
    'Golfer\'s Elbow', 'Lower Back Pain', 'Neck Pain', 'Shoulder Impingement',
    'Hip Flexor Strain', 'Hamstring Strain', 'Calf Strain', 'Achilles Tendonitis',
    'Wrist Pain', 'Knee Pain', 'Ankle Sprain', 'Other'
  ];

  const affectedAreas = [
    'Neck', 'Upper Back', 'Lower Back', 'Left Shoulder', 'Right Shoulder',
    'Left Elbow', 'Right Elbow', 'Left Wrist', 'Right Wrist', 'Chest',
    'Abdomen', 'Left Hip', 'Right Hip', 'Left Knee', 'Right Knee',
    'Left Ankle', 'Right Ankle', 'Left Foot', 'Right Foot'
  ];

  const commonContraindications = [
    'Heavy Squats', 'Deadlifts', 'Bench Press', 'Overhead Press', 'Pull-ups',
    'Rows', 'Lunges', 'Leg Press', 'Leg Curls', 'Calf Raises',
    'Planks', 'Crunches', 'Russian Twists', 'Mountain Climbers',
    'Burpees', 'Jump Squats', 'Box Jumps', 'Running', 'Cycling',
    'Swimming', 'Yoga', 'Pilates'
  ];

  useEffect(() => {
    if (user) {
      loadInjuryHistory();
    }
  }, [user]);

  const loadInjuryHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('user_injury_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInjuries((data || []) as InjuryHistory[]);
    } catch (error) {
      console.error('Error loading injury history:', error);
      toast({
        title: "Error",
        description: "Failed to load injury history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveInjury = async (injury: InjuryHistory) => {
    if (!user) return;

    try {
      if (injury.id) {
        // Update existing injury
        const { error } = await supabase
          .from('user_injury_history')
          .update({
            injury_type: injury.injury_type,
            affected_area: injury.affected_area,
            severity: injury.severity,
            status: injury.status,
            onset_date: injury.onset_date,
            recovery_date: injury.recovery_date,
            contraindicated_exercises: injury.contraindicated_exercises,
            alternative_exercises: injury.alternative_exercises,
            notes: injury.notes
          })
          .eq('id', injury.id);

        if (error) throw error;
      } else {
        // Create new injury
        const { error } = await supabase
          .from('user_injury_history')
          .insert({
            user_id: user.id,
            injury_type: injury.injury_type,
            affected_area: injury.affected_area,
            severity: injury.severity,
            status: injury.status,
            onset_date: injury.onset_date,
            recovery_date: injury.recovery_date,
            contraindicated_exercises: injury.contraindicated_exercises,
            alternative_exercises: injury.alternative_exercises,
            notes: injury.notes
          });

        if (error) throw error;
      }

      // Update user profile summary
      await updateProfileSummary();
      
      toast({
        title: "✅ Injury Record Saved",
        description: "Phoenix will now adapt workouts to protect this area."
      });

      loadInjuryHistory();
      setNewInjury({
        injury_type: '',
        affected_area: '',
        severity: 'moderate',
        status: 'active',
        contraindicated_exercises: [],
        alternative_exercises: [],
        notes: ''
      });
      setEditingId(null);

    } catch (error) {
      console.error('Error saving injury:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save injury record",
        variant: "destructive"
      });
    }
  };

  const deleteInjury = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_injury_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await updateProfileSummary();
      loadInjuryHistory();
      
      toast({
        title: "Injury Record Deleted",
        description: "The injury has been removed from your history."
      });

    } catch (error) {
      console.error('Error deleting injury:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete injury record",
        variant: "destructive"
      });
    }
  };

  const updateProfileSummary = async () => {
    if (!user) return;

    try {
      // Get active injuries for profile summary
      const activeInjuries = injuries.filter(injury => injury.status === 'active');
      const injurySummary = activeInjuries.map(injury => ({
        type: injury.injury_type,
        area: injury.affected_area,
        severity: injury.severity
      }));

      await supabase
        .from('profiles')
        .update({
          injury_history_summary: injurySummary
        })
        .eq('user_id', user.id);

    } catch (error) {
      console.error('Error updating profile summary:', error);
    }
  };

  const handleContraindicationToggle = (exercise: string, injury: InjuryHistory, setInjury: (injury: InjuryHistory) => void) => {
    const isSelected = injury.contraindicated_exercises.includes(exercise);
    const updated = isSelected
      ? injury.contraindicated_exercises.filter(e => e !== exercise)
      : [...injury.contraindicated_exercises, exercise];
    
    setInjury({ ...injury, contraindicated_exercises: updated });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'severe': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800 border-red-200';
      case 'recovering': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'healed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Loading Injury History...</h3>
            <p className="text-muted-foreground">Reviewing your safety profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-red-100">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Injury History & Safety</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Help Phoenix protect you by tracking your injury history. This enables intelligent exercise substitutions and personalized modifications.
        </p>
      </div>

      {/* Safety Notice */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Important Safety Notice</h4>
              <p className="text-red-700 text-sm">
                This tool is for fitness planning only and does not replace medical advice. 
                Always consult healthcare professionals for injury assessment and treatment.
                Phoenix AI will use this information to modify exercises, but you should stop immediately if you experience pain.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Injury */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Injury Record
          </CardTitle>
          <CardDescription>
            Document injuries to help Phoenix create safer, adaptive workouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="injury_type">Injury Type</Label>
              <Select
                value={newInjury.injury_type}
                onValueChange={(value) => setNewInjury({ ...newInjury, injury_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select injury type" />
                </SelectTrigger>
                <SelectContent>
                  {injuryTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="affected_area">Affected Area</Label>
              <Select
                value={newInjury.affected_area}
                onValueChange={(value) => setNewInjury({ ...newInjury, affected_area: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select affected area" />
                </SelectTrigger>
                <SelectContent>
                  {affectedAreas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={newInjury.severity}
                onValueChange={(value: 'mild' | 'moderate' | 'severe') => 
                  setNewInjury({ ...newInjury, severity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild - Minor discomfort</SelectItem>
                  <SelectItem value="moderate">Moderate - Noticeable pain/limitation</SelectItem>
                  <SelectItem value="severe">Severe - Significant impairment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Current Status</Label>
              <Select
                value={newInjury.status}
                onValueChange={(value: 'active' | 'recovering' | 'healed') => 
                  setNewInjury({ ...newInjury, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active - Currently affected</SelectItem>
                  <SelectItem value="recovering">Recovering - Improving but cautious</SelectItem>
                  <SelectItem value="healed">Healed - No longer an issue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="onset_date">Onset Date (Optional)</Label>
              <Input
                id="onset_date"
                type="date"
                value={newInjury.onset_date || ''}
                onChange={(e) => setNewInjury({ ...newInjury, onset_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="recovery_date">Recovery Date (Optional)</Label>
              <Input
                id="recovery_date"
                type="date"
                value={newInjury.recovery_date || ''}
                onChange={(e) => setNewInjury({ ...newInjury, recovery_date: e.target.value })}
              />
            </div>
          </div>

          {/* Contraindicated Exercises */}
          <div>
            <Label className="text-base font-semibold">Exercises to Avoid</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select exercises that aggravate this injury. Phoenix will substitute these automatically.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {commonContraindications.map(exercise => (
                <div
                  key={exercise}
                  className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                    newInjury.contraindicated_exercises.includes(exercise)
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => handleContraindicationToggle(exercise, newInjury, setNewInjury)}
                >
                  <span className="text-sm">{exercise}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional context, triggers, or special considerations..."
              value={newInjury.notes || ''}
              onChange={(e) => setNewInjury({ ...newInjury, notes: e.target.value })}
              rows={3}
            />
          </div>

          <Button 
            onClick={() => saveInjury(newInjury)}
            disabled={!newInjury.injury_type || !newInjury.affected_area}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Injury Record
          </Button>
        </CardContent>
      </Card>

      {/* Existing Injuries */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Injury History</h2>
        
        {injuries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Injuries Recorded</h3>
              <p className="text-muted-foreground">
                Great! No injury history means Phoenix can recommend the full range of exercises.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {injuries.map((injury) => (
              <Card key={injury.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {injury.injury_type}
                        <Badge className={getSeverityColor(injury.severity)}>
                          {injury.severity}
                        </Badge>
                        <Badge className={getStatusColor(injury.status)}>
                          {injury.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Affected Area: {injury.affected_area}
                        {injury.onset_date && (
                          <span className="ml-2">• Onset: {new Date(injury.onset_date).toLocaleDateString()}</span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(injury.id || null)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => injury.id && deleteInjury(injury.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {injury.notes && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-1">Notes:</h4>
                      <p className="text-sm text-muted-foreground">{injury.notes}</p>
                    </div>
                  )}
                  
                  {injury.contraindicated_exercises.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Phoenix will avoid these exercises:</h4>
                      <div className="flex flex-wrap gap-2">
                        {injury.contraindicated_exercises.map((exercise, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {exercise}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Phoenix Safety Features */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Shield className="h-5 w-5" />
            How Phoenix Protects You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🔄 Automatic Substitutions</h4>
              <p className="text-blue-700">
                Phoenix automatically replaces contraindicated exercises with safer alternatives that target the same muscle groups.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">📉 Progressive Loading</h4>
              <p className="text-blue-700">
                For recovering areas, Phoenix gradually increases intensity as your status improves from active to healed.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Movement Modifications</h4>
              <p className="text-blue-700">
                Range of motion and load adjustments based on injury severity and current status.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">⚡ Real-time Adaptation</h4>
              <p className="text-blue-700">
                During workouts, you can report pain or discomfort for immediate exercise modifications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
