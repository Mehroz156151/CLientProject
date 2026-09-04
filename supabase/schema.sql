-- NEXUS CONTROL — player profile schema
-- Run this once in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

create type player_status as enum ('valid', 'suspended', 'revoked');
create type activity_type as enum ('TAXI', 'VTC', 'TRANSPORT', 'AUTRE');

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  qr_token text unique not null,
  card_number text unique not null,
  full_name text not null,
  date_of_birth date,
  activity activity_type not null default 'VTC',
  agency text,
  avatar_url text,
  vehicle_plate text,
  vehicle_model text,
  issued_at date not null default current_date,
  expires_at date not null default (current_date + interval '5 years'),
  status player_status not null default 'valid',
  created_at timestamptz not null default now()
);

create index if not exists players_qr_token_idx on players (qr_token);
create index if not exists players_card_number_idx on players (card_number);
create index if not exists players_user_id_idx on players (user_id);

-- Row Level Security: this app only reads/writes through the server
-- (service role key), so the table stays locked down from the browser.
alter table players enable row level security;

-- Public bucket for player avatar photos, uploaded through the app's
-- server-side upload route (never written to directly from the browser).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Verification activity log — one row per successful QR/card lookup.
-- Powers the real "Derniers contrôles" / stats feed on the home page.
create table if not exists verification_logs (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  status player_status not null,
  verification_type text not null default 'vtc',
  checked_by uuid references auth.users(id) on delete set null,
  checked_at timestamptz not null default now()
);

create index if not exists verification_logs_checked_at_idx on verification_logs (checked_at desc);
create index if not exists verification_logs_player_id_idx on verification_logs (player_id);

alter table verification_logs enable row level security;
