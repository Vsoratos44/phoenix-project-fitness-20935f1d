import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedExerciseLibraryService, type EnhancedExercise } from '@/services/EnhancedExerciseLibraryService';
import { Shield, TrendingUp, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const exerciseService = new EnhancedExerciseLibraryService();

export default function EnhancedExerciseBrowser() {
  const [exercises, setExercises] = useState<EnhancedExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    modality: '',
    difficulty: '',
    movement_pattern: ''
  });

  useEffect(() => {
    loadExercises();
  }, [searchTerm, selectedFilters]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      
      if (searchTerm) {
        const results = await exerciseService.searchExercises(searchTerm, {
          modality: selectedFilters.modality || undefined,
          difficulty_level: selectedFilters.difficulty ? parseInt(selectedFilters.difficulty) : undefined
        });
        setExercises(results);
      } else {
        // Load all exercises with filters
        const results = await exerciseService.searchExercises('', selectedFilters);
        setExercises(results);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return 'bg-green-100 text-green-800';
    if (level <= 3) return 'bg-yellow-100 text-yellow-800';
    if (level <= 4) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 2) return 'Beginner';
    if (level <= 3) return 'Intermediate';
    if (level <= 4) return 'Advanced';
    return 'Expert';
  };

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'bodyweight': return '🏃';
      case 'free_weights': return '🏋️';
      case 'kettlebell': return '⚡';
      case 'resistance_bands': return '🎯';
      case 'cardiovascular': return '❤️';
      case 'flexibility': return '🧘';
      default: return '💪';
    }
  };

  const renderSafetyIndicators = (exercise: EnhancedExercise) => {
    const hasContraindications = exercise.contraindications && exercise.contraindications.length > 0;
    const hasInjuryRisks = exercise.injury_risk_factors && exercise.injury_risk_factors.length > 0;
    
    return (
      <div className="flex gap-2 mt-2">
        {!hasContraindications && !hasInjuryRisks && (
          <Badge variant="outline" className="text-green-600 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Safe for all
          </Badge>
        )}
        {hasContraindications && (
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Has contraindications
          </Badge>
        )}
        {hasInjuryRisks && (
          <Badge variant="outline" className="text-red-600 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Injury risk factors
          </Badge>
        )}
      </div>
    );
  };

  const renderProgressionInfo = (exercise: EnhancedExercise) => {
    const hasProgression = exercise.progression_pathway && exercise.progression_pathway.length > 0;
    const hasMastery = exercise.mastery_criteria && Object.keys(exercise.mastery_criteria).length > 0;
    
    if (!hasProgression && !hasMastery) return null;
    
    return (
      <div className="mt-3 p-2 bg-blue-50 rounded">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium">Progressive System Available</span>
        </div>
        {hasProgression && Array.isArray(exercise.progression_pathway) && (
          <p className="text-xs text-blue-600 mt-1">
            {exercise.progression_pathway.length} progression levels
          </p>
        )}
        {hasMastery && exercise.mastery_criteria && typeof exercise.mastery_criteria === 'object' && 'minimum_reps' in exercise.mastery_criteria && (
          <p className="text-xs text-blue-600">
            Mastery: {(exercise.mastery_criteria as any).minimum_reps} reps
          </p>
        )}
      </div>
    );
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading enhanced exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">Enhanced Exercise Library</h1>
        <p className="text-muted-foreground mt-2">
          Medical-grade exercise database with progressive pathways and safety assessments
        </p>
      </div>

      {/* Enhanced Features Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This enhanced library includes medical safety screening, progressive difficulty levels, 
          and biomechanical analysis for optimal exercise selection.
        </AlertDescription>
      </Alert>

      {/* Search and Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <Input
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-2"
        />
        
        <select
          value={selectedFilters.modality}
          onChange={(e) => setSelectedFilters({...selectedFilters, modality: e.target.value})}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Modalities</option>
          <option value="bodyweight">Bodyweight</option>
          <option value="free_weights">Free Weights</option>
          <option value="kettlebell">Kettlebell</option>
          <option value="resistance_bands">Resistance Bands</option>
          <option value="cardiovascular">Cardiovascular</option>
          <option value="flexibility">Flexibility</option>
        </select>

        <select
          value={selectedFilters.difficulty}
          onChange={(e) => setSelectedFilters({...selectedFilters, difficulty: e.target.value})}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Levels</option>
          <option value="1">Beginner (1-2)</option>
          <option value="3">Intermediate (3)</option>
          <option value="4">Advanced (4)</option>
          <option value="5">Expert (5)</option>
        </select>
      </div>

      {/* Exercise Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{getModalityIcon(exercise.modality)}</span>
                    {exercise.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {exercise.description}
                  </CardDescription>
                </div>
                <Badge className={getDifficultyColor(exercise.difficulty_level)}>
                  {getDifficultyLabel(exercise.difficulty_level)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Primary Muscles */}
              <div>
                <p className="text-sm font-medium mb-1">Primary Muscles:</p>
                <div className="flex flex-wrap gap-1">
                  {exercise.primary_muscles?.map((muscle, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Movement Patterns */}
              {exercise.movement_patterns && exercise.movement_patterns.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Movement Patterns:</p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.movement_patterns.map((pattern, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {pattern.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment Required */}
              {exercise.equipment_required && exercise.equipment_required.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Equipment:</p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.equipment_required.map((eq, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {eq}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Energy Systems */}
              {exercise.energy_system_emphasis && exercise.energy_system_emphasis.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Energy Systems:</p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.energy_system_emphasis.map((system, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {system.replace('_', '-').toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Indicators */}
              {renderSafetyIndicators(exercise)}

              {/* Progression Information */}
              {renderProgressionInfo(exercise)}

              {/* Action Button */}
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {
                  // This could open a detailed view or add to workout
                  console.log('Exercise selected:', exercise);
                }}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredExercises.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No exercises found matching your criteria.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchTerm('');
              setSelectedFilters({ modality: '', difficulty: '', movement_pattern: '' });
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Exercise Count */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {filteredExercises.length} enhanced exercises
      </div>
    </div>
  );
}