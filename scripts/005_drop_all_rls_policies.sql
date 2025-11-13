-- Drop all RLS policies and disable RLS on all tables

-- Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all policies on users table
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_select_authority" ON public.users;

-- Disable RLS on work_registrations table
ALTER TABLE public.work_registrations DISABLE ROW LEVEL SECURITY;

-- Drop all policies on work_registrations table
DROP POLICY IF EXISTS "work_registrations_select_employee" ON public.work_registrations;
DROP POLICY IF EXISTS "work_registrations_select_employer" ON public.work_registrations;
DROP POLICY IF EXISTS "work_registrations_insert_employer" ON public.work_registrations;
DROP POLICY IF EXISTS "work_registrations_update_employer" ON public.work_registrations;
DROP POLICY IF EXISTS "work_registrations_select_authority" ON public.work_registrations;
DROP POLICY IF EXISTS "work_registrations_update_authority" ON public.work_registrations;

-- Disable RLS on employees table
ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;

-- Drop all policies on employees table
DROP POLICY IF EXISTS "employees_select_employer" ON public.employees;
DROP POLICY IF EXISTS "employees_insert_employer" ON public.employees;
DROP POLICY IF EXISTS "employees_update_employer" ON public.employees;
DROP POLICY IF EXISTS "employees_delete_employer" ON public.employees;
DROP POLICY IF EXISTS "employees_select_authority" ON public.employees;

-- Drop the security definer functions (no longer needed without RLS)
DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS get_user_cnp() CASCADE;
DROP FUNCTION IF EXISTS is_employer() CASCADE;
DROP FUNCTION IF EXISTS is_authority() CASCADE;
