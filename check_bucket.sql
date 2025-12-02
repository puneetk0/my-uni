-- Check if bucket exists and permissions are set correctly
SELECT * FROM storage.buckets WHERE id = 'opportunity-thumbnails';

-- Check RLS policies for the bucket
SELECT * FROM pg_policies WHERE tablename = 'objects' AND cmd IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE');
