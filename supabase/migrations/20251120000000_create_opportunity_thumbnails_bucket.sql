-- Create storage bucket for opportunity thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'opportunity-thumbnails',
  'opportunity-thumbnails',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Set up Row Level Security (RLS) policies for the bucket
-- Allow anyone to view thumbnails
CREATE POLICY "Anyone can view opportunity thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'opportunity-thumbnails');

-- Allow authenticated users to upload thumbnails
CREATE POLICY "Authenticated users can upload opportunity thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'opportunity-thumbnails' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to update their own uploaded thumbnails
CREATE POLICY "Users can update their own opportunity thumbnails" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'opportunity-thumbnails' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own uploaded thumbnails
CREATE POLICY "Users can delete their own opportunity thumbnails" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'opportunity-thumbnails' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Also allow service role to manage all objects (for backend operations)
CREATE POLICY "Service role can manage all opportunity thumbnails" ON storage.objects
  FOR ALL USING (
    bucket_id = 'opportunity-thumbnails' AND 
    auth.role() = 'service_role'
  );
