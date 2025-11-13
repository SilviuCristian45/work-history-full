-- Create users table in public schema for user management
-- This extends the auth.users with application-specific data
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  cnp text unique, -- Romanian Personal Numeric Code
  role text not null check (role in ('employee', 'employer', 'authority')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users table
alter table public.users enable row level security;

-- Users can view their own profile
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

-- Users can update their own profile (except role)
create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- Fixed infinite recursion by using auth.jwt() instead of querying users table
-- Authorities can view all users
create policy "users_select_authority"
  on public.users for select
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'authority'
  );

-- Create index for faster queries
create index if not exists idx_users_cnp on public.users(cnp);
create index if not exists idx_users_role on public.users(role);

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

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
