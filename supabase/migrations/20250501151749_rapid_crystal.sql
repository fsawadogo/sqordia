/*
  # Create avatar storage and policies

  1. New Storage Bucket
    - 'avatars' bucket for storing user profile pictures
  2. Security
    - Enable RLS on the bucket
    - Add policies for authenticated users to manage their own avatars
    - Public read access for profile pictures
*/

-- Create a new storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to manage their own avatars
CREATE POLICY "Users can update and delete their own avatars"
ON storage.objects FOR UPDATE, DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow public to read all avatars
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');