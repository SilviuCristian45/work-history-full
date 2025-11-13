-- Create work_registrations table to store blockchain transaction metadata
create table if not exists public.work_registrations (
  id uuid primary key default gen_random_uuid(),
  employee_cnp text not null,
  employer_id uuid not null references public.users(id) on delete cascade,
  position text not null,
  salary numeric(12, 2) not null,
  start_date date not null,
  end_date date,
  tx_hash text unique not null, -- Blockchain transaction hash
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  approved_by uuid references public.users(id) on delete set null, -- Authority who approved
  approved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on work_registrations table
alter table public.work_registrations enable row level security;

-- Employers can view their own registrations
create policy "work_registrations_select_employer"
  on public.work_registrations for select
  using (auth.uid() = employer_id);

-- Employers can insert their own registrations
create policy "work_registrations_insert_employer"
  on public.work_registrations for insert
  with check (
    auth.uid() = employer_id and
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'employer'
    )
  );

-- Employees can view registrations where they are the employee
create policy "work_registrations_select_employee"
  on public.work_registrations for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and cnp = work_registrations.employee_cnp
    )
  );

-- Authorities can view all registrations
create policy "work_registrations_select_authority"
  on public.work_registrations for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'authority'
    )
  );

-- Authorities can update registrations (approve/reject)
create policy "work_registrations_update_authority"
  on public.work_registrations for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'authority'
    )
  );

-- Create indexes for faster queries
create index if not exists idx_work_registrations_employee_cnp on public.work_registrations(employee_cnp);
create index if not exists idx_work_registrations_employer_id on public.work_registrations(employer_id);
create index if not exists idx_work_registrations_tx_hash on public.work_registrations(tx_hash);
create index if not exists idx_work_registrations_status on public.work_registrations(status);
