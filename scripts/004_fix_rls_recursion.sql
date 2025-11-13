-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_select_authority" ON public.users;

-- Disable RLS on users table since we handle authorization at API level
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Note: Authorization for user data is handled in the API routes
-- Each route checks the user's role and permissions before returning data
