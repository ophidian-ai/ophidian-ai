-- Newsletter subscribers table
-- Run this in the Supabase SQL Editor to create the table

create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  subscribed_at timestamptz default now() not null,
  source text default 'website',
  unsubscribed_at timestamptz
);

-- Enable RLS
alter table public.newsletter_subscribers enable row level security;

-- Allow inserts from the anon key (public signups)
create policy "Allow public newsletter signups"
  on public.newsletter_subscribers
  for insert
  to anon
  with check (true);

-- Only service role can read/update/delete
create policy "Service role full access"
  on public.newsletter_subscribers
  for all
  to service_role
  using (true)
  with check (true);

-- Index for fast duplicate checks
create index if not exists idx_newsletter_email on public.newsletter_subscribers (email);
