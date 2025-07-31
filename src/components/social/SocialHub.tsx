/**
 * Social Authentication & Sharing Hub
 * Manage connected social accounts and share fitness content
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Share2, 
  Plus, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin,
  Chrome,
  Users,
  TrendingUp,
  Heart,
  MessageCircle,
  Send,
  Settings,
  Check,
  ExternalLink
} from "lucide-react";

interface SocialProfile {
  id: string;
  platform: string;
  platform_username: string;
  is_active: boolean;
  profile_data: any;
}

interface ShareableContent {
  type: 'workout' | 'progress' | 'achievement';
  title: string;
  description: string;
  data: any;
}

const SOCIAL_PLATFORMS = [
  { id: 'google', name: 'Google', icon: Chrome, color: 'bg-red-500', authType: 'oauth' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600', authType: 'oauth' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500', authType: 'oauth' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'bg-gray-900', authType: 'oauth' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', authType: 'oauth' }
];

export function SocialHub() {
  const [connectedProfiles, setConnectedProfiles] = useState<SocialProfile[]>([]);
  const [shareContent, setShareContent] = useState<ShareableContent | null>(null);
  const [shareText, setShareText] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConnectedProfiles();
    }
  }, [user]);

  const loadConnectedProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      setConnectedProfiles(data || []);
    } catch (error: any) {
      console.error('Error loading social profiles:', error);
    }
  };

  const connectPlatform = async (platform: string) => {
    try {
      if (platform === 'google') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/social-callback`,
            scopes: 'openid email profile'
          }
        });
        if (error) throw error;
      } else {
        // For other platforms, we'd implement similar OAuth flows
        toast({
          title: "Coming Soon",
          description: `${platform} integration will be available soon!`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const shareToSocial = async () => {
    if (!shareContent || selectedPlatforms.length === 0) return;

    setLoading(true);
    try {
      // Call social sharing edge function
      const { data, error } = await supabase.functions.invoke('social-share', {
        body: {
          content: shareContent,
          platforms: selectedPlatforms,
          text: shareText
        }
      });

      if (error) throw error;

      toast({
        title: "Shared Successfully!",
        description: `Content shared to ${selectedPlatforms.length} platform(s)`,
      });

      // Log the share
      await supabase.from('social_posts').insert({
        user_id: user?.id,
        content_type: shareContent.type,
        content_data: shareContent.data,
        platforms: selectedPlatforms,
        post_text: shareText
      });

      setShareContent(null);
      setShareText("");
      setSelectedPlatforms([]);

    } catch (error: any) {
      toast({
        title: "Share Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const mockShareContent: ShareableContent = {
    type: 'workout',
    title: 'Crushed my workout today! 💪',
    description: 'Phoenix Protocol - Upper Body Strength',
    data: {
      exercises: 6,
      duration: '45 min',
      calories: 280,
      volume: '12,450 lbs'
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <Share2 className="h-8 w-8 text-primary" />
          Social Hub
        </h2>
        <p className="text-lg text-muted-foreground">
          Connect your social accounts and share your fitness journey
        </p>
      </div>

      <Tabs defaultValue="connect" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connect">Connected Accounts</TabsTrigger>
          <TabsTrigger value="share">Share Content</TabsTrigger>
          <TabsTrigger value="activity">Social Activity</TabsTrigger>
        </TabsList>

        {/* Connected Accounts */}
        <TabsContent value="connect" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOCIAL_PLATFORMS.map((platform) => {
              const isConnected = connectedProfiles.some(p => p.platform === platform.id);
              const IconComponent = platform.icon;
              
              return (
                <Card key={platform.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${platform.color}`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{platform.name}</h3>
                          {isConnected && (
                            <p className="text-sm text-muted-foreground">
                              @{connectedProfiles.find(p => p.platform === platform.id)?.platform_username}
                            </p>
                          )}
                        </div>
                      </div>
                      {isConnected && (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => connectPlatform(platform.id)}
                      disabled={isConnected}
                      className="w-full"
                      variant={isConnected ? "outline" : "default"}
                    >
                      {isConnected ? (
                        <>
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Share Content */}
        <TabsContent value="share" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Progress</CardTitle>
              <CardDescription>
                Share workouts, achievements, and progress with your followers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mock shareable content */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold text-lg mb-2">{mockShareContent.title}</h3>
                <p className="text-muted-foreground mb-3">{mockShareContent.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{mockShareContent.data.exercises}</div>
                    <div className="text-muted-foreground">Exercises</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{mockShareContent.data.duration}</div>
                    <div className="text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{mockShareContent.data.calories}</div>
                    <div className="text-muted-foreground">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{mockShareContent.data.volume}</div>
                    <div className="text-muted-foreground">Volume</div>
                  </div>
                </div>
              </div>

              {/* Custom share text */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Share Message</label>
                <Textarea
                  placeholder="Add your own message to share with this content..."
                  value={shareText}
                  onChange={(e) => setShareText(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Platform selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Select Platforms</label>
                <div className="space-y-2">
                  {SOCIAL_PLATFORMS.map((platform) => {
                    const isConnected = connectedProfiles.some(p => p.platform === platform.id);
                    const isSelected = selectedPlatforms.includes(platform.id);
                    const IconComponent = platform.icon;
                    
                    return (
                      <div key={platform.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${platform.color}`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium">{platform.name}</span>
                          {!isConnected && (
                            <Badge variant="outline" className="text-xs">
                              Not Connected
                            </Badge>
                          )}
                        </div>
                        <Switch
                          checked={isSelected}
                          disabled={!isConnected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPlatforms([...selectedPlatforms, platform.id]);
                            } else {
                              setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                            }
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button 
                onClick={() => {
                  setShareContent(mockShareContent);
                  shareToSocial();
                }}
                disabled={loading || selectedPlatforms.length === 0}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sharing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Share to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Activity */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Social Activity
              </CardTitle>
              <CardDescription>
                Track engagement and performance of your shared content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock social posts */}
                {[
                  { platform: 'twitter', content: 'Just crushed my Phoenix Protocol workout! 💪', likes: 23, comments: 5, shares: 3 },
                  { platform: 'instagram', content: 'Progress pic from my 8-week transformation', likes: 89, comments: 12, shares: 7 },
                  { platform: 'facebook', content: 'New personal record on deadlifts today!', likes: 34, comments: 8, shares: 2 }
                ].map((post, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {post.platform === 'twitter' && <Twitter className="h-4 w-4" />}
                        {post.platform === 'instagram' && <Instagram className="h-4 w-4" />}
                        {post.platform === 'facebook' && <Facebook className="h-4 w-4" />}
                        <span className="font-medium capitalize">{post.platform}</span>
                      </div>
                      <Badge variant="outline">2 hours ago</Badge>
                    </div>
                    <p className="text-sm mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        <span>{post.shares}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}