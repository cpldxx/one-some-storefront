-- Create user_blocks table for blocking users
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Add FK for blocked_id → profiles.id (for Supabase join)
ALTER TABLE user_blocks
ADD CONSTRAINT fk_blocked_profile
FOREIGN KEY (blocked_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);

-- Enable RLS
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicate errors
DROP POLICY IF EXISTS "Users can view their own blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can block others" ON user_blocks;
DROP POLICY IF EXISTS "Users can unblock" ON user_blocks;

-- Policy: Users can view their own blocks
CREATE POLICY "Users can view their own blocks"
ON user_blocks FOR SELECT
TO authenticated
USING (auth.uid() = blocker_id);

-- Policy: Users can block others
CREATE POLICY "Users can block others"
ON user_blocks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = blocker_id AND auth.uid() != blocked_id);

-- Policy: Users can unblock
CREATE POLICY "Users can unblock"
ON user_blocks FOR DELETE
TO authenticated
USING (auth.uid() = blocker_id);