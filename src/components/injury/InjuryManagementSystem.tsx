import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2,
  Clock,
  Activity,
  Target,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  Heart,
  Save
} from "lucide-react";

interface InjuryRecord {
  id: string;
  body_part: string;
  injury_type: string;
  severity: 'minor' | 'moderate' | 'severe';
  date_occurred: string;
  status: 'active' | 'recovered' | 'managing';
  restrictions: string[];
  recommended_modifications: string[];
  recovery_timeline_weeks?: number;
  created_at: string;
  updated_at: string;
}

interface MovementRestriction {
  id: string;
  movement_pattern: string;
  restriction_type: 'avoid' | 'modify' | 'limit_range' | 'reduce_load';
  details: string;
  affected_exercises: string[];
  alternative_movements: string[];
  created_at: string;
}

interface InjuryFormData {
  body_part: string;
  injury_type: string;
  severity: 'minor' | 'moderate' | 'severe';
  date_occurred: string;
  status: 'active' | 'recovered' | 'managing';
  recovery_timeline_weeks?: number;
  notes: string;
}

export default function InjuryManagementSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [injuries, setInjuries] = useState<InjuryRecord[]>([]);
  const [restrictions, setRestrictions] = useState<MovementRestriction[]>([]);
  const [isAddingInjury, setIsAddingInjury] = useState(false);
  const [editingInjury, setEditingInjury] = useState<InjuryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState<InjuryFormData>({
    body_part: '',
    injury_type: '',
    severity: 'minor',
    date_occurred: new Date().toISOString().split('T')[0],
    status: 'active',
    notes: ''
  });

  const bodyParts = [
    'neck', 'shoulder', 'chest', 'upper_back', 'lower_back', 'bicep', 'tricep', 
    'forearm', 'wrist', 'hand', 'hip', 'glute', 'quad', 'hamstring', 'calf', 
    'shin', 'knee', 'ankle', 'foot', 'core'
  ];

  const injuryTypes = [
    'strain', 'sprain', 'tendinitis', 'bursitis', 'fracture', 'dislocation', 
    'muscle_tear', 'ligament_tear', 'bruise', 'overuse', 'acute_trauma', 'other'
  ];

  useEffect(() => {
    if (user) {
      loadInjuryData();
    }
  }, [user]);

  const loadInjuryData = async () => {
    setLoading(true);
    try {
      // Load injuries
      const { data: injuryData, error: injuryError } = await supabase
        .from('injury_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('date_occurred', { ascending: false });

      if (injuryError) throw injuryError;

      // Load movement restrictions
      const { data: restrictionData, error: restrictionError } = await supabase
        .from('movement_restrictions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (restrictionError) throw restrictionError;

      setInjuries(injuryData || []);
      setRestrictions(restrictionData || []);

    } catch (error) {
      console.error('Error loading injury data:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load injury data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInjury = async () => {
    if (!user || !formData.body_part || !formData.injury_type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const injuryData = {
        user_id: user.id,
        body_part: formData.body_part,
        injury_type: formData.injury_type,
        severity: formData.severity,
        date_occurred: formData.date_occurred,
        status: formData.status,
        recovery_timeline_weeks: formData.recovery_timeline_weeks,
        restrictions: generateRestrictions(formData),
        recommended_modifications: generateModifications(formData)
      };

      let error;
      if (editingInjury) {
        ({ error } = await supabase
          .from('injury_history')
          .update(injuryData)
          .eq('id', editingInjury.id));
      } else {
        ({ error } = await supabase
          .from('injury_history')
          .insert(injuryData));
      }

      if (error) throw error;

      // Generate movement restrictions for new active injuries
      if (formData.status === 'active' && !editingInjury) {
        await generateMovementRestrictions(formData);
      }

      await loadInjuryData();
      resetForm();
      
      toast({
        title: editingInjury ? "Injury Updated" : "Injury Added",
        description: `Successfully ${editingInjury ? 'updated' : 'added'} injury record.`
      });

    } catch (error) {
      console.error('Error saving injury:', error);
      toast({
        title: "Save Error",
        description: "Failed to save injury record",
        variant: "destructive"
      });
    }
  };

  const generateRestrictions = (data: InjuryFormData): string[] => {
    const restrictions: string[] = [];
    
    if (data.severity === 'severe') {
      restrictions.push('complete_rest', 'no_weight_bearing');
    } else if (data.severity === 'moderate') {
      restrictions.push('reduced_load', 'avoid_painful_movements');
    } else {
      restrictions.push('modify_as_needed');
    }

    // Body part specific restrictions
    if (data.body_part.includes('back')) {
      restrictions.push('avoid_spinal_loading', 'limit_flexion');
    } else if (data.body_part.includes('knee')) {
      restrictions.push('avoid_deep_flexion', 'limit_impact');
    } else if (data.body_part.includes('shoulder')) {
      restrictions.push('avoid_overhead', 'limit_external_rotation');
    }

    return restrictions;
  };

  const generateModifications = (data: InjuryFormData): string[] => {
    const modifications: string[] = [];
    
    modifications.push('use_alternative_exercises');
    
    if (data.severity === 'severe') {
      modifications.push('complete_exercise_substitution', 'focus_on_other_areas');
    } else if (data.severity === 'moderate') {
      modifications.push('reduce_range_of_motion', 'decrease_intensity');
    } else {
      modifications.push('monitor_pain_levels', 'stop_if_painful');
    }

    return modifications;
  };

  const generateMovementRestrictions = async (data: InjuryFormData) => {
    if (!user) return;

    const movements = getAffectedMovements(data.body_part);
    
    for (const movement of movements) {
      await supabase
        .from('movement_restrictions')
        .insert({
          user_id: user.id,
          movement_pattern: movement.pattern,
          restriction_type: movement.type,
          details: `Auto-generated restriction for ${data.body_part} ${data.injury_type}`,
          affected_exercises: movement.exercises,
          alternative_movements: movement.alternatives
        });
    }
  };

  const getAffectedMovements = (bodyPart: string) => {
    const movements = [];

    if (bodyPart.includes('back')) {
      movements.push({
        pattern: 'spinal_flexion',
        type: 'avoid' as const,
        exercises: ['deadlift', 'bent_over_row', 'good_morning'],
        alternatives: ['chest_supported_row', 'lat_pulldown', 'cable_row']
      });
    }

    if (bodyPart.includes('knee')) {
      movements.push({
        pattern: 'knee_flexion',
        type: 'limit_range' as const,
        exercises: ['squat', 'lunge', 'leg_press'],
        alternatives: ['wall_sit', 'quarter_squat', 'leg_extension']
      });
    }

    if (bodyPart.includes('shoulder')) {
      movements.push({
        pattern: 'overhead_press',
        type: 'avoid' as const,
        exercises: ['overhead_press', 'shoulder_press', 'handstand'],
        alternatives: ['chest_press', 'lateral_raise', 'front_raise']
      });
    }

    return movements;
  };

  const handleUpdateStatus = async (injuryId: string, newStatus: 'active' | 'recovered' | 'managing') => {
    try {
      const { error } = await supabase
        .from('injury_history')
        .update({ status: newStatus })
        .eq('id', injuryId);

      if (error) throw error;

      await loadInjuryData();
      
      toast({
        title: "Status Updated",
        description: `Injury status updated to ${newStatus}`
      });

    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update Error",
        description: "Failed to update injury status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteInjury = async (injuryId: string) => {
    try {
      const { error } = await supabase
        .from('injury_history')
        .delete()
        .eq('id', injuryId);

      if (error) throw error;

      await loadInjuryData();
      
      toast({
        title: "Injury Deleted",
        description: "Injury record successfully deleted"
      });

    } catch (error) {
      console.error('Error deleting injury:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete injury record",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      body_part: '',
      injury_type: '',
      severity: 'minor',
      date_occurred: new Date().toISOString().split('T')[0],
      status: 'active',
      notes: ''
    });
    setIsAddingInjury(false);
    setEditingInjury(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recovered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'managing': return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 animate-spin" />
          <span>Loading injury management system...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Injury Management</h1>
          <p className="text-muted-foreground">
            Track injuries and automatically generate safe exercise modifications
          </p>
        </div>

        <Dialog open={isAddingInjury || !!editingInjury} onOpenChange={(open) => {
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setIsAddingInjury(true)}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Injury
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingInjury ? 'Edit Injury Record' : 'Add New Injury'}
              </DialogTitle>
              <DialogDescription>
                Provide details about the injury to generate automatic exercise modifications
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="body_part">Body Part *</Label>
                <Select 
                  value={formData.body_part} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, body_part: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select body part" />
                  </SelectTrigger>
                  <SelectContent>
                    {bodyParts.map(part => (
                      <SelectItem key={part} value={part}>
                        {part.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="injury_type">Injury Type *</Label>
                <Select 
                  value={formData.injury_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, injury_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select injury type" />
                  </SelectTrigger>
                  <SelectContent>
                    {injuryTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select 
                  value={formData.severity} 
                  onValueChange={(value: 'minor' | 'moderate' | 'severe') => setFormData(prev => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'active' | 'recovered' | 'managing') => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="managing">Managing</SelectItem>
                    <SelectItem value="recovered">Recovered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_occurred">Date Occurred</Label>
                <Input
                  type="date"
                  value={formData.date_occurred}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_occurred: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recovery_timeline">Recovery Timeline (weeks)</Label>
                <Input
                  type="number"
                  placeholder="8"
                  value={formData.recovery_timeline_weeks || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    recovery_timeline_weeks: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                placeholder="Describe the injury, pain levels, activities that aggravate it..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSaveInjury}>
                <Save className="mr-2 h-4 w-4" />
                {editingInjury ? 'Update' : 'Save'} Injury
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Injuries Alert */}
      {injuries.filter(injury => injury.status === 'active').length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">
                You have {injuries.filter(injury => injury.status === 'active').length} active injury(ies)
              </span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Phoenix will automatically modify your workouts to avoid aggravating these injuries.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Injury List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Injury History
          </CardTitle>
          <CardDescription>
            Track and manage your injury history with automatic exercise modifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {injuries.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No injuries recorded</h3>
              <p className="text-muted-foreground mb-4">
                Track any injuries to help Phoenix generate safer workouts for you.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {injuries.map((injury) => (
                <div key={injury.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold capitalize">
                          {injury.body_part.replace('_', ' ')} {injury.injury_type.replace('_', ' ')}
                        </h3>
                        <Badge variant="outline" className={getSeverityColor(injury.severity)}>
                          {injury.severity}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getStatusIcon(injury.status)}
                          {injury.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Occurred: {new Date(injury.date_occurred).toLocaleDateString()}
                        </span>
                        {injury.recovery_timeline_weeks && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Recovery: {injury.recovery_timeline_weeks} weeks
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingInjury(injury);
                          setFormData({
                            body_part: injury.body_part,
                            injury_type: injury.injury_type,
                            severity: injury.severity,
                            date_occurred: injury.date_occurred,
                            status: injury.status,
                            recovery_timeline_weeks: injury.recovery_timeline_weeks,
                            notes: ''
                          });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteInjury(injury.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {injury.restrictions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Restrictions:</h4>
                      <div className="flex flex-wrap gap-2">
                        {injury.restrictions.map((restriction, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {restriction.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {injury.recommended_modifications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recommended Modifications:</h4>
                      <div className="flex flex-wrap gap-2">
                        {injury.recommended_modifications.map((mod, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {mod.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {injury.status === 'active' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(injury.id, 'managing')}
                      >
                        Mark as Managing
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(injury.id, 'recovered')}
                      >
                        Mark as Recovered
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Movement Restrictions */}
      {restrictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Movement Restrictions
            </CardTitle>
            <CardDescription>
              Auto-generated restrictions based on your injury history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {restrictions.map((restriction) => (
                <div key={restriction.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium capitalize">
                      {restriction.movement_pattern.replace('_', ' ')}
                    </h3>
                    <Badge variant={restriction.restriction_type === 'avoid' ? 'destructive' : 'secondary'}>
                      {restriction.restriction_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{restriction.details}</p>
                  
                  {restriction.alternative_movements.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Alternatives: </span>
                      <span className="text-sm text-muted-foreground">
                        {restriction.alternative_movements.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}