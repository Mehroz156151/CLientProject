-- NEXUS CONTROL — migration 3: verification activity log
-- Run this once in the Supabase SQL editor (after migration_2_auth.sql).
-- Powers the real "Derniers contrôles" / stats feed on the home page —
-- one row is inserted every time a QR/card lookup successfully resolves
-- to a player during a verification.

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
