-- Run this in Supabase → SQL Editor → New query

-- Jobs table
create table if not exists jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  customer_name text not null,
  job_type text not null,
  location text not null,
  description text default '',
  status text not null default 'enquiry' check (status in ('enquiry','quoted','scheduled','in_progress','awaiting_invoice','paid')),
  priority text not null default 'medium' check (priority in ('high','medium','low')),
  visit_count integer not null default 0,
  total_visits integer,
  amount numeric(10,2),
  phone text
);

-- Enable Row Level Security (users only see their own jobs)
alter table jobs enable row level security;

-- Policy: users can only read/write their own jobs
create policy "Users manage own jobs"
  on jobs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
