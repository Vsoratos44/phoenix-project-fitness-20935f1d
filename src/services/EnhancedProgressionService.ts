import { supabase } from "@/integrations/supabase/client";
import { EnhancedExercise, UserProfile, ProgressionRecommendation } from "./EnhancedExerciseLibraryService";

export interface ProgressionLevel {
  level: number;
  name: string;
  requirements: string[];
  mastery_criteria: any;
}

export interface PerformanceRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  sets_completed: number;
  reps_completed: number[];
  load_used_kg?: number;
  duration_seconds?: number;
  rpe_scores: number[];
  average_rpe?: number;
  form_score?: number;
  completion_rate: number;
  progression_level?: number;
  mastery_achieved: boolean;
  created_at: string;
}

export enum PerformanceTrend {
  IMPROVING = 'improving',
  MAINTAINING = 'maintaining',
  DECLINING = 'declining'
}

export class EnhancedProgressionService {
  async calculateOptimalProgression(
    exerciseId: string,
    userProfile: UserProfile
  ): Promise<ProgressionRecommendation> {
    const exercise = await this.getExerciseById(exerciseId);
    if (!exercise) {
      throw new Error(`Exercise with ID ${exerciseId} not found`);
    }

    const performanceHistory = await this.getPerformanceHistory(exerciseId, userProfile.user_id);
    
    if (!performanceHistory.length) {
      return this.generateStartingProgression(exercise, userProfile);
    }

    const currentLevel = this.assessCurrentLevel(exercise, performanceHistory);
    const readinessScore = userProfile.biometrics.phoenix_score;
    
    return this.generateProgression(exercise, currentLevel, readinessScore, performanceHistory);
  }

  private async getExerciseById(exerciseId: string): Promise<EnhancedExercise | null> {
    try {
      const { data: exercise, error } = await supabase
        .from('enhanced_exercises')
        .select('*')
        .eq('id', exerciseId)
        .eq('is_approved', true)
        .single();

      if (error) throw error;
      return exercise;
    } catch (error) {
      console.error('Error fetching exercise:', error);
      return null;
    }
  }

