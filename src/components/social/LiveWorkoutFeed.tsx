import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Play, 
  Users, 
  Flame, 
  Trophy, 
  Timer,
  Dumbbell,
  TrendingUp,
  Eye,
  ThumbsUp,
  Send,
  MapPin,
  Clock
} from "lucide-react";

interface WorkoutActivity {
  id: string;
  user_id: string;
  activity_type: string;
  content: string;
  metadata: any;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_live: boolean;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface LiveComment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export default function LiveWorkoutFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [workoutActivities, setWorkoutActivities] = useState<WorkoutActivity[]>([]);
  const [liveWorkouts, setLiveWorkouts] = useState<any[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

  useEffect(() => {
    loadWorkoutFeed();
    loadLiveWorkouts();
    setupRealtimeSubscription();
    
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, []);

  const setupRealtimeSubscription = () => {
    // Subscribe to real-time activity feed updates
    const channel = supabase
      .channel('workout_social_feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed',
          filter: 'activity_type=in.(workout_started,workout_completed,set_completed)'
        },
        (payload) => {
          console.log('New workout activity:', payload);
          loadWorkoutFeed(); // Refresh feed
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_interactions'
        },
        (payload) => {
          console.log('New interaction:', payload);
          if (payload.new.activity_id === selectedWorkoutId) {
            loadComments(selectedWorkoutId);
          }
        }
      )
      .subscribe();

    setRealtimeChannel(channel);
  };

  const loadWorkoutFeed = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          user_id
        `)
        .in('activity_type', ['workout_started', 'workout_completed', 'set_completed', 'achievement_unlocked'])
        .eq('privacy_level', 'public')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get user profiles for each activity
      const activitiesWithProfiles = await Promise.all(
        (data || []).map(async (activity) => {
          const { data: profile } = await supabase
            .from('enhanced_profiles')
            .select('id, user_id')
            .eq('user_id', activity.user_id)
            .single();

          return {
            ...activity,
            user_profile: {
              display_name: profile?.id || 'Anonymous User',
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user_id}`
            },
            is_live: activity.activity_type === 'workout_started' && 
                    new Date().getTime() - new Date(activity.created_at).getTime() < 3 * 60 * 60 * 1000 // 3 hours
          };
        })
      );

      setWorkoutActivities(activitiesWithProfiles);
    } catch (error) {
      console.error('Error loading workout feed:', error);
    }
  };

  const loadLiveWorkouts = async () => {
    try {
      const threeHoursAgo = new Date();
      threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          user_id
        `)
        .eq('is_public', true)
        .is('end_time', null)
        .gte('start_time', threeHoursAgo.toISOString())
        .order('start_time', { ascending: false });

      if (error) throw error;

      const liveWithProfiles = await Promise.all(
        (data || []).map(async (session) => {
          const { data: profile } = await supabase
            .from('enhanced_profiles')
            .select('id, user_id')
            .eq('user_id', session.user_id)
            .single();

          return {
            ...session,
            user_profile: {
              display_name: profile?.id || 'Anonymous User',
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user_id}`
            }
          };
        })
      );

      setLiveWorkouts(liveWithProfiles);
    } catch (error) {
      console.error('Error loading live workouts:', error);
    }
  };

  const loadComments = async (activityId: string) => {
    try {
      const { data, error } = await supabase
        .from('activity_interactions')
        .select(`
          *,
          user_id
        `)
        .eq('activity_id', activityId)
        .eq('interaction_type', 'comment')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('enhanced_profiles')
            .select('id, user_id')
            .eq('user_id', comment.user_id)
            .single();

          return {
            ...comment,
            user_profile: {
              display_name: profile?.id || 'Anonymous User',
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`
            }
          };
        })
      );

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const likeActivity = async (activityId: string) => {
    if (!user) return;

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('activity_interactions')
        .select('id')
        .eq('activity_id', activityId)
        .eq('user_id', user.id)
        .eq('interaction_type', 'like')
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('activity_interactions')
          .delete()
          .eq('id', existingLike.id);
      } else {
        // Like
        await supabase
          .from('activity_interactions')
          .insert({
            activity_id: activityId,
            user_id: user.id,
            interaction_type: 'like'
          });
      }

      // Update likes count in activities
      const { data: likesCount } = await supabase
        .from('activity_interactions')
        .select('id', { count: 'exact' })
        .eq('activity_id', activityId)
        .eq('interaction_type', 'like');

      setWorkoutActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, likes_count: likesCount?.length || 0 }
            : activity
        )
      );
    } catch (error) {
      console.error('Error liking activity:', error);
    }
  };

  const postComment = async (activityId: string) => {
    if (!user || !newComment.trim()) return;

    try {
      await supabase
        .from('activity_interactions')
        .insert({
          activity_id: activityId,
          user_id: user.id,
          interaction_type: 'comment',
          content: newComment.trim()
        });

      setNewComment("");
      loadComments(activityId);
      
      // Update comments count
      const { data: commentsCount } = await supabase
        .from('activity_interactions')
        .select('id', { count: 'exact' })
        .eq('activity_id', activityId)
        .eq('interaction_type', 'comment');

      setWorkoutActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, comments_count: commentsCount?.length || 0 }
            : activity
        )
      );

      toast({
        title: "💬 Comment Posted",
        description: "Your encouragement has been shared!"
      });
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const joinLiveWorkout = async (sessionId: string) => {
    try {
      // Subscribe to live workout updates
      const liveChannel = supabase
        .channel(`live_workout_${sessionId}`)
        .on('presence', { event: 'sync' }, () => {
          const presenceState = liveChannel.presenceState();
          console.log('Live workout viewers:', Object.keys(presenceState));
        })
        .on('broadcast', { event: 'set_completed' }, (payload) => {
          toast({
            title: "💪 Set Completed!",
            description: `${payload.exercise} - ${payload.reps} reps @ ${payload.weight}kg`
          });
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await liveChannel.track({
              user_id: user?.id,
              joined_at: new Date().toISOString()
            });
          }
        });

      toast({
        title: "👁️ Joined Live Workout",
        description: "You're now watching this workout live!"
      });
    } catch (error) {
      console.error('Error joining live workout:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workout_started': return <Play className="h-4 w-4 text-green-600" />;
      case 'workout_completed': return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 'set_completed': return <Dumbbell className="h-4 w-4 text-blue-600" />;
      case 'achievement_unlocked': return <Trophy className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Live Workouts Section */}
      {liveWorkouts.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Live Workouts
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {liveWorkouts.length} Active
              </Badge>
            </CardTitle>
            <CardDescription>
              Join others working out right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveWorkouts.map((workout) => (
                <Card key={workout.id} className="relative">
                  <div className="absolute top-2 right-2">
                    <Badge variant="destructive" className="animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                      LIVE
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={workout.user_profile?.avatar_url} />
                        <AvatarFallback>
                          {workout.user_profile?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{workout.user_profile?.display_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Started {formatTimeAgo(workout.start_time)}
                        </p>
                      </div>
                    </div>
                    <h4 className="font-semibold mb-2">{workout.name}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Timer className="h-3 w-3" />
                        {Math.floor((new Date().getTime() - new Date(workout.start_time).getTime()) / 60000)}m
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => joinLiveWorkout(workout.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Watch
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Workout Activity Feed
          </CardTitle>
          <CardDescription>
            See what the community is up to
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workoutActivities.map((activity) => (
            <Card key={activity.id} className={activity.is_live ? "border-green-200 bg-green-50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.user_profile?.avatar_url} />
                    <AvatarFallback>
                      {activity.user_profile?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.user_profile?.display_name}</span>
                      {getActivityIcon(activity.activity_type)}
                      <span className="text-sm text-muted-foreground">
                        {formatTimeAgo(activity.created_at)}
                      </span>
                      {activity.is_live && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          LIVE
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm">{activity.content}</p>
                    
                    {/* Activity metadata */}
                    {activity.metadata && (
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {activity.metadata.duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {activity.metadata.duration_minutes}m
                          </div>
                        )}
                        {activity.metadata.total_volume_kg && (
                          <div className="flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" />
                            {Math.round(activity.metadata.total_volume_kg)}kg
                          </div>
                        )}
                        {activity.metadata.calories_burned && (
                          <div className="flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            {Math.round(activity.metadata.calories_burned)} cal
                          </div>
                        )}
                        {activity.metadata.peak_heart_rate && (
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {activity.metadata.peak_heart_rate} bpm
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Interaction buttons */}
                    <div className="flex items-center gap-4 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likeActivity(activity.id)}
                        className="p-0 h-auto text-muted-foreground hover:text-red-600"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {activity.likes_count || 0}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedWorkoutId(
                            selectedWorkoutId === activity.id ? null : activity.id
                          );
                          if (selectedWorkoutId !== activity.id) {
                            loadComments(activity.id);
                          }
                        }}
                        className="p-0 h-auto text-muted-foreground hover:text-blue-600"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {activity.comments_count || 0}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto text-muted-foreground hover:text-green-600"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Comments section */}
                    {selectedWorkoutId === activity.id && (
                      <div className="mt-4 space-y-3 border-t pt-3">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex items-start gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={comment.user_profile?.avatar_url} />
                              <AvatarFallback>
                                {comment.user_profile?.display_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg px-3 py-2">
                                <p className="font-medium text-xs">
                                  {comment.user_profile?.display_name}
                                </p>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatTimeAgo(comment.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {user && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add encouragement..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  postComment(activity.id);
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => postComment(activity.id)}
                              disabled={!newComment.trim()}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {workoutActivities.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
              <p className="text-muted-foreground">
                Be the first to share a workout with the community!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}