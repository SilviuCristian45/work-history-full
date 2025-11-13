-- ============================================
-- COMPLETE DATABASE SETUP - RUN THIS FIRST
-- ============================================
-- This script sets up the entire database schema
-- Drop and recreate to fix any existing issues

-- Clean up existing tables
DROP TABLE IF EXISTS public.work_registrations CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================
-- USERS TABLE
-- ============================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  cnp text unique, -- Romanian Personal Numeric Code
  role text not null check (role in ('employee', 'employer', 'authority')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NO RLS on users table - authorization handled at API level
-- This prevents infinite recursion when policies try to check roles

-- Create indexes for faster queries
create index idx_users_cnp on public.users(cnp);
create index idx_users_role on public.users(role);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, cnp, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'cnp', null),
    coalesce(new.raw_user_meta_data ->> 'role', 'employee')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================
-- EMPLOYEES TABLE (Employer-Employee relationship)
-- ============================================
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.users(id) on delete cascade,
  employee_cnp text not null,
  employee_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(employer_id, employee_cnp)
);

-- Enable RLS on employees table
alter table public.employees enable row level security;

-- Employers can view their own employees
create policy "employees_select_own"
  on public.employees for select
  using (auth.uid() = employer_id);

-- Employers can insert their own employees
create policy "employees_insert_own"
  on public.employees for insert
  with check (auth.uid() = employer_id);

-- Employers can delete their own employees
create policy "employees_delete_own"
  on public.employees for delete
  using (auth.uid() = employer_id);

-- Create indexes
create index idx_employees_employer on public.employees(employer_id);
create index idx_employees_cnp on public.employees(employee_cnp);

-- ============================================
-- WORK REGISTRATIONS TABLE
-- ============================================
create table public.work_registrations (
  id uuid primary key default gen_random_uuid(),
  employee_cnp text not null,
  employer_id uuid not null references public.users(id) on delete cascade,
  position text not null,
  salary numeric(10, 2) not null,
  start_date date not null,
  end_date date,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  blockchain_tx_hash text unique,
  blockchain_approved_tx_hash text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on work_registrations table
alter table public.work_registrations enable row level security;

-- Employees can view their own registrations (by CNP match via users table)
-- We use a security definer function to avoid recursion
create or replace function public.get_user_cnp(user_id uuid)
returns text
language sql
security definer
stable
as $$
  select cnp from public.users where id = user_id limit 1;
$$;

create policy "work_registrations_select_employee"
  on public.work_registrations for select
  using (employee_cnp = public.get_user_cnp(auth.uid()));

-- Employers can view registrations for their employees
create policy "work_registrations_select_employer"
  on public.work_registrations for select
  using (auth.uid() = employer_id);

-- Employers can insert work registrations
create policy "work_registrations_insert_employer"
  on public.work_registrations for insert
  with check (auth.uid() = employer_id);

-- Employers can update their own work registrations (only if pending)
create policy "work_registrations_update_employer"
  on public.work_registrations for update
  using (auth.uid() = employer_id and status = 'pending');

-- Authorities can view all registrations
-- We use a security definer function to check role
create or replace function public.is_authority()
returns boolean
language sql
security definer
stable
as $$
  select exists(
    select 1 from public.users 
    where id = auth.uid() and role = 'authority'
  );
$$;

create policy "work_registrations_select_authority"
  on public.work_registrations for select
  using (public.is_authority());

-- Authorities can update registrations (for approval/rejection)
create policy "work_registrations_update_authority"
  on public.work_registrations for update
  using (public.is_authority());

-- Create indexes
create index idx_work_registrations_employee_cnp on public.work_registrations(employee_cnp);
create index idx_work_registrations_employer_id on public.work_registrations(employer_id);
create index idx_work_registrations_status on public.work_registrations(status);
create index idx_work_registrations_blockchain_tx on public.work_registrations(blockchain_tx_hash);

-- ============================================
-- SETUP COMPLETE
-- ============================================
