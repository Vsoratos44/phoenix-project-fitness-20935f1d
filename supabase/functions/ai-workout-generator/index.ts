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

    // Phoenix Training Protocols Knowledge Base
    const phoenixProtocols = `
    PHOENIX TRAINING PROTOCOLS - EVIDENCE-BASED WORKOUT SYSTEMS:
    
    1. METABOLIC HYPERTROPHY (8 weeks, 4 days/week):
    - Goal: Lean muscle + fat loss
    - Structure: Upper/Lower split with accumulation (weeks 1-4) and intensification (weeks 5-8)
    - Key exercises: Bench press, rows, squats, deadlifts with superset protocols
    - RPE: 8-9 for hypertrophy, 6-8 for strength
    
    2. LEAN PHYSIQUE SCULPT (12 weeks, 5 days/week):
    - Goal: Advanced hypertrophy + body composition
    - Structure: Push/Pull/Legs with block periodization
    - Intensity techniques: Drop sets, supersets, minimal rest
    - Volume progression through 3 blocks
    
    3. PROGRESSIVE HIIT OVERLOAD (8 weeks, 4 days/week):
    - Goal: Fat loss + cardiovascular conditioning
    - Work:Rest progression: 1:2 → 1:1.5 → 1:1 → 2:1
    - Exercises: Burpees, high knees, mountain climbers, etc.
    
    PERIODIZATION PRINCIPLES:
    - Linear: Gradual intensity increase, volume decrease
    - Undulating: Varies intensity/volume within weeks
    - Block: Focused training blocks for specific adaptations
    
    FATIGUE MANAGEMENT:
    - High fatigue (8+/10): Reduce volume 20-30%, RPE 6-7, extend rest
    - Moderate fatigue (6-7/10): Maintain volume, cap RPE at 8
    - Low fatigue (<6/10): Normal progression, RPE 8-9
    
    INJURY ACCOMMODATIONS:
    - Knee issues: Avoid deep squats, use leg press, controlled movements
    - Shoulder issues: Limit overhead, neutral grip, scapular stability
    - Back issues: Avoid loaded spinal flexion, hip hinge patterns, core stability
    
    PROGRESSIVE OVERLOAD METHODS:
    1. Weight progression (most common)
    2. Rep progression (within ranges)
    3. Set progression (add volume)
    4. Density progression (less rest)
    5. Complexity progression (advanced variations)
    `;

    // Build AI prompt for workout generation
    const systemPrompt = `You are an expert strength and conditioning coach with NSCA and NASM certifications. You specialize in the Phoenix Training Protocols - evidence-based workout systems.
    
    ${phoenixProtocols}
    
    User Profile:
    - Fitness Level: ${fitness_level || profile?.fitness_level || 'beginner'}
    - Primary Goal: ${goal || profile?.primary_goal || 'general_fitness'}
    - Available Equipment: ${JSON.stringify(equipment_available || profile?.available_equipment || [])}
    - Duration: ${duration_minutes || 45} minutes
    - Current Week: ${custom_prompt?.includes('week') ? 'Extract from prompt' : '1'}
    - Fatigue Level: ${custom_prompt?.includes('fatigue') ? 'Extract from prompt' : '5/10'}
    
    Available Exercises Database:
    ${exercises?.slice(0, 50).map(ex => `- ${ex.name}: ${ex.description} (${ex.exercise_type}, ${ex.difficulty_level})`).join('\n')}
    
    Create a Phoenix Protocol-based workout that:
    1. Follows periodization principles for the current training week
    2. Adapts to user's fatigue level and any injury history mentioned
    3. Uses appropriate RPE targets based on goals and fatigue
    4. Includes proper superset/circuit structure when applicable
    5. Provides exercise regressions/progressions
    6. Incorporates EPOC-maximizing techniques for fat loss goals
    
    Return a JSON object with this exact structure:
    {
      "name": "Phoenix Protocol - [Program Type]",
      "description": "Brief description with current phase info",
      "estimated_duration": number,
      "difficulty_level": "beginner|intermediate|expert",
      "program_info": {
        "protocol": "metabolic_hypertrophy|lean_physique|progressive_hiit|custom",
        "current_week": number,
        "current_phase": "accumulation|intensification|foundation|peak",
        "adaptations": "Any fatigue/injury adaptations made"
      },
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": number,
          "reps": "number or range like '8-12'",
          "rpe": "6-9 target RPE",
          "rest_seconds": number,
          "notes": "Form cues, progression/regression options",
          "order_index": number,
          "is_superset": boolean,
          "superset_group": "A1, A2, B1, etc or null",
          "primary_muscle_groups": ["chest", "back", etc],
          "equipment_needed": ["barbell", "dumbbells", etc]
        }
      ],
      "warmup": ["Dynamic warm-up exercises"],
      "cooldown": ["Static stretches and recovery"],
      "coaching_notes": "Phoenix Protocol guidance, RPE explanation, progression notes",
      "next_session_preview": "What to expect in next workout"
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