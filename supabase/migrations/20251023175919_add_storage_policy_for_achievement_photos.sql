CREATE POLICY "Allow authenticated users to upload photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'achievement-photos');
