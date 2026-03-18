-- Content Engine: batches and posts for social media content management

create type content_batch_status as enum ('draft', 'review', 'approved', 'scheduled', 'published');
create type content_platform as enum ('facebook', 'instagram', 'linkedin', 'tiktok');
create type content_pillar as enum ('proof_of_work', 'ai_education', 'website_tips', 'showcase', 'local_relevance', 'behind_the_scenes');
create type image_source as enum ('compositor', 'excalidraw', 'nano_banana', 'pexels');

create table content_batches (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete set null,
  batch_label text not null,
  status content_batch_status not null default 'draft',
  period_start date not null,
  period_end date not null,
  post_count int not null default 0,
  created_at timestamptz default now() not null,
  approved_at timestamptz,
  published_at timestamptz
);

create table content_posts (
  id uuid default gen_random_uuid() primary key,
  batch_id uuid not null references content_batches(id) on delete cascade,
  post_number int not null,
  pillar content_pillar not null,
  hook text not null,
  body text not null,
  cta text not null default '',
  hashtags text[] not null default '{}',
  platforms content_platform[] not null default '{facebook,instagram,linkedin,tiktok}',
  image_source image_source not null,
  image_prompt text,
  image_urls jsonb,
  scheduled_date date,
  published_urls jsonb,
  created_at timestamptz default now() not null
);

-- Indexes
create index idx_content_batches_client on content_batches(client_id);
create index idx_content_batches_status on content_batches(status);
create index idx_content_posts_batch on content_posts(batch_id);

-- RLS
alter table content_batches enable row level security;
alter table content_posts enable row level security;

-- Admin can do everything
create policy "admin_content_batches" on content_batches
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_content_posts" on content_posts
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Clients can read their own batches and posts
create policy "client_read_batches" on content_batches
  for select using (
    client_id in (
      select c.id from clients c
      join profiles p on p.id = c.profile_id
      where p.id = auth.uid()
    )
  );

create policy "client_read_posts" on content_posts
  for select using (
    batch_id in (
      select cb.id from content_batches cb
      join clients c on c.id = cb.client_id
      join profiles p on p.id = c.profile_id
      where p.id = auth.uid()
    )
  );
