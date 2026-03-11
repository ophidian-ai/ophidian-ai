-- Add phone column to profiles table for client account setup
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
