-- NEXUS CONTROL — migration 2: player accounts + avatar storage
-- Run this once in the Supabase SQL editor (after schema.sql).

alter table players
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists players_user_id_idx on players (user_id);

-- Public bucket for player avatar photos, uploaded through the app's
-- server-side upload route (never written to directly from the browser).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
