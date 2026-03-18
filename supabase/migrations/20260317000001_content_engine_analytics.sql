-- Content Engine v2: per-post platform engagement metrics

alter table content_posts
  add column if not exists platform_metrics jsonb;

comment on column content_posts.platform_metrics is
  'Per-platform engagement data. Shape: { facebook: { likes, shares, comments, reach }, instagram: { likes, saves, comments, reach }, linkedin: { likes, shares, comments, reach }, tiktok: { likes, views, shares, comments } }';
