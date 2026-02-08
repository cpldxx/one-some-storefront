-- Create user_follows table for following users
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Add FK for following_id → profiles.id (for Supabase join)
ALTER TABLE user_follows
ADD CONSTRAINT fk_following_profile
FOREIGN KEY (following_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add FK for follower_id → profiles.id (for Supabase join)
ALTER TABLE user_follows
ADD CONSTRAINT fk_follower_profile
FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- Enable RLS
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicate errors
DROP POLICY IF EXISTS "Users can view all follows" ON user_follows;
DROP POLICY IF EXISTS "Users can follow others" ON user_follows;
DROP POLICY IF EXISTS "Users can unfollow" ON user_follows;

-- Policy: Anyone can view follows (public follower/following counts)
CREATE POLICY "Users can view all follows"
ON user_follows FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can follow others (not themselves)
CREATE POLICY "Users can follow others"
ON user_follows FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = follower_id AND auth.uid() != following_id);

-- Policy: Users can unfollow
CREATE POLICY "Users can unfollow"
ON user_follows FOR DELETE
TO authenticated
USING (auth.uid() = follower_id);
