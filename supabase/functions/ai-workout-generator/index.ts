import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[AI-WORKOUT-GENERATOR] ${step}`, details ? JSON.stringify(details) : '');
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
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { 
      goal, 
      duration_minutes, 
      equipment_available, 
      fitness_level, 
      muscle_groups_focus,
      workout_type,
      custom_prompt 
    } = await req.json();

    logStep("Request parsed", { goal, duration_minutes, equipment_available });

    // Get user profile for personalization
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get available exercises based on equipment and preferences
    const { data: exercises } = await supabaseClient
      .from('exercises')
      .select(`
        *,
        exercise_categories(name, color_hex),
        muscle_groups!inner(name)
      `)
      .eq('is_approved', true)
      .limit(500);

    logStep("Exercises loaded", { count: exercises?.length || 0 });

    // Build AI prompt for workout generation
    const systemPrompt = `You are an expert fitness coach AI that creates personalized workout routines. 
    
    User Profile:
    - Fitness Level: ${fitness_level || profile?.fitness_level || 'beginner'}
    - Primary Goal: ${goal || profile?.primary_goal || 'general_fitness'}
    - Available Equipment: ${JSON.stringify(equipment_available || profile?.available_equipment || [])}
    - Duration: ${duration_minutes || 45} minutes
    
    Available Exercises Database:
    ${exercises?.slice(0, 100).map(ex => `- ${ex.name}: ${ex.description} (${ex.exercise_type}, ${ex.difficulty_level})`).join('\n')}
    
    Create a structured workout routine that:
    1. Matches the user's fitness level and goals
    2. Uses only available equipment
    3. Fits within the time constraint
    4. Includes proper warm-up and cool-down
    5. Balances muscle groups appropriately
    
    Return a JSON object with this exact structure:
    {
      "name": "Workout Name",
      "description": "Brief description",
      "estimated_duration": number,
      "difficulty_level": "beginner|intermediate|expert",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": number,
          "reps": "number or range like '8-12'",
          "rest_seconds": number,
          "notes": "Form cues or modifications",
          "order_index": number,
          "is_superset": false,
          "superset_group": null
        }
      ],
      "warmup": ["exercise1", "exercise2"],
      "cooldown": ["stretch1", "stretch2"],
      "coaching_notes": "Additional guidance"
    }`;

    const userPrompt = custom_prompt || `Create a ${duration_minutes || 45}-minute ${workout_type || 'strength'} workout focusing on ${muscle_groups_focus?.join(', ') || 'full body'} for my ${goal || 'fitness'} goal.`;

    logStep("Generating workout with OpenAI");
    const startTime = Date.now();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const generationTime = Date.now() - startTime;
    
    logStep("AI response received", { 
      tokensUsed: aiData.usage?.total_tokens,
      generationTime 
    });

    let generatedWorkout;
    try {
      generatedWorkout = JSON.parse(aiData.choices[0].message.content);
    } catch (parseError) {
      logStep("JSON parse failed, using fallback");
      // Fallback workout structure
      generatedWorkout = {
        name: "AI Generated Workout",
        description: "Custom workout created by AI",
        estimated_duration: duration_minutes || 45,
        difficulty_level: fitness_level || 'beginner',
        exercises: [
          {
            name: "Push-ups",
            sets: 3,
            reps: "8-12",
            rest_seconds: 60,
            notes: "Keep core tight, full range of motion",
            order_index: 1,
            is_superset: false,
            superset_group: null
          }
        ],
        warmup: ["Arm circles", "Leg swings"],
        cooldown: ["Chest stretch", "Shoulder stretch"],
        coaching_notes: "Focus on proper form over speed"
      };
    }

    // Log the generation to database
    const { data: logEntry } = await supabaseClient
      .from('ai_workout_generations')
      .insert({
        user_id: user.id,
        prompt: userPrompt,
        user_preferences: {
          goal,
          duration_minutes,
          equipment_available,
          fitness_level,
          muscle_groups_focus,
          workout_type
        },
        generated_workout: generatedWorkout,
        model_used: 'gpt-4o-mini',
        tokens_used: aiData.usage?.total_tokens || 0,
        generation_time_ms: generationTime
      })
      .select()
      .single();

    logStep("Generation logged to database", { logId: logEntry?.id });

    // Trigger event for SEP rewards
    await supabaseClient
      .from('events')
      .insert({
        event_type: 'ai_workout_generated',
        event_data: {
          user_id: user.id,
          generation_id: logEntry?.id,
          workout_name: generatedWorkout.name
        },
        user_id: user.id
      });

    return new Response(JSON.stringify({
      workout: generatedWorkout,
      generation_id: logEntry?.id,
      tokens_used: aiData.usage?.total_tokens || 0,
      generation_time_ms: generationTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback_workout: {
        name: "Basic Full Body Workout",
        description: "A simple workout to get you started",
        estimated_duration: 30,
        exercises: [
          { name: "Bodyweight Squats", sets: 3, reps: "10-15", rest_seconds: 60 },
          { name: "Push-ups", sets: 3, reps: "5-10", rest_seconds: 60 },
          { name: "Plank", sets: 3, reps: "30-60 seconds", rest_seconds: 60 }
        ]
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});