CREATE POLICY "Allow public access to photos" ON storage.objects FOR SELECT USING (bucket_id = 'achievement-photos');
