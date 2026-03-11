-- Migration v3: Add onboarding_completed column and remove defaults from goal/activity_level

-- Add onboarding_completed column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Remove default values from goal and activity_level columns
ALTER TABLE profiles ALTER COLUMN goal DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN activity_level DROP DEFAULT;