  private async getPerformanceHistory(exerciseId: string, userId: string): Promise<PerformanceRecord[]> {
    try {
      const { data: history, error } = await supabase
        .from('enhanced_performance_logs')
        .select('*')
        .eq('exercise_id', exerciseId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return history || [];
    } catch (error) {
      console.error('Error fetching performance history:', error);
      return [];
    }
  }

  private generateStartingProgression(
    exercise: EnhancedExercise,
    userProfile: UserProfile
  ): ProgressionRecommendation {
    const trainingLevel = userProfile.fitness_profile.training_level;
    
    // Determine starting parameters based on training level and exercise difficulty
    let startingLevel = 1;
    let durationWeeks = 2;
    
    if (trainingLevel === 'intermediate' && exercise.difficulty_level <= 3) {
      startingLevel = 2;
      durationWeeks = 1;
    } else if (trainingLevel === 'advanced' && exercise.difficulty_level <= 2) {
      startingLevel = 3;
      durationWeeks = 1;
    }

    return {
      type: 'progression',
      reasoning: `Starting progression at level ${startingLevel} based on ${trainingLevel} training level`,
      duration_weeks: durationWeeks,
      next_assessment: 'weekly'
    };
  }

  private generateProgression(
    exercise: EnhancedExercise,
    currentLevel: ProgressionLevel,
    readinessScore: number,
    history: PerformanceRecord[]
  ): ProgressionRecommendation {
    const lastSession = history[0];
    const trend = this.analyzeTrend(history.slice(0, 3));
    
    // Adaptive progression based on performance and readiness
    let progressionRate = this.calculateProgressionRate(readinessScore, trend);
    
    if (lastSession.completion_rate < 0.8) {
      // Regression or deload
      return {
        type: 'deload',
        target_load: (lastSession.load_used_kg || 0) * 0.9,
        reasoning: 'Previous session completion rate below 80%',
        duration_weeks: 1,
        next_assessment: 'after_successful_completion'
      };
    }
    
    if ((lastSession.average_rpe || 0) <= 6 && lastSession.completion_rate >= 1.0) {
      // Ready for progression
      const nextStep = this.getNextProgressionStep(exercise, currentLevel);
      
      if (nextStep) {
        return {
          type: 'progression',
          target_load: this.calculateTargetLoad(lastSession, progressionRate),
          target_step: nextStep,
          reasoning: 'Performance indicates readiness for progression',
          duration_weeks: nextStep.mastery_time_weeks || 2,
          next_assessment: 'weekly'
        };
      }
    }
    
    // Maintain current level
    return {
      type: 'maintain',
      target_load: lastSession.load_used_kg || 0,
      reasoning: 'Consolidating current level',
      duration_weeks: 2,
      next_assessment: 'bi_weekly'
    };
  }

  private calculateProgressionRate(readinessScore: number, trend: PerformanceTrend): number {
    let baseRate = 0.025; // 2.5% default
    
    // Adjust for readiness
    if (readinessScore >= 80) baseRate *= 1.2;
    else if (readinessScore < 60) baseRate *= 0.8;
    
    // Adjust for trend
    if (trend === PerformanceTrend.IMPROVING) baseRate *= 1.1;
    else if (trend === PerformanceTrend.DECLINING) baseRate *= 0.7;
    
    return Math.min(baseRate, 0.05); // Cap at 5%
  }

  private analyzeTrend(recentSessions: PerformanceRecord[]): PerformanceTrend {
    if (recentSessions.length < 2) return PerformanceTrend.MAINTAINING;
    
    let improvingCount = 0;
    let decliningCount = 0;
    
    for (let i = 1; i < recentSessions.length; i++) {
      const current = recentSessions[i - 1];
      const previous = recentSessions[i];
      
      // Compare completion rate and load
      const currentScore = (current.completion_rate * (current.load_used_kg || 1));
      const previousScore = (previous.completion_rate * (previous.load_used_kg || 1));
      
      if (currentScore > previousScore) {
        improvingCount++;
      } else if (currentScore < previousScore) {
        decliningCount++;
      }
    }
    
    if (improvingCount > decliningCount) return PerformanceTrend.IMPROVING;
    if (decliningCount > improvingCount) return PerformanceTrend.DECLINING;
    return PerformanceTrend.MAINTAINING;
  }

  private assessCurrentLevel(exercise: EnhancedExercise, history: PerformanceRecord[]): ProgressionLevel {
    const latestSession = history[0];
    
    return {
      level: latestSession.progression_level || 1,
      name: `Level ${latestSession.progression_level || 1}`,
      requirements: [],
      mastery_criteria: exercise.mastery_criteria || {}
    };
  }

  private getNextProgressionStep(exercise: EnhancedExercise, currentLevel: ProgressionLevel): any {
    // Get progression pathway from exercise
    const pathway = exercise.progression_pathway as any[] || [];
    const nextLevelIndex = currentLevel.level;
    
    if (nextLevelIndex < pathway.length) {
      return {
        ...pathway[nextLevelIndex],
        mastery_time_weeks: pathway[nextLevelIndex].mastery_time_weeks || 2
      };
    }
    
    return null;
  }

  private calculateTargetLoad(lastSession: PerformanceRecord, progressionRate: number): number {
    const baseLoad = lastSession.load_used_kg || 0;
    return baseLoad * (1 + progressionRate);
  }

  async generateProgressionPlan(
    userId: string,
    exerciseId: string,
    targetWeeks: number = 12
  ): Promise<{
    weekly_targets: Array<{
      week: number;
      target_load?: number;
      target_sets: number;
      target_reps: string;
      focus: string;
      progression_notes: string;
    }>;
    milestones: Array<{
      week: number;
      milestone: string;
      assessment_criteria: string[];
    }>;
  }> {
    try {
      const exercise = await this.getExerciseById(exerciseId);
      if (!exercise) throw new Error('Exercise not found');

      const userMastery = await this.getUserMastery(userId, exerciseId);
      const currentLevel = userMastery?.current_progression_level || 1;
      
      const plan = {
        weekly_targets: [] as any[],
        milestones: [] as any[]
      };

      // Generate weekly progression
      for (let week = 1; week <= targetWeeks; week++) {
        const progressionFactor = 1 + (week - 1) * 0.025; // 2.5% progression per week
        
        plan.weekly_targets.push({
          week,
          target_load: this.calculateWeeklyTargetLoad(exercise, currentLevel, progressionFactor),
          target_sets: this.calculateTargetSets(exercise, week),
          target_reps: this.calculateTargetReps(exercise, week),
          focus: this.getWeeklyFocus(exercise, week),
          progression_notes: this.generateProgressionNotes(exercise, week)
        });

        // Add milestones every 4 weeks
        if (week % 4 === 0) {
          plan.milestones.push({
            week,
            milestone: `Level ${Math.floor(currentLevel + (week / 4))} Achievement`,
            assessment_criteria: this.generateAssessmentCriteria(exercise, week)
          });
        }
      }

      return plan;
    } catch (error) {
      console.error('Error generating progression plan:', error);
      throw error;
    }
  }

  private async getUserMastery(userId: string, exerciseId: string): Promise<any> {
    try {
      const { data: mastery, error } = await supabase
        .from('user_exercise_mastery')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return mastery;
    } catch (error) {
      console.error('Error fetching user mastery:', error);
      return null;
    }
  }

  private calculateWeeklyTargetLoad(exercise: EnhancedExercise, currentLevel: number, progressionFactor: number): number {
    // Base load calculation based on exercise type and user level
    const baseLoad = exercise.modality === 'bodyweight' ? 0 : 20; // Start with 20kg for weighted exercises
    return baseLoad * currentLevel * progressionFactor;
  }

  private calculateTargetSets(exercise: EnhancedExercise, week: number): number {
    const guidelines = exercise.volume_guidelines as any;
    const baseSets = guidelines?.beginner?.sets || 3;
    
    // Gradually increase sets over time
    return Math.min(baseSets + Math.floor(week / 4), 5);
  }

  private calculateTargetReps(exercise: EnhancedExercise, week: number): string {
    const guidelines = exercise.volume_guidelines as any;
    const baseReps = guidelines?.beginner?.reps || '8-12';
    
    // Adjust rep ranges based on progression phase
    if (week <= 4) return baseReps;
    if (week <= 8) return '10-15';
    return '12-20';
  }

  private getWeeklyFocus(exercise: EnhancedExercise, week: number): string {
    const phase = Math.floor((week - 1) / 4) + 1;
    
    switch (phase) {
      case 1: return 'Technique mastery and movement quality';
      case 2: return 'Strength building and progressive overload';
      case 3: return 'Power development and advanced variations';
      default: return 'Maintenance and refinement';
    }
  }

  private generateProgressionNotes(exercise: EnhancedExercise, week: number): string {
    const formCues = exercise.form_cues || [];
    const safetyNotes = exercise.safety_notes || [];
    
    const notes = [`Week ${week} focus: ${this.getWeeklyFocus(exercise, week)}`];
    
    if (formCues.length > 0) {
      notes.push(`Key form cue: ${formCues[week % formCues.length]}`);
    }
    
    if (week % 2 === 0 && safetyNotes.length > 0) {
      notes.push(`Safety reminder: ${safetyNotes[0]}`);
    }
    
    return notes.join('. ');
  }

  private generateAssessmentCriteria(exercise: EnhancedExercise, week: number): string[] {
    const baseCriteria = [
      'Form score ≥ 8/10',
      'Completion rate ≥ 90%',
      'RPE ≤ 7 for prescribed sets'
    ];

    if (exercise.mastery_criteria) {
      const criteria = exercise.mastery_criteria as any;
      if (criteria.minimum_reps) {
        baseCriteria.push(`Minimum ${criteria.minimum_reps} consecutive reps`);
      }
      if (criteria.minimum_hold_time_seconds) {
        baseCriteria.push(`Hold for ${criteria.minimum_hold_time_seconds} seconds`);
      }
    }

    return baseCriteria;
  }

  async trackProgressionMilestone(
    userId: string,
    exerciseId: string,
    milestoneData: {
      milestone_type: string;
      achievement_date: string;
      performance_metrics: any;
      notes?: string;
    }
  ): Promise<boolean> {
    try {
      // Update user exercise mastery
      const { error: masteryError } = await supabase
        .from('user_exercise_mastery')
        .upsert({
          user_id: userId,
          exercise_id: exerciseId,
          progression_history: [milestoneData], // Append to existing history
          updated_at: new Date().toISOString()
        });

      if (masteryError) throw masteryError;

      // Log the milestone achievement
      const { error: logError } = await supabase
        .from('enhanced_performance_logs')
        .insert({
          user_id: userId,
          exercise_id: exerciseId,
          progression_notes: `Milestone achieved: ${milestoneData.milestone_type}`,
          created_at: milestoneData.achievement_date
        });

      if (logError) throw logError;

      return true;
    } catch (error) {
      console.error('Error tracking progression milestone:', error);
      return false;
    }
  }

  async getProgressionAnalytics(
    userId: string,
    exerciseId: string,
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<{
    performance_trend: PerformanceTrend;
    strength_gains: number;
    consistency_score: number;
    form_improvement: number;
    recommendations: string[];
  }> {
    try {
      const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data: logs, error } = await supabase
        .from('enhanced_performance_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!logs || logs.length === 0) {
        return {
          performance_trend: PerformanceTrend.MAINTAINING,
          strength_gains: 0,
          consistency_score: 0,
          form_improvement: 0,
          recommendations: ['Insufficient data - perform more sessions to track progress']
        };
      }

      const trend = this.analyzeTrend(logs);
      const strengthGains = this.calculateStrengthGains(logs);
      const consistencyScore = this.calculateConsistencyScore(logs, days);
      const formImprovement = this.calculateFormImprovement(logs);
      const recommendations = this.generateRecommendations(logs, trend);

      return {
        performance_trend: trend,
        strength_gains: strengthGains,
        consistency_score: consistencyScore,
        form_improvement: formImprovement,
        recommendations
      };
    } catch (error) {
      console.error('Error getting progression analytics:', error);
      throw error;
    }
  }

  private calculateStrengthGains(logs: PerformanceRecord[]): number {
    if (logs.length < 2) return 0;
    
    const latest = logs[0];
    const oldest = logs[logs.length - 1];
    
    const latestStrength = (latest.load_used_kg || 0) * (latest.completion_rate || 0);
    const oldestStrength = (oldest.load_used_kg || 0) * (oldest.completion_rate || 0);
    
    if (oldestStrength === 0) return 0;
    
    return ((latestStrength - oldestStrength) / oldestStrength) * 100;
  }

  private calculateConsistencyScore(logs: PerformanceRecord[], totalDays: number): number {
    const sessionsPerWeek = (logs.length / totalDays) * 7;
    const targetSessionsPerWeek = 2; // Assumed target
    
    return Math.min((sessionsPerWeek / targetSessionsPerWeek) * 100, 100);
  }

  private calculateFormImprovement(logs: PerformanceRecord[]): number {
    if (logs.length < 2) return 0;
    
    const recentFormScores = logs.slice(0, Math.min(5, logs.length))
      .map(log => log.form_score || 0)
      .filter(score => score > 0);
    
    const olderFormScores = logs.slice(-Math.min(5, logs.length))
      .map(log => log.form_score || 0)
      .filter(score => score > 0);
    
    if (recentFormScores.length === 0 || olderFormScores.length === 0) return 0;
    
    const recentAvg = recentFormScores.reduce((sum, score) => sum + score, 0) / recentFormScores.length;
    const olderAvg = olderFormScores.reduce((sum, score) => sum + score, 0) / olderFormScores.length;
    
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }

  private generateRecommendations(logs: PerformanceRecord[], trend: PerformanceTrend): string[] {
    const recommendations: string[] = [];
    
    if (trend === PerformanceTrend.DECLINING) {
      recommendations.push('Consider a deload week to allow for recovery');
      recommendations.push('Focus on form quality over load increases');
    } else if (trend === PerformanceTrend.IMPROVING) {
      recommendations.push('Excellent progress! Consider progressing to the next level');
      recommendations.push('Maintain current training frequency');
    } else {
      recommendations.push('Progress is steady - consider varying training stimulus');
      recommendations.push('Focus on technique refinement');
    }
    
    // Analyze RPE patterns
    const recentRPEs = logs.slice(0, 5).map(log => log.average_rpe || 0).filter(rpe => rpe > 0);
    if (recentRPEs.length > 0) {
      const avgRPE = recentRPEs.reduce((sum, rpe) => sum + rpe, 0) / recentRPEs.length;
      
      if (avgRPE > 8) {
        recommendations.push('RPE consistently high - consider reducing intensity');
      } else if (avgRPE < 6) {
        recommendations.push('RPE low - ready for progression or increased intensity');
      }
    }
    
    return recommendations;
  }
}