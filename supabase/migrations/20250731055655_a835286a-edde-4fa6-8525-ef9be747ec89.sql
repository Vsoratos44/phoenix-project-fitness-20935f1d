-- Create social profiles table to store connected social accounts
CREATE TABLE public.social_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('google', 'facebook', 'instagram', 'twitter', 'linkedin')),
  platform_user_id TEXT NOT NULL,
  platform_username TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  profile_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE public.social_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own social profiles" 
ON public.social_profiles 
FOR ALL 
USING (user_id = auth.uid());

-- Create social posts table for tracking shared content
CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('workout', 'progress', 'achievement', 'custom')),
  content_data JSONB NOT NULL DEFAULT '{}',
  platforms TEXT[] NOT NULL DEFAULT '{}',
  post_text TEXT,
  media_urls TEXT[] DEFAULT '{}',
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  engagement_data JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Create policies  
CREATE POLICY "Users can manage their own social posts"
ON public.social_posts
FOR ALL
USING (user_id = auth.uid());

-- Create triggers for timestamp updates
CREATE TRIGGER update_social_profiles_updated_at
BEFORE UPDATE ON public.social_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create activity feed enhancements for social features
ALTER TABLE public.activity_feed 
ADD COLUMN IF NOT EXISTS social_shares JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_shareable BOOLEAN DEFAULT true;