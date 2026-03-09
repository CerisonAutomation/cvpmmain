
-- User roles enum and table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: admins can read roles
CREATE POLICY "Admins can read roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- Update cms_pages write policy: allow authenticated admins
DROP POLICY IF EXISTS "Service role writes" ON public.cms_pages;

CREATE POLICY "Service role writes"
ON public.cms_pages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin writes cms_pages"
ON public.cms_pages
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Same for site config
DROP POLICY IF EXISTS "Service role writes config" ON public.cms_site_config;

CREATE POLICY "Service role writes config"
ON public.cms_site_config
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin writes config"
ON public.cms_site_config
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
