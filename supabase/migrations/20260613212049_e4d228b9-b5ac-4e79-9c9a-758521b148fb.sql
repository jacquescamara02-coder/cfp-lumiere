
CREATE POLICY "Admins can upload training assets" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'training-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update training assets" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'training-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete training assets" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'training-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can read training assets" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'training-assets');
