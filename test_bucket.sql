-- Test script to verify bucket exists and is accessible
-- This can be run in the Supabase SQL editor

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'opportunity-thumbnails';

-- Test if we can list objects (should return empty if bucket exists and is accessible)
SELECT * FROM storage.objects WHERE bucket_id = 'opportunity-thumbnails' LIMIT 1;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND cmd IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE');
