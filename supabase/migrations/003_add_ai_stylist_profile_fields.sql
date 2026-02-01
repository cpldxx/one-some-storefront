-- Add AI Stylist fields to profiles table if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'unisex';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS style_preferences TEXT[];
