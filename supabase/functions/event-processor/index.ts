import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[EVENT-PROCESSOR] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Event processor started");

    // Get unprocessed events
    const { data: events, error: eventsError } = await supabaseClient
      .from('events')
      .select('*')
      .eq('processed', false)
      .lte('scheduled_for', new Date().toISOString())
      .lt('retry_count', 'max_retries')
      .order('created_at', { ascending: true })
      .limit(100);

    if (eventsError) throw eventsError;
    
    logStep("Found events to process", { count: events?.length || 0 });

    for (const event of events || []) {
      try {
        logStep("Processing event", { eventId: event.id, eventType: event.event_type });

        await processEvent(event, supabaseClient);

        // Mark event as processed
        await supabaseClient
          .from('events')
          .update({
            processed: true,
            processed_at: new Date().toISOString()
          })
          .eq('id', event.id);

        logStep("Event processed successfully", { eventId: event.id });

      } catch (eventError) {
        logStep("Event processing failed", { 
          eventId: event.id, 
          error: eventError.message 
        });

        // Update retry count and error message
        await supabaseClient
          .from('events')
          .update({
            retry_count: event.retry_count + 1,
            error_message: eventError.message,
            scheduled_for: new Date(Date.now() + (event.retry_count + 1) * 60000).toISOString()
          })
          .eq('id', event.id);
      }
    }

    return new Response(JSON.stringify({ 
      processed: events?.length || 0,
      status: 'success' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processEvent(event: any, supabase: any) {
  const { event_type, event_data, user_id } = event;

  switch (event_type) {
    case 'workout_completed':
      await handleWorkoutCompleted(event_data, user_id, supabase);
      break;
    
    case 'personal_record_achieved':
      await handlePersonalRecord(event_data, user_id, supabase);
      break;
    
    case 'nutrition_logged':
      await handleNutritionLogged(event_data, user_id, supabase);
      break;
    
    case 'ai_workout_generated':
      await handleAIWorkoutGenerated(event_data, user_id, supabase);
      break;
    
    case 'daily_goals_met':
      await handleDailyGoalsMet(event_data, user_id, supabase);
      break;
    
    case 'streak_milestone':
      await handleStreakMilestone(event_data, user_id, supabase);
      break;
    
    default:
      logStep("Unknown event type", { event_type });
  }
}

async function handleWorkoutCompleted(eventData: any, userId: string, supabase: any) {
  logStep("Processing workout completion");
  
  // Award base SEP points for workout completion
  const { data: activityType } = await supabase
    .from('sep_activity_types')
    .select('*')
    .eq('name', 'workout_completion')
    .single();

  if (activityType) {
    // Calculate bonus multipliers
    let bonusMultipliers = {};
    let tierMultiplier = 1.0;

    // Get user's subscription tier for multiplier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single();

    if (subscription?.tier === 'plus') tierMultiplier = 1.0;
    else if (subscription?.tier === 'premium') tierMultiplier = 1.5;
    else tierMultiplier = 0.5; // essential

    // Check for streak bonus
    const { data: recentWorkouts } = await supabase
      .from('workout_sessions')
      .select('start_time')
      .eq('user_id', userId)
      .gte('start_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('start_time', { ascending: false });

    if (recentWorkouts && recentWorkouts.length >= 3) {
      bonusMultipliers = { ...bonusMultipliers, streak_bonus: 1.2 };
    }

    const basePoints = activityType.base_points;
    const bonusMultiplier = Object.values(bonusMultipliers).reduce((a: number, b: number) => a * b, 1);
    const finalPoints = basePoints * bonusMultiplier * tierMultiplier;

    // Award SEP points
    await supabase
      .from('sep_ledger')
      .insert({
        user_id: userId,
        transaction_type: 'earned',
        activity_type: 'workout_completion',
        activity_reference_id: eventData.workout_session_id,
        base_points: basePoints,
        multipliers: bonusMultipliers,
        points: finalPoints,
        description: `Workout completed: ${eventData.workout_name || 'Custom Workout'}`
      });

    logStep("SEP points awarded", { userId, points: finalPoints });
  }
}

async function handlePersonalRecord(eventData: any, userId: string, supabase: any) {
  logStep("Processing personal record");
  
  const { data: activityType } = await supabase
    .from('sep_activity_types')
    .select('*')
    .eq('name', 'personal_record')
    .single();

  if (activityType) {
    const bonusPoints = activityType.base_points;
    
    await supabase
      .from('sep_ledger')
      .insert({
        user_id: userId,
        transaction_type: 'earned',
        activity_type: 'personal_record',
        activity_reference_id: eventData.record_id,
        base_points: bonusPoints,
        points: bonusPoints,
        description: `Personal Record: ${eventData.exercise_name} - ${eventData.record_value}`
      });

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: '🏆 New Personal Record!',
        content: `Congratulations! You set a new PR in ${eventData.exercise_name}`,
        category: 'achievement',
        notification_type: 'personal_record'
      });

    logStep("Personal record processed", { userId, exercise: eventData.exercise_name });
  }
}

async function handleNutritionLogged(eventData: any, userId: string, supabase: any) {
  logStep("Processing nutrition log");
  
  const { data: activityType } = await supabase
    .from('sep_activity_types')
    .select('*')
    .eq('name', 'nutrition_logging')
    .single();

  if (activityType) {
    await supabase
      .from('sep_ledger')
      .insert({
        user_id: userId,
        transaction_type: 'earned',
        activity_type: 'nutrition_logging',
        activity_reference_id: eventData.nutrition_log_id,
        base_points: activityType.base_points,
        points: activityType.base_points,
        description: `Meal logged: ${eventData.meal_type}`
      });

    logStep("Nutrition logging points awarded", { userId });
  }
}

async function handleAIWorkoutGenerated(eventData: any, userId: string, supabase: any) {
  logStep("Processing AI workout generation");
  
  // This is more for tracking/analytics, smaller point reward
  await supabase
    .from('sep_ledger')
    .insert({
      user_id: userId,
      transaction_type: 'earned',
      activity_type: 'ai_interaction',
      activity_reference_id: eventData.generation_id,
      base_points: 5,
      points: 5,
      description: `AI workout generated: ${eventData.workout_name}`
    });
}

async function handleDailyGoalsMet(eventData: any, userId: string, supabase: any) {
  logStep("Processing daily goals met");
  
  const { data: activityType } = await supabase
    .from('sep_activity_types')
    .select('*')
    .eq('name', 'daily_goal_met')
    .single();

  if (activityType) {
    await supabase
      .from('sep_ledger')
      .insert({
        user_id: userId,
        transaction_type: 'earned',
        activity_type: 'daily_goal_met',
        base_points: activityType.base_points,
        points: activityType.base_points,
        description: `Daily goals achieved: ${eventData.goals_met.join(', ')}`
      });
  }
}

async function handleStreakMilestone(eventData: any, userId: string, supabase: any) {
  logStep("Processing streak milestone");
  
  const { data: activityType } = await supabase
    .from('sep_activity_types')
    .select('*')
    .eq('name', 'streak_milestone')
    .single();

  if (activityType) {
    const bonusMultiplier = Math.floor(eventData.streak_days / 7); // Extra bonus for weekly milestones
    const totalPoints = activityType.base_points * (1 + bonusMultiplier * 0.1);
    
    await supabase
      .from('sep_ledger')
      .insert({
        user_id: userId,
        transaction_type: 'earned',
        activity_type: 'streak_milestone',
        base_points: activityType.base_points,
        points: totalPoints,
        description: `${eventData.streak_days}-day streak milestone!`
      });

    // Create notification for milestone
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: '🔥 Streak Milestone!',
        content: `Amazing! You've maintained a ${eventData.streak_days}-day activity streak!`,
        category: 'achievement',
        notification_type: 'streak_milestone'
      });
  }
}