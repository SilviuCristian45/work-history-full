-- Create employees table to manage employer-employee relationships
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.users(id) on delete cascade,
  employee_cnp text not null,
  employee_name text not null,
  current_position text,
  current_salary numeric(12, 2),
  hire_date date,
  status text not null check (status in ('active', 'inactive')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(employer_id, employee_cnp)
);

-- Enable RLS on employees table
alter table public.employees enable row level security;

-- Employers can view their own employees
create policy "employees_select_employer"
  on public.employees for select
  using (auth.uid() = employer_id);

-- Employers can insert their own employees
create policy "employees_insert_employer"
  on public.employees for insert
  with check (
    auth.uid() = employer_id and
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'employer'
    )
  );

-- Employers can update their own employees
create policy "employees_update_employer"
  on public.employees for update
  using (auth.uid() = employer_id);

-- Employers can delete their own employees
create policy "employees_delete_employer"
  on public.employees for delete
  using (auth.uid() = employer_id);

-- Create indexes for faster queries
create index if not exists idx_employees_employer_id on public.employees(employer_id);
create index if not exists idx_employees_cnp on public.employees(employee_cnp);
create index if not exists idx_employees_status on public.employees(status);
