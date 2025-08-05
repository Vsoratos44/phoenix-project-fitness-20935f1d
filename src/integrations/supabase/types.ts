export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string | null
          category: string | null
          created_at: string
          criteria: Json
          description: string | null
          difficulty: string | null
          icon_name: string | null
          id: string
          is_hidden: boolean | null
          is_repeatable: boolean | null
          name: string
          sep_reward: number | null
        }
        Insert: {
          badge_color?: string | null
          category?: string | null
          created_at?: string
          criteria: Json
          description?: string | null
          difficulty?: string | null
          icon_name?: string | null
          id?: string
          is_hidden?: boolean | null
          is_repeatable?: boolean | null
          name: string
          sep_reward?: number | null
        }
        Update: {
          badge_color?: string | null
          category?: string | null
          created_at?: string
          criteria?: Json
          description?: string | null
          difficulty?: string | null
          icon_name?: string | null
          id?: string
          is_hidden?: boolean | null
          is_repeatable?: boolean | null
          name?: string
          sep_reward?: number | null
        }
        Relationships: []
      }
      activity_feed: {
        Row: {
          activity_type: string
          comments_count: number | null
          content: string | null
          created_at: string
          id: string
          is_shareable: boolean | null
          likes_count: number | null
          metadata: Json | null
          privacy_level: string | null
          reference_id: string | null
          social_shares: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          is_shareable?: boolean | null
          likes_count?: number | null
          metadata?: Json | null
          privacy_level?: string | null
          reference_id?: string | null
          social_shares?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          is_shareable?: boolean | null
          likes_count?: number | null
          metadata?: Json | null
          privacy_level?: string | null
          reference_id?: string | null
          social_shares?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      activity_interactions: {
        Row: {
          activity_id: string | null
          content: string | null
          created_at: string
          id: string
          interaction_type: string
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          interaction_type: string
          user_id: string
        }
        Update: {
          activity_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          interaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_interactions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activity_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_workout_generations: {
        Row: {
          created_at: string
          feedback_notes: string | null
          feedback_rating: number | null
          generated_workout: Json
          generation_time_ms: number | null
          id: string
          model_used: string | null
          prompt: string
          tokens_used: number | null
          user_id: string
          user_preferences: Json | null
        }
        Insert: {
          created_at?: string
          feedback_notes?: string | null
          feedback_rating?: number | null
          generated_workout: Json
          generation_time_ms?: number | null
          id?: string
          model_used?: string | null
          prompt: string
          tokens_used?: number | null
          user_id: string
          user_preferences?: Json | null
        }
        Update: {
          created_at?: string
          feedback_notes?: string | null
          feedback_rating?: number | null
          generated_workout?: Json
          generation_time_ms?: number | null
          id?: string
          model_used?: string | null
          prompt?: string
          tokens_used?: number | null
          user_id?: string
          user_preferences?: Json | null
        }
        Relationships: []
      }
      biometric_logs: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          body_fat_percentage: number | null
          created_at: string
          energy_level: number | null
          id: string
          mood: number | null
          muscle_mass_kg: number | null
          notes: string | null
          recorded_at: string
          resting_heart_rate: number | null
          sleep_hours: number | null
          sleep_quality: number | null
          source: string | null
          stress_level: number | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          body_fat_percentage?: number | null
          created_at?: string
          energy_level?: number | null
          id?: string
          mood?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          recorded_at?: string
          resting_heart_rate?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          source?: string | null
          stress_level?: number | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          body_fat_percentage?: number | null
          created_at?: string
          energy_level?: number | null
          id?: string
          mood?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          recorded_at?: string
          resting_heart_rate?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          source?: string | null
          stress_level?: number | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "biometric_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string | null
          current_progress: Json | null
          final_rank: number | null
          id: string
          is_completed: boolean | null
          joined_at: string
          prize_earned_sep: number | null
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          current_progress?: Json | null
          final_rank?: number | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string
          prize_earned_sep?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          current_progress?: Json | null
          final_rank?: number | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string
          prize_earned_sep?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      challenges: {
        Row: {
          banner_url: string | null
          category: string | null
          challenge_type: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          entry_fee_sep: number | null
          goal_criteria: Json
          id: string
          is_public: boolean | null
          max_participants: number | null
          name: string
          prize_pool_sep: number | null
          rules: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          category?: string | null
          challenge_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          entry_fee_sep?: number | null
          goal_criteria: Json
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          name: string
          prize_pool_sep?: number | null
          rules?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          category?: string | null
          challenge_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          entry_fee_sep?: number | null
          goal_criteria?: Json
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          name?: string
          prize_pool_sep?: number | null
          rules?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      daily_habit_logs: {
        Row: {
          completed: boolean | null
          date: string
          habit_id: string | null
          id: string
          logged_at: string | null
          notes: string | null
          user_id: string | null
          value_achieved: number | null
        }
        Insert: {
          completed?: boolean | null
          date: string
          habit_id?: string | null
          id?: string
          logged_at?: string | null
          notes?: string | null
          user_id?: string | null
          value_achieved?: number | null
        }
        Update: {
          completed?: boolean | null
          date?: string
          habit_id?: string | null
          id?: string
          logged_at?: string | null
          notes?: string | null
          user_id?: string | null
          value_achieved?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habit_tracking"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_profiles: {
        Row: {
          age: number | null
          available_times: Json | null
          body_fat_percentage: number | null
          coaching_style: string | null
          created_at: string | null
          exercise_dislikes: string[] | null
          exercise_preferences: string[] | null
          gender: string | null
          gym_access: boolean | null
          height_cm: number | null
          home_equipment: string[] | null
          hrv_score: number | null
          id: string
          medical_conditions: string[] | null
          medications: string[] | null
          music_tempo_preference: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          pain_areas: string[] | null
          preferred_location: string | null
          primary_goal: string | null
          resting_heart_rate: number | null
          session_duration_preference: number | null
          sleep_quality_score: number | null
          specific_focus: string[] | null
          stress_level: number | null
          target_weight_kg: number | null
          time_constraints: string[] | null
          timeline_weeks: number | null
          training_frequency: number | null
          training_level: string | null
          updated_at: string | null
          user_id: string | null
          weight_kg: number | null
          workout_days: string[] | null
          workout_intensity_preference: string | null
        }
        Insert: {
          age?: number | null
          available_times?: Json | null
          body_fat_percentage?: number | null
          coaching_style?: string | null
          created_at?: string | null
          exercise_dislikes?: string[] | null
          exercise_preferences?: string[] | null
          gender?: string | null
          gym_access?: boolean | null
          height_cm?: number | null
          home_equipment?: string[] | null
          hrv_score?: number | null
          id?: string
          medical_conditions?: string[] | null
          medications?: string[] | null
          music_tempo_preference?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          pain_areas?: string[] | null
          preferred_location?: string | null
          primary_goal?: string | null
          resting_heart_rate?: number | null
          session_duration_preference?: number | null
          sleep_quality_score?: number | null
          specific_focus?: string[] | null
          stress_level?: number | null
          target_weight_kg?: number | null
          time_constraints?: string[] | null
          timeline_weeks?: number | null
          training_frequency?: number | null
          training_level?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight_kg?: number | null
          workout_days?: string[] | null
          workout_intensity_preference?: string | null
        }
        Update: {
          age?: number | null
          available_times?: Json | null
          body_fat_percentage?: number | null
          coaching_style?: string | null
          created_at?: string | null
          exercise_dislikes?: string[] | null
          exercise_preferences?: string[] | null
          gender?: string | null
          gym_access?: boolean | null
          height_cm?: number | null
          home_equipment?: string[] | null
          hrv_score?: number | null
          id?: string
          medical_conditions?: string[] | null
          medications?: string[] | null
          music_tempo_preference?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          pain_areas?: string[] | null
          preferred_location?: string | null
          primary_goal?: string | null
          resting_heart_rate?: number | null
          session_duration_preference?: number | null
          sleep_quality_score?: number | null
          specific_focus?: string[] | null
          stress_level?: number | null
          target_weight_kg?: number | null
          time_constraints?: string[] | null
          timeline_weeks?: number | null
          training_frequency?: number | null
          training_level?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight_kg?: number | null
          workout_days?: string[] | null
          workout_intensity_preference?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          error_message: string | null
          event_data: Json
          event_type: string
          id: string
          max_retries: number | null
          processed: boolean | null
          processed_at: string | null
          retry_count: number | null
          scheduled_for: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_data?: Json
          event_type: string
          id?: string
          max_retries?: number | null
          processed?: boolean | null
          processed_at?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          max_retries?: number | null
          processed?: boolean | null
          processed_at?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      exercise_categories: {
        Row: {
          color_hex: string | null
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          name: string
        }
        Insert: {
          color_hex?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name: string
        }
        Update: {
          color_hex?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      exercise_logs: {
        Row: {
          created_at: string
          difficulty_rating: number | null
          exercise_id: string | null
          form_score: number | null
          id: string
          notes: string | null
          order_index: number
          sets_completed: number | null
          workout_session_id: string | null
        }
        Insert: {
          created_at?: string
          difficulty_rating?: number | null
          exercise_id?: string | null
          form_score?: number | null
          id?: string
          notes?: string | null
          order_index: number
          sets_completed?: number | null
          workout_session_id?: string | null
        }
        Update: {
          created_at?: string
          difficulty_rating?: number | null
          exercise_id?: string | null
          form_score?: number | null
          id?: string
          notes?: string | null
          order_index?: number
          sets_completed?: number | null
          workout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_performance_history: {
        Row: {
          created_at: string
          exercise_id: string | null
          form_score: number | null
          id: string
          notes: string | null
          performance_date: string
          progressive_overload_applied: boolean | null
          reps_completed: number | null
          rest_period_seconds: number | null
          rpe_rating: number | null
          sets_completed: number | null
          time_under_tension_seconds: number | null
          user_id: string
          weight_used_kg: number | null
          workout_session_id: string | null
        }
        Insert: {
          created_at?: string
          exercise_id?: string | null
          form_score?: number | null
          id?: string
          notes?: string | null
          performance_date: string
          progressive_overload_applied?: boolean | null
          reps_completed?: number | null
          rest_period_seconds?: number | null
          rpe_rating?: number | null
          sets_completed?: number | null
          time_under_tension_seconds?: number | null
          user_id: string
          weight_used_kg?: number | null
          workout_session_id?: string | null
        }
        Update: {
          created_at?: string
          exercise_id?: string | null
          form_score?: number | null
          id?: string
          notes?: string | null
          performance_date?: string
          progressive_overload_applied?: boolean | null
          reps_completed?: number | null
          rest_period_seconds?: number | null
          rpe_rating?: number | null
          sets_completed?: number | null
          time_under_tension_seconds?: number | null
          user_id?: string
          weight_used_kg?: number | null
          workout_session_id?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          animation_url: string | null
          biomechanics_notes: string | null
          category_id: string | null
          common_mistakes: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          equipment_alternatives: Json | null
          equipment_required: Json | null
          exercise_type: string | null
          exercise_type_detailed: string | null
          form_cues: Json | null
          id: string
          injury_contraindications: string[] | null
          instructions: Json | null
          intensity_level: string | null
          is_approved: boolean | null
          is_bodyweight: boolean | null
          is_unilateral: boolean | null
          media_assets: Json | null
          met_value: number | null
          muscle_group_primary: string | null
          muscle_group_secondary: string[] | null
          name: string
          primary_muscle_groups: string[] | null
          progression_data: Json | null
          requires_spotter: boolean | null
          secondary_muscle_groups: string[] | null
          thumbnail_url: string | null
          updated_at: string
          variations: Json | null
          video_url: string | null
        }
        Insert: {
          animation_url?: string | null
          biomechanics_notes?: string | null
          category_id?: string | null
          common_mistakes?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          equipment_alternatives?: Json | null
          equipment_required?: Json | null
          exercise_type?: string | null
          exercise_type_detailed?: string | null
          form_cues?: Json | null
          id?: string
          injury_contraindications?: string[] | null
          instructions?: Json | null
          intensity_level?: string | null
          is_approved?: boolean | null
          is_bodyweight?: boolean | null
          is_unilateral?: boolean | null
          media_assets?: Json | null
          met_value?: number | null
          muscle_group_primary?: string | null
          muscle_group_secondary?: string[] | null
          name: string
          primary_muscle_groups?: string[] | null
          progression_data?: Json | null
          requires_spotter?: boolean | null
          secondary_muscle_groups?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          variations?: Json | null
          video_url?: string | null
        }
        Update: {
          animation_url?: string | null
          biomechanics_notes?: string | null
          category_id?: string | null
          common_mistakes?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          equipment_alternatives?: Json | null
          equipment_required?: Json | null
          exercise_type?: string | null
          exercise_type_detailed?: string | null
          form_cues?: Json | null
          id?: string
          injury_contraindications?: string[] | null
          instructions?: Json | null
          intensity_level?: string | null
          is_approved?: boolean | null
          is_bodyweight?: boolean | null
          is_unilateral?: boolean | null
          media_assets?: Json | null
          met_value?: number | null
          muscle_group_primary?: string | null
          muscle_group_secondary?: string[] | null
          name?: string
          primary_muscle_groups?: string[] | null
          progression_data?: Json | null
          requires_spotter?: boolean | null
          secondary_muscle_groups?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          variations?: Json | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "exercise_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          allergen_info: Json | null
          barcode: string | null
          brand: string | null
          calories_per_100g: number | null
          carbs_per_100g: number | null
          category: string | null
          created_at: string
          created_by: string | null
          dietary_labels: Json | null
          fat_per_100g: number | null
          fiber_per_100g: number | null
          food_group: string | null
          id: string
          is_verified: boolean | null
          micronutrients: Json | null
          name: string
          protein_per_100g: number | null
          serving_size_description: string | null
          serving_size_g: number | null
          serving_sizes: Json | null
          sodium_per_100g: number | null
          sugar_per_100g: number | null
          traffic_light_category: string | null
          updated_at: string
        }
        Insert: {
          allergen_info?: Json | null
          barcode?: string | null
          brand?: string | null
          calories_per_100g?: number | null
          carbs_per_100g?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          dietary_labels?: Json | null
          fat_per_100g?: number | null
          fiber_per_100g?: number | null
          food_group?: string | null
          id?: string
          is_verified?: boolean | null
          micronutrients?: Json | null
          name: string
          protein_per_100g?: number | null
          serving_size_description?: string | null
          serving_size_g?: number | null
          serving_sizes?: Json | null
          sodium_per_100g?: number | null
          sugar_per_100g?: number | null
          traffic_light_category?: string | null
          updated_at?: string
        }
        Update: {
          allergen_info?: Json | null
          barcode?: string | null
          brand?: string | null
          calories_per_100g?: number | null
          carbs_per_100g?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          dietary_labels?: Json | null
          fat_per_100g?: number | null
          fiber_per_100g?: number | null
          food_group?: string | null
          id?: string
          is_verified?: boolean | null
          micronutrients?: Json | null
          name?: string
          protein_per_100g?: number | null
          serving_size_description?: string | null
          serving_size_g?: number | null
          serving_sizes?: Json | null
          sodium_per_100g?: number | null
          sugar_per_100g?: number | null
          traffic_light_category?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      habit_tracking: {
        Row: {
          created_at: string | null
          current_streak: number | null
          habit_name: string
          habit_type: string
          id: string
          is_active: boolean | null
          longest_streak: number | null
          success_rate: number | null
          target_frequency: number
          target_unit: string | null
          target_value: number | null
          total_completions: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          habit_name: string
          habit_type: string
          id?: string
          is_active?: boolean | null
          longest_streak?: number | null
          success_rate?: number | null
          target_frequency: number
          target_unit?: string | null
          target_value?: number | null
          total_completions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          habit_name?: string
          habit_type?: string
          id?: string
          is_active?: boolean | null
          longest_streak?: number | null
          success_rate?: number | null
          target_frequency?: number
          target_unit?: string | null
          target_value?: number | null
          total_completions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      marketplace_vendors: {
        Row: {
          api_endpoint: string | null
          api_key_encrypted: string | null
          commission_rate: number | null
          contact_email: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          commission_rate?: number | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          commission_rate?: number | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          created_at: string | null
          date: string
          food_items: Json
          hunger_after: number | null
          hunger_before: number | null
          id: string
          meal_location: string | null
          meal_source: string | null
          meal_time: string | null
          meal_type: string | null
          notes: string | null
          photo_url: string | null
          satisfaction_rating: number | null
          total_calories: number | null
          total_carbs_g: number | null
          total_fat_g: number | null
          total_fiber_g: number | null
          total_protein_g: number | null
          total_sodium_mg: number | null
          total_sugar_g: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          food_items: Json
          hunger_after?: number | null
          hunger_before?: number | null
          id?: string
          meal_location?: string | null
          meal_source?: string | null
          meal_time?: string | null
          meal_type?: string | null
          notes?: string | null
          photo_url?: string | null
          satisfaction_rating?: number | null
          total_calories?: number | null
          total_carbs_g?: number | null
          total_fat_g?: number | null
          total_fiber_g?: number | null
          total_protein_g?: number | null
          total_sodium_mg?: number | null
          total_sugar_g?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          food_items?: Json
          hunger_after?: number | null
          hunger_before?: number | null
          id?: string
          meal_location?: string | null
          meal_source?: string | null
          meal_time?: string | null
          meal_type?: string | null
          notes?: string | null
          photo_url?: string | null
          satisfaction_rating?: number | null
          total_calories?: number | null
          total_carbs_g?: number | null
          total_fat_g?: number | null
          total_fiber_g?: number | null
          total_protein_g?: number | null
          total_sodium_mg?: number | null
          total_sugar_g?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      muscle_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          achievement_notifications: boolean | null
          challenge_updates: boolean | null
          created_at: string
          email_enabled: boolean | null
          id: string
          marketing_emails: boolean | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          social_notifications: boolean | null
          timezone: string | null
          updated_at: string
          user_id: string
          workout_reminders: boolean | null
        }
        Insert: {
          achievement_notifications?: boolean | null
          challenge_updates?: boolean | null
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          social_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          workout_reminders?: boolean | null
        }
        Update: {
          achievement_notifications?: boolean | null
          challenge_updates?: boolean | null
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          social_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          workout_reminders?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string
          content: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean | null
          metadata: Json | null
          notification_type: string
          scheduled_for: string | null
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category: string
          content?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          notification_type: string
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string
          content?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          notification_type?: string
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      nutrition_goals: {
        Row: {
          calories_target: number | null
          carbs_target_g: number | null
          created_at: string
          fat_target_g: number | null
          fiber_target_g: number | null
          id: string
          is_active: boolean | null
          protein_target_g: number | null
          updated_at: string
          user_id: string
          water_target_ml: number | null
        }
        Insert: {
          calories_target?: number | null
          carbs_target_g?: number | null
          created_at?: string
          fat_target_g?: number | null
          fiber_target_g?: number | null
          id?: string
          is_active?: boolean | null
          protein_target_g?: number | null
          updated_at?: string
          user_id: string
          water_target_ml?: number | null
        }
        Update: {
          calories_target?: number | null
          carbs_target_g?: number | null
          created_at?: string
          fat_target_g?: number | null
          fiber_target_g?: number | null
          id?: string
          is_active?: boolean | null
          protein_target_g?: number | null
          updated_at?: string
          user_id?: string
          water_target_ml?: number | null
        }
        Relationships: []
      }
      nutrition_logs: {
        Row: {
          calories: number | null
          carbs_g: number | null
          created_at: string
          custom_food_name: string | null
          date: string
          fat_g: number | null
          fiber_g: number | null
          food_id: string | null
          id: string
          meal_type: string
          notes: string | null
          photo_url: string | null
          protein_g: number | null
          serving_amount: number
          serving_unit: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          custom_food_name?: string | null
          date: string
          fat_g?: number | null
          fiber_g?: number | null
          food_id?: string | null
          id?: string
          meal_type: string
          notes?: string | null
          photo_url?: string | null
          protein_g?: number | null
          serving_amount: number
          serving_unit: string
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          custom_food_name?: string | null
          date?: string
          fat_g?: number | null
          fiber_g?: number | null
          food_id?: string | null
          id?: string
          meal_type?: string
          notes?: string | null
          photo_url?: string | null
          protein_g?: number | null
          serving_amount?: number
          serving_unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_logs_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_responses: {
        Row: {
          created_at: string
          id: string
          question_key: string
          response: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_key: string
          response: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_key?: string
          response?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          achieved_at: string
          created_at: string
          duration_seconds: number | null
          exercise_id: string | null
          id: string
          improvement_percentage: number | null
          previous_record: number | null
          record_type: string
          reps: number | null
          set_log_id: string | null
          user_id: string
          value: number
          weight_kg: number | null
          workout_session_id: string | null
        }
        Insert: {
          achieved_at?: string
          created_at?: string
          duration_seconds?: number | null
          exercise_id?: string | null
          id?: string
          improvement_percentage?: number | null
          previous_record?: number | null
          record_type: string
          reps?: number | null
          set_log_id?: string | null
          user_id: string
          value: number
          weight_kg?: number | null
          workout_session_id?: string | null
        }
        Update: {
          achieved_at?: string
          created_at?: string
          duration_seconds?: number | null
          exercise_id?: string | null
          id?: string
          improvement_percentage?: number | null
          previous_record?: number | null
          record_type?: string
          reps?: number | null
          set_log_id?: string | null
          user_id?: string
          value?: number
          weight_kg?: number | null
          workout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_set_log_id_fkey"
            columns: ["set_log_id"]
            isOneToOne: false
            referencedRelation: "set_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "personal_records_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      phoenix_scores: {
        Row: {
          created_at: string
          date: string
          factors: Json | null
          hrv_score: number | null
          id: string
          nutrition_score: number | null
          overall_score: number
          recommendation: string | null
          recovery_score: number | null
          sleep_score: number | null
          stress_score: number | null
          suggested_intensity: string | null
          training_load_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          factors?: Json | null
          hrv_score?: number | null
          id?: string
          nutrition_score?: number | null
          overall_score: number
          recommendation?: string | null
          recovery_score?: number | null
          sleep_score?: number | null
          stress_score?: number | null
          suggested_intensity?: string | null
          training_load_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          factors?: Json | null
          hrv_score?: number | null
          id?: string
          nutrition_score?: number | null
          overall_score?: number
          recommendation?: string | null
          recovery_score?: number | null
          sleep_score?: number | null
          stress_score?: number | null
          suggested_intensity?: string | null
          training_load_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phoenix_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          available_equipment: Json | null
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          dietary_restrictions: Json | null
          display_name: string | null
          email: string
          exercise_preferences: Json | null
          fitness_level: string | null
          gender: string | null
          height_cm: number | null
          id: string
          injury_history_summary: Json | null
          medical_conditions: Json | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          one_rep_max_estimates: Json | null
          phone_number: string | null
          preferred_workout_duration: number | null
          preferred_workout_style: string | null
          primary_goal: string | null
          timezone: string | null
          training_frequency_goal: number | null
          updated_at: string
          user_id: string
          weight_kg: number | null
          workout_frequency_per_week: number | null
        }
        Insert: {
          available_equipment?: Json | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_restrictions?: Json | null
          display_name?: string | null
          email: string
          exercise_preferences?: Json | null
          fitness_level?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          injury_history_summary?: Json | null
          medical_conditions?: Json | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          one_rep_max_estimates?: Json | null
          phone_number?: string | null
          preferred_workout_duration?: number | null
          preferred_workout_style?: string | null
          primary_goal?: string | null
          timezone?: string | null
          training_frequency_goal?: number | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
          workout_frequency_per_week?: number | null
        }
        Update: {
          available_equipment?: Json | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_restrictions?: Json | null
          display_name?: string | null
          email?: string
          exercise_preferences?: Json | null
          fitness_level?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          injury_history_summary?: Json | null
          medical_conditions?: Json | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          one_rep_max_estimates?: Json | null
          phone_number?: string | null
          preferred_workout_duration?: number | null
          preferred_workout_style?: string | null
          primary_goal?: string | null
          timezone?: string | null
          training_frequency_goal?: number | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
          workout_frequency_per_week?: number | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          cook_time_minutes: number | null
          created_at: string
          created_by: string | null
          cuisine_type: string | null
          description: string | null
          dietary_labels: Json | null
          difficulty_level: string | null
          id: string
          image_url: string | null
          ingredients: Json
          instructions: Json
          is_verified: boolean | null
          name: string
          prep_time_minutes: number | null
          servings: number | null
          total_nutrition: Json | null
          updated_at: string
        }
        Insert: {
          cook_time_minutes?: number | null
          created_at?: string
          created_by?: string | null
          cuisine_type?: string | null
          description?: string | null
          dietary_labels?: Json | null
          difficulty_level?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: Json
          is_verified?: boolean | null
          name: string
          prep_time_minutes?: number | null
          servings?: number | null
          total_nutrition?: Json | null
          updated_at?: string
        }
        Update: {
          cook_time_minutes?: number | null
          created_at?: string
          created_by?: string | null
          cuisine_type?: string | null
          description?: string | null
          dietary_labels?: Json | null
          difficulty_level?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: Json
          is_verified?: boolean | null
          name?: string
          prep_time_minutes?: number | null
          servings?: number | null
          total_nutrition?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      recovery_data: {
        Row: {
          alcohol_consumed: boolean | null
          body_temperature: number | null
          caffeine_intake: number | null
          created_at: string | null
          date: string
          energy_level: number | null
          hrv_score: number | null
          hydration_level: number | null
          id: string
          mood: number | null
          muscle_soreness: number | null
          notes: string | null
          nutrition_quality: number | null
          resting_heart_rate: number | null
          sleep_duration_hours: number | null
          sleep_interruptions: number | null
          sleep_onset_time: string | null
          sleep_quality: number | null
          stress_level: number | null
          user_id: string | null
          wake_time: string | null
        }
        Insert: {
          alcohol_consumed?: boolean | null
          body_temperature?: number | null
          caffeine_intake?: number | null
          created_at?: string | null
          date: string
          energy_level?: number | null
          hrv_score?: number | null
          hydration_level?: number | null
          id?: string
          mood?: number | null
          muscle_soreness?: number | null
          notes?: string | null
          nutrition_quality?: number | null
          resting_heart_rate?: number | null
          sleep_duration_hours?: number | null
          sleep_interruptions?: number | null
          sleep_onset_time?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          user_id?: string | null
          wake_time?: string | null
        }
        Update: {
          alcohol_consumed?: boolean | null
          body_temperature?: number | null
          caffeine_intake?: number | null
          created_at?: string | null
          date?: string
          energy_level?: number | null
          hrv_score?: number | null
          hydration_level?: number | null
          id?: string
          mood?: number | null
          muscle_soreness?: number | null
          notes?: string | null
          nutrition_quality?: number | null
          resting_heart_rate?: number | null
          sleep_duration_hours?: number | null
          sleep_interruptions?: number | null
          sleep_onset_time?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          user_id?: string | null
          wake_time?: string | null
        }
        Relationships: []
      }
      sep_activity_types: {
        Row: {
          base_points: number
          category: string | null
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          name: string
        }
        Insert: {
          base_points: number
          category?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name: string
        }
        Update: {
          base_points?: number
          category?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      sep_ledger: {
        Row: {
          activity_reference_id: string | null
          activity_type: string | null
          base_points: number | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: number
          marketplace_transaction_id: string | null
          multipliers: Json | null
          points: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          activity_reference_id?: string | null
          activity_type?: string | null
          base_points?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: number
          marketplace_transaction_id?: string | null
          multipliers?: Json | null
          points: number
          transaction_type: string
          user_id: string
        }
        Update: {
          activity_reference_id?: string | null
          activity_type?: string | null
          base_points?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: number
          marketplace_transaction_id?: string | null
          multipliers?: Json | null
          points?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sep_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      set_logs: {
        Row: {
          created_at: string
          duration_seconds: number | null
          exercise_log_id: string | null
          id: string
          is_failure: boolean | null
          is_personal_record: boolean | null
          notes: string | null
          reps: number | null
          rest_seconds: number | null
          rpe: number | null
          set_number: number
          tempo: string | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          exercise_log_id?: string | null
          id?: string
          is_failure?: boolean | null
          is_personal_record?: boolean | null
          notes?: string | null
          reps?: number | null
          rest_seconds?: number | null
          rpe?: number | null
          set_number: number
          tempo?: string | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          exercise_log_id?: string | null
          id?: string
          is_failure?: boolean | null
          is_personal_record?: boolean | null
          notes?: string | null
          reps?: number | null
          rest_seconds?: number | null
          rpe?: number | null
          set_number?: number
          tempo?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "set_logs_exercise_log_id_fkey"
            columns: ["exercise_log_id"]
            isOneToOne: false
            referencedRelation: "exercise_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      social_connections: {
        Row: {
          connection_type: string | null
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
          status: string | null
        }
        Insert: {
          connection_type?: string | null
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          connection_type?: string | null
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
          status?: string | null
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          content_data: Json
          content_type: string
          engagement_data: Json | null
          id: string
          media_urls: string[] | null
          platforms: string[]
          post_text: string | null
          shared_at: string
          user_id: string
        }
        Insert: {
          content_data?: Json
          content_type: string
          engagement_data?: Json | null
          id?: string
          media_urls?: string[] | null
          platforms?: string[]
          post_text?: string | null
          shared_at?: string
          user_id: string
        }
        Update: {
          content_data?: Json
          content_type?: string
          engagement_data?: Json | null
          id?: string
          media_urls?: string[] | null
          platforms?: string[]
          post_text?: string | null
          shared_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_profiles: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          platform_user_id: string
          platform_username: string | null
          profile_data: Json | null
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          platform_user_id: string
          platform_username?: string | null
          profile_data?: Json | null
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          platform_user_id?: string
          platform_username?: string | null
          profile_data?: Json | null
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          earned_at: string
          id: string
          progress: Json | null
          user_id: string
        }
        Insert: {
          achievement_id?: string | null
          earned_at?: string
          id?: string
          progress?: Json | null
          user_id: string
        }
        Update: {
          achievement_id?: string | null
          earned_at?: string
          id?: string
          progress?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_injury_history: {
        Row: {
          affected_area: string
          alternative_exercises: string[] | null
          contraindicated_exercises: string[] | null
          created_at: string
          id: string
          injury_type: string
          notes: string | null
          onset_date: string | null
          recovery_date: string | null
          severity: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          affected_area: string
          alternative_exercises?: string[] | null
          contraindicated_exercises?: string[] | null
          created_at?: string
          id?: string
          injury_type: string
          notes?: string | null
          onset_date?: string | null
          recovery_date?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          affected_area?: string
          alternative_exercises?: string[] | null
          contraindicated_exercises?: string[] | null
          created_at?: string
          id?: string
          injury_type?: string
          notes?: string | null
          onset_date?: string | null
          recovery_date?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_archetypes: {
        Row: {
          created_at: string
          description: string | null
          fitness_level_range: string[] | null
          id: string
          metabolic_emphasis: number | null
          name: string
          phoenix_score_range: Json | null
          primary_goals: string[] | null
          strength_emphasis: number | null
          structure_template: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          fitness_level_range?: string[] | null
          id?: string
          metabolic_emphasis?: number | null
          name: string
          phoenix_score_range?: Json | null
          primary_goals?: string[] | null
          strength_emphasis?: number | null
          structure_template?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          fitness_level_range?: string[] | null
          id?: string
          metabolic_emphasis?: number | null
          name?: string
          phoenix_score_range?: Json | null
          primary_goals?: string[] | null
          strength_emphasis?: number | null
          structure_template?: Json
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string
          duration_seconds: number | null
          exercise_id: string | null
          id: string
          is_superset: boolean | null
          is_warmup: boolean | null
          notes: string | null
          order_index: number
          reps: number | null
          reps_max: number | null
          reps_min: number | null
          rest_seconds: number | null
          sets: number
          superset_group: number | null
          weight_kg: number | null
          workout_template_id: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          exercise_id?: string | null
          id?: string
          is_superset?: boolean | null
          is_warmup?: boolean | null
          notes?: string | null
          order_index: number
          reps?: number | null
          reps_max?: number | null
          reps_min?: number | null
          rest_seconds?: number | null
          sets?: number
          superset_group?: number | null
          weight_kg?: number | null
          workout_template_id?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          exercise_id?: string | null
          id?: string
          is_superset?: boolean | null
          is_warmup?: boolean | null
          notes?: string | null
          order_index?: number
          reps?: number | null
          reps_max?: number | null
          reps_min?: number | null
          rest_seconds?: number | null
          sets?: number
          superset_group?: number | null
          weight_kg?: number | null
          workout_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_template_id_fkey"
            columns: ["workout_template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_generations: {
        Row: {
          adaptation_history: Json | null
          archetype_id: string | null
          created_at: string
          generated_workout: Json
          generation_context: Json
          id: string
          phoenix_score_at_generation: number | null
          user_feedback: Json | null
          user_id: string
        }
        Insert: {
          adaptation_history?: Json | null
          archetype_id?: string | null
          created_at?: string
          generated_workout: Json
          generation_context?: Json
          id?: string
          phoenix_score_at_generation?: number | null
          user_feedback?: Json | null
          user_id: string
        }
        Update: {
          adaptation_history?: Json | null
          archetype_id?: string | null
          created_at?: string
          generated_workout?: Json
          generation_context?: Json
          id?: string
          phoenix_score_at_generation?: number | null
          user_feedback?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      workout_programs: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          duration_weeks: number
          equipment_required: Json | null
          goal: string | null
          id: string
          is_featured: boolean | null
          name: string
          schedule: Json | null
          thumbnail_url: string | null
          updated_at: string
          workouts_per_week: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_weeks: number
          equipment_required?: Json | null
          goal?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          schedule?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          workouts_per_week?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_weeks?: number
          equipment_required?: Json | null
          goal?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          schedule?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          workouts_per_week?: number | null
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          calories_burned: number | null
          created_at: string
          duration_minutes: number | null
          end_time: string | null
          heart_rate_avg: number | null
          heart_rate_max: number | null
          id: string
          location: string | null
          name: string
          notes: string | null
          perceived_exertion: number | null
          start_time: string
          total_exercises: number | null
          total_sets: number | null
          total_volume_kg: number | null
          updated_at: string
          user_id: string
          weather: Json | null
          workout_template_id: string | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          perceived_exertion?: number | null
          start_time?: string
          total_exercises?: number | null
          total_sets?: number | null
          total_volume_kg?: number | null
          updated_at?: string
          user_id: string
          weather?: Json | null
          workout_template_id?: string | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          perceived_exertion?: number | null
          start_time?: string
          total_exercises?: number | null
          total_sets?: number | null
          total_volume_kg?: number | null
          updated_at?: string
          user_id?: string
          weather?: Json | null
          workout_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      workout_shares: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string | null
          id: string
          likes_count: number | null
          media_urls: string[] | null
          share_type: string | null
          shares_count: number | null
          user_id: string | null
          visibility: string | null
          workout_session_id: string | null
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          share_type?: string | null
          shares_count?: number | null
          user_id?: string | null
          visibility?: string | null
          workout_session_id?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          share_type?: string | null
          shares_count?: number | null
          user_id?: string | null
          visibility?: string | null
          workout_session_id?: string | null
        }
        Relationships: []
      }
      workout_templates: {
        Row: {
          created_at: string
          day_number: number | null
          description: string | null
          estimated_duration: number | null
          id: string
          name: string
          program_id: string | null
          routine_type: string | null
          total_exercises: number | null
          updated_at: string
          week_number: number | null
        }
        Insert: {
          created_at?: string
          day_number?: number | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          name: string
          program_id?: string | null
          routine_type?: string | null
          total_exercises?: number | null
          updated_at?: string
          week_number?: number | null
        }
        Update: {
          created_at?: string
          day_number?: number | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          name?: string
          program_id?: string | null
          routine_type?: string | null
          total_exercises?: number | null
          updated_at?: string
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_templates_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
