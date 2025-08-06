import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log(`Calculating Phoenix Score for user: ${userId}`);

    // Get recent biometric data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: biometrics, error: biometricsError } = await supabaseClient
      .from('biometric_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', sevenDaysAgo.toISOString())
      .order('recorded_at', { ascending: false });

    if (biometricsError) {
      console.error('Error fetching biometrics:', biometricsError);
      throw biometricsError;
    }

    // Get recent workout data (last 7 days)
    const { data: workouts, error: workoutsError } = await supabaseClient
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', sevenDaysAgo.toISOString())
      .order('start_time', { ascending: false });

    if (workoutsError) {
      console.error('Error fetching workouts:', workoutsError);
      throw workoutsError;
    }

    // Get recent nutrition data (last 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: nutrition, error: nutritionError } = await supabaseClient
      .from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', threeDaysAgo.toISOString().split('T')[0]);

    if (nutritionError) {
      console.error('Error fetching nutrition:', nutritionError);
      throw nutritionError;
    }

    // Calculate component scores
    const scores = calculatePhoenixScore(biometrics, workouts, nutrition);
    
    console.log('Calculated scores:', scores);

    // Save Phoenix Score
    const { error: saveError } = await supabaseClient
      .from('phoenix_scores')
      .insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        overall_score: scores.overall,
        recovery_score: scores.recovery,
        sleep_score: scores.sleep,
        nutrition_score: scores.nutrition,
        training_load_score: scores.trainingLoad,
        stress_score: scores.stress,
        hrv_score: scores.hrv,
        recommendation: scores.recommendation,
        suggested_intensity: scores.suggestedIntensity,
        factors: scores.factors
      });

    if (saveError) {
      console.error('Error saving Phoenix Score:', saveError);
      throw saveError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        phoenixScore: scores 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in phoenix-score-calculator:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function calculatePhoenixScore(biometrics: any[], workouts: any[], nutrition: any[]) {
  // Get most recent biometric data
  const latestBiometric = biometrics[0] || {};
  
  // Calculate sleep score (0-10)
  const sleepScore = calculateSleepScore(latestBiometric);
  
  // Calculate recovery score based on sleep and subjective measures
  const recoveryScore = calculateRecoveryScore(latestBiometric, sleepScore);
  
  // Calculate training load score
  const trainingLoadScore = calculateTrainingLoadScore(workouts);
  
  // Calculate nutrition score
  const nutritionScore = calculateNutritionScore(nutrition);
  
  // Calculate stress score (inverse of stress level)
  const stressScore = calculateStressScore(latestBiometric);
  
  // Mock HRV score (in real implementation, this would use actual HRV data)
  const hrvScore = Math.max(1, Math.min(10, 7 + Math.random() * 2 - 1));
  
  // Calculate overall score (weighted average)
  const weights = {
    recovery: 0.25,
    sleep: 0.20,
    training: 0.20,
    nutrition: 0.15,
    stress: 0.15,
    hrv: 0.05
  };
  
  const overall = Math.round(
    (recoveryScore * weights.recovery) +
    (sleepScore * weights.sleep) +
    (trainingLoadScore * weights.training) +
    (nutritionScore * weights.nutrition) +
    (stressScore * weights.stress) +
    (hrvScore * weights.hrv)
  );

  // Generate recommendation and suggested intensity
  const { recommendation, suggestedIntensity } = generateRecommendations(
    overall, recoveryScore, trainingLoadScore, stressScore
  );

  return {
    overall: Math.max(1, Math.min(10, overall)),
    recovery: Math.round(recoveryScore),
    sleep: Math.round(sleepScore),
    nutrition: Math.round(nutritionScore),
    trainingLoad: Math.round(trainingLoadScore),
    stress: Math.round(stressScore),
    hrv: Math.round(hrvScore),
    recommendation,
    suggestedIntensity,
    factors: {
      sleep_hours: latestBiometric.sleep_hours,
      sleep_quality: latestBiometric.sleep_quality,
      stress_level: latestBiometric.stress_level,
      energy_level: latestBiometric.energy_level,
      recent_workouts: workouts.length,
      nutrition_consistency: nutrition.length
    }
  };
}

function calculateSleepScore(biometric: any): number {
  if (!biometric.sleep_hours && !biometric.sleep_quality) return 7; // Default
  
  const sleepHours = biometric.sleep_hours || 7;
  const sleepQuality = biometric.sleep_quality || 7;
  
  // Optimal sleep is 7-9 hours
  let hoursScore = 10;
  if (sleepHours < 6) hoursScore = 3;
  else if (sleepHours < 7) hoursScore = 6;
  else if (sleepHours > 9) hoursScore = 8;
  else if (sleepHours > 10) hoursScore = 6;
  
  // Combine hours and quality (60% quality, 40% hours)
  return (sleepQuality * 0.6) + (hoursScore * 0.4);
}

function calculateRecoveryScore(biometric: any, sleepScore: number): number {
  const energyLevel = biometric.energy_level || 7;
  const mood = biometric.mood || 7;
  
  // Recovery is primarily sleep + energy + mood
  return (sleepScore * 0.5) + (energyLevel * 0.3) + (mood * 0.2);
}

function calculateTrainingLoadScore(workouts: any[]): number {
  if (workouts.length === 0) return 8; // Good score if no recent intense training
  
  const recentWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
  const avgIntensity = workouts.reduce((sum, w) => sum + (w.difficulty_rating || 5), 0) / workouts.length;
  
  // Calculate training load (lower load = higher score for recovery)
  const weeklyVolume = totalDuration; // minutes per week
  const intensityFactor = avgIntensity / 10; // normalize to 0-1
  
  let score = 10;
  
  // Penalize very high volumes
  if (weeklyVolume > 400) score -= 3; // > 6.5 hours/week
  else if (weeklyVolume > 300) score -= 2;
  else if (weeklyVolume < 60) score -= 2; // Too little activity
  
  // Penalize very high intensity
  if (intensityFactor > 0.8) score -= 2;
  else if (intensityFactor > 0.6) score -= 1;
  
  return Math.max(1, Math.min(10, score));
}

function calculateNutritionScore(nutrition: any[]): number {
  if (nutrition.length === 0) return 6; // Neutral score if no data
  
  const days = [...new Set(nutrition.map(n => n.date))].length;
  const avgCalories = nutrition.reduce((sum, n) => sum + (n.total_calories || 0), 0) / days;
  const avgProtein = nutrition.reduce((sum, n) => sum + (n.total_protein_g || 0), 0) / days;
  
  let score = 7; // Base score
  
  // Assess calorie intake (assuming 2000-2500 is optimal range)
  if (avgCalories >= 1800 && avgCalories <= 2600) score += 1;
  else if (avgCalories < 1500 || avgCalories > 3000) score -= 2;
  
  // Assess protein intake (assuming 1.2-2.2g/kg body weight, estimate 80kg person)
  if (avgProtein >= 100 && avgProtein <= 180) score += 1;
  else if (avgProtein < 60) score -= 2;
  
  // Consistency bonus
  if (days >= 3) score += 1;
  
  return Math.max(1, Math.min(10, score));
}

function calculateStressScore(biometric: any): number {
  const stressLevel = biometric.stress_level || 5;
  // Convert stress level (1-10, where 10 is very stressed) to score (1-10, where 10 is good)
  return 11 - stressLevel;
}

function generateRecommendations(overall: number, recovery: number, trainingLoad: number, stress: number) {
  let recommendation = "";
  let suggestedIntensity = "moderate";
  
  if (overall >= 8) {
    recommendation = "Excellent readiness! You're primed for high-intensity training. Push your limits today.";
    suggestedIntensity = "high";
  } else if (overall >= 6) {
    recommendation = "Good readiness for training. Moderate to high intensity work will be productive.";
    suggestedIntensity = "moderate";
  } else if (overall >= 4) {
    recommendation = "Moderate readiness. Consider lighter training or focus on technique and mobility.";
    suggestedIntensity = "light";
  } else {
    recommendation = "Low readiness detected. Prioritize recovery, sleep, and light movement today.";
    suggestedIntensity = "recovery";
  }
  
  // Add specific factors
  if (recovery < 5) {
    recommendation += " Focus on sleep and stress management.";
  }
  if (stress < 5) {
    recommendation += " High stress detected - consider meditation or light activity.";
  }
  if (trainingLoad > 8) {
    recommendation += " Training load is high - ensure adequate recovery.";
  }
  
  return { recommendation, suggestedIntensity };
}