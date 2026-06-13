
-- Allow service_role to bypass the access_granted guard
CREATE OR REPLACE FUNCTION public.prevent_self_access_grant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.access_granted IS DISTINCT FROM OLD.access_granted
     AND auth.uid() IS NOT NULL
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only administrators can change access_granted';
  END IF;
  RETURN NEW;
END;
$function$;

-- Grant access to the admin account
UPDATE public.profiles
SET access_granted = true, status = 'active'
WHERE id = '4189a0cd-995c-4a79-9cf1-28ec2fd0f7f3';
