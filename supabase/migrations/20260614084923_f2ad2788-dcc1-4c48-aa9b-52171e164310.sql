
-- Restrict storage read on training-assets to admins or learners with granted access
DROP POLICY IF EXISTS "Authenticated can read training assets" ON storage.objects;
CREATE POLICY "Granted users can read training assets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'training-assets'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND access_granted = true
    )
  )
);

-- Lock down trigger function: it should never be callable from API roles
REVOKE EXECUTE ON FUNCTION public.prevent_self_access_grant() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
