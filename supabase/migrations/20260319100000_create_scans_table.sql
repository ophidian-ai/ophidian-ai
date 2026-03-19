create table public.scans (
  id uuid default gen_random_uuid() primary key,
  scan_id text unique not null,
  url text not null,
  url_hash text not null,
  email text,
  score integer,
  grade text,
  results_json jsonb not null default '{}'::jsonb,
  status text not null default 'completed',
  scanned_at timestamptz default now() not null,
  viewed_at timestamptz,
  created_at timestamptz default now() not null
);

create index idx_scans_url_hash on public.scans (url_hash);
create index idx_scans_scan_id on public.scans (scan_id);
create index idx_scans_url_hash_created on public.scans (url_hash, created_at desc);

alter table public.scans enable row level security;

create policy "Public can read scans by scan_id"
  on public.scans for select
  using (true);

create policy "Service role can insert scans"
  on public.scans for insert
  with check (true);

create policy "Service role can update scans"
  on public.scans for update
  using (true);
