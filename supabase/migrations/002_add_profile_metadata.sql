-- Add new columns to profiles table for user metadata

-- Add height column (in cm)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height INTEGER;

-- Add weight column (in kg)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight INTEGER;

-- Add preferred_styles column (array of style names)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_styles TEXT[] DEFAULT '{}';

-- Allow users to insert their own profile on signup
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Update the upsert policy to handle new columns
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
