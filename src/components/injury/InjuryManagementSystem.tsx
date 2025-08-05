import React, { useState, useEffect } from 'react';
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
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Calendar, 
  TrendingUp, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface InjuryRecord {
  id: string;
  body_part: string;
  injury_type: string;
  severity: number;
  date_occurred: string;
  current_status: string;
  pain_level: number;
  affects_training: boolean;
  recovery_notes: string;
  contraindicated_exercises: string[];
}

interface MovementRestriction {
  id: string;
  movement_pattern: string;
  restriction_type: string;
  severity: string;
  max_load_percentage: number;
  alternative_exercises: string[];
  modification_notes: string;
}

export function InjuryManagementSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [injuries, setInjuries] = useState<InjuryRecord[]>([]);
  const [restrictions, setRestrictions] = useState<MovementRestriction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddInjury, setShowAddInjury] = useState(false);
  const [editingInjury, setEditingInjury] = useState<InjuryRecord | null>(null);

  const [newInjury, setNewInjury] = useState({
    body_part: '',
    injury_type: '',
    severity: 5,
    date_occurred: '',
    current_status: 'recovering',
    pain_level: 0,
    affects_training: true,
    recovery_notes: '',
    contraindicated_exercises: []
  });

  useEffect(() => {
    if (user) {
      loadInjuryData();
    }
  }, [user]);

  const loadInjuryData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Using mock data until database tables are properly created
      const mockInjuries: InjuryRecord[] = [
        {
          id: '1',
          body_part: 'Lower Back',
          injury_type: 'Muscle Strain',
          severity: 6,
          date_occurred: '2024-01-15',
          current_status: 'recovering',
          pain_level: 3,
          affects_training: true,
          recovery_notes: 'Avoid heavy deadlifts, focus on mobility',
          contraindicated_exercises: ['deadlift', 'squat']
        },
        {
          id: '2',
          body_part: 'Right Shoulder',
          injury_type: 'Impingement',
          severity: 4,
          date_occurred: '2024-02-10',
          current_status: 'managed',
          pain_level: 2,
          affects_training: true,
          recovery_notes: 'Limit overhead movements, strengthen rear delts',
          contraindicated_exercises: ['overhead_press', 'handstand_pushup']
        }
      ];

      const mockRestrictions: MovementRestriction[] = [
        {
          id: '1',
          movement_pattern: 'Hip Hinge',
          restriction_type: 'injury',
          severity: 'moderate',
          max_load_percentage: 70,
          alternative_exercises: ['romanian_deadlift', 'hip_thrust'],
          modification_notes: 'Reduce range of motion, focus on hip mobility'
        },
        {
          id: '2',
          movement_pattern: 'Overhead Press',
          restriction_type: 'mobility',
          severity: 'mild',
          max_load_percentage: 80,
          alternative_exercises: ['landmine_press', 'dumbbell_press'],
          modification_notes: 'Improve shoulder mobility, use partial ROM'
        }
      ];

      setInjuries(mockInjuries);
      setRestrictions(mockRestrictions);

    } catch (error) {
      console.error('Error loading injury data:', error);
      toast({
        title: "Error Loading Data",
        description: "Unable to load injury management data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInjury = async () => {
    if (!newInjury.body_part || !newInjury.injury_type) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields",
        variant: "destructive"
      });
      return;
    }

    const injury: InjuryRecord = {
      id: Date.now().toString(),
      ...newInjury
    };

    setInjuries(prev => [...prev, injury]);
    setNewInjury({
      body_part: '',
      injury_type: '',
      severity: 5,
      date_occurred: '',
      current_status: 'recovering',
      pain_level: 0,
      affects_training: true,
      recovery_notes: '',
      contraindicated_exercises: []
    });
    setShowAddInjury(false);

    toast({
      title: "Injury Added",
      description: "Injury record has been added to your profile",
    });
  };

  const handleUpdateInjury = async (injury: InjuryRecord) => {
    setInjuries(prev => prev.map(inj => inj.id === injury.id ? injury : inj));
    setEditingInjury(null);

    toast({
      title: "Injury Updated",
      description: "Injury record has been updated",
    });
  };

  const handleDeleteInjury = async (injuryId: string) => {
    setInjuries(prev => prev.filter(inj => inj.id !== injuryId));

    toast({
      title: "Injury Removed",
      description: "Injury record has been removed from your profile",
    });
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-500';
    if (severity <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'recovering':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'chronic':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderInjuryCard = (injury: InjuryRecord) => (
    <Card key={injury.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(injury.current_status)}
            <CardTitle className="text-lg">{injury.body_part}</CardTitle>
            <Badge variant="outline">{injury.injury_type}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingInjury(injury)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteInjury(injury.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label className="text-sm text-muted-foreground">Severity</Label>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getSeverityColor(injury.severity)}`} />
              <span>{injury.severity}/10</span>
            </div>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Pain Level</Label>
            <div className="text-sm">{injury.pain_level}/10</div>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Status</Label>
            <div className="text-sm capitalize">{injury.current_status}</div>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Affects Training</Label>
            <div className="text-sm">{injury.affects_training ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {injury.recovery_notes && (
          <div className="mb-4">
            <Label className="text-sm text-muted-foreground">Recovery Notes</Label>
            <p className="text-sm mt-1">{injury.recovery_notes}</p>
          </div>
        )}

        {injury.contraindicated_exercises.length > 0 && (
          <div>
            <Label className="text-sm text-muted-foreground">Contraindicated Exercises</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {injury.contraindicated_exercises.map((exercise, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  <AlertTriangle className="h-2 w-2 mr-1" />
                  {exercise}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderMovementRestriction = (restriction: MovementRestriction) => (
    <Card key={restriction.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{restriction.movement_pattern}</CardTitle>
          <Badge variant={restriction.severity === 'severe' ? 'destructive' : 'secondary'}>
            {restriction.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-sm text-muted-foreground">Restriction Type</Label>
            <div className="text-sm capitalize">{restriction.restriction_type}</div>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Max Load</Label>
            <div className="text-sm">{restriction.max_load_percentage}% of 1RM</div>
          </div>
        </div>

        {restriction.modification_notes && (
          <div className="mb-4">
            <Label className="text-sm text-muted-foreground">Modification Notes</Label>
            <p className="text-sm mt-1">{restriction.modification_notes}</p>
          </div>
        )}

        {restriction.alternative_exercises.length > 0 && (
          <div>
            <Label className="text-sm text-muted-foreground">Alternative Exercises</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {restriction.alternative_exercises.map((exercise, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Activity className="h-2 w-2 mr-1" />
                  {exercise}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">Loading injury management data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Injury Management System</h1>
        <p className="text-muted-foreground">
          Track injuries, movement restrictions, and training modifications for safer workouts
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Current Injuries */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Current Injuries
                </CardTitle>
                <Button
                  onClick={() => setShowAddInjury(true)}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Injury
                </Button>
              </div>
              <CardDescription>
                Active injuries affecting your training
              </CardDescription>
            </CardHeader>
            <CardContent>
              {injuries.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Active Injuries</h3>
                  <p className="text-muted-foreground">
                    Great! You currently have no recorded injuries
                  </p>
                </div>
              ) : (
                <div>
                  {injuries.map(renderInjuryCard)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Movement Restrictions */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Movement Restrictions
              </CardTitle>
              <CardDescription>
                Current movement limitations and modifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {restrictions.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Restrictions</h3>
                  <p className="text-muted-foreground">
                    You have full movement freedom
                  </p>
                </div>
              ) : (
                <div>
                  {restrictions.map(renderMovementRestriction)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Injury Modal */}
      {showAddInjury && (
        <Card className="fixed inset-0 z-50 m-4 md:m-8 lg:m-16 overflow-auto">
          <CardHeader>
            <CardTitle>Add New Injury</CardTitle>
            <CardDescription>
              Record a new injury to track its impact on your training
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="body_part">Body Part *</Label>
                <Input
                  id="body_part"
                  value={newInjury.body_part}
                  onChange={(e) => setNewInjury(prev => ({ ...prev, body_part: e.target.value }))}
                  placeholder="e.g., Lower Back, Right Knee"
                />
              </div>
              <div>
                <Label htmlFor="injury_type">Injury Type *</Label>
                <Select
                  value={newInjury.injury_type}
                  onValueChange={(value) => setNewInjury(prev => ({ ...prev, injury_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select injury type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strain">Muscle Strain</SelectItem>
                    <SelectItem value="sprain">Ligament Sprain</SelectItem>
                    <SelectItem value="impingement">Impingement</SelectItem>
                    <SelectItem value="tendinitis">Tendinitis</SelectItem>
                    <SelectItem value="fracture">Fracture</SelectItem>
                    <SelectItem value="dislocation">Dislocation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="severity">Severity (1-10)</Label>
                <Input
                  id="severity"
                  type="number"
                  min="1"
                  max="10"
                  value={newInjury.severity}
                  onChange={(e) => setNewInjury(prev => ({ ...prev, severity: parseInt(e.target.value) || 5 }))}
                />
              </div>
              <div>
                <Label htmlFor="pain_level">Current Pain Level (0-10)</Label>
                <Input
                  id="pain_level"
                  type="number"
                  min="0"
                  max="10"
                  value={newInjury.pain_level}
                  onChange={(e) => setNewInjury(prev => ({ ...prev, pain_level: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="date_occurred">Date of Injury</Label>
              <Input
                id="date_occurred"
                type="date"
                value={newInjury.date_occurred}
                onChange={(e) => setNewInjury(prev => ({ ...prev, date_occurred: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="recovery_notes">Recovery Notes</Label>
              <Textarea
                id="recovery_notes"
                value={newInjury.recovery_notes}
                onChange={(e) => setNewInjury(prev => ({ ...prev, recovery_notes: e.target.value }))}
                placeholder="Treatment plan, exercises to avoid, etc."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddInjury(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddInjury}>
                Add Injury
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}