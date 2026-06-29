-- personas: one per user, reusable across sessions
create table personas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  cuisine_prefs text[] default '{}',
  interests text[] default '{}',
  dietary_restrictions text[] default '{}',
  allergies text[] default '{}',
  budget_band int default 2 check (budget_band between 1 and 4),
  has_kids bool default false,
  has_pets bool default false,
  home_lat double precision, home_lng double precision,
  updated_at timestamptz default now()
);

create type session_status as enum ('collecting','generating','proposed','confirmed','closed');

create table sessions (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status session_status not null default 'collecting',
  anchor_lat double precision, anchor_lng double precision,
  date_range_start timestamptz, date_range_end timestamptz,
  invite_token text unique,
  invite_expires_at timestamptz,
  created_at timestamptz default now()
);

create table session_members (
  session_id uuid references sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('organizer','member')),
  prefs_override jsonb,
  joined_at timestamptz default now(),
  primary key (session_id, user_id)
);

create table availability (
  session_id uuid references sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  slots jsonb not null default '[]',
  submitted_at timestamptz default now(),
  primary key (session_id, user_id)
);

create table recommendations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  generated_at timestamptz default now(),
  model_version text,
  chosen_time text,
  payload jsonb not null,
  source text check (source in ('ai','rules'))
);

create table place_cache (
  place_id text primary key,
  data jsonb not null,
  fetched_at timestamptz default now()
);

-- RLS helpers
create or replace function is_session_member(sid uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from session_members
                 where session_id = sid and user_id = auth.uid());
$$;

create or replace function is_session_organizer(sid uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from session_members
                 where session_id = sid and user_id = auth.uid() and role = 'organizer');
$$;

alter table personas enable row level security;
create policy "own persona" on personas for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table sessions enable row level security;
create policy "read sessions i'm in" on sessions for select using (is_session_member(id));
create policy "create sessions" on sessions for insert with check (created_by = auth.uid());
create policy "organizer edits" on sessions for update using (is_session_organizer(id));
create policy "organizer deletes" on sessions for delete using (is_session_organizer(id));

alter table session_members enable row level security;
create policy "read members of my sessions" on session_members for select using (is_session_member(session_id));
create policy "organizer manages members" on session_members for all
  using (is_session_organizer(session_id) or user_id = auth.uid());

alter table availability enable row level security;
create policy "members read availability" on availability for select using (is_session_member(session_id));
create policy "edit own availability" on availability for all
  using (user_id = auth.uid() and is_session_member(session_id))
  with check (user_id = auth.uid() and is_session_member(session_id));

alter table recommendations enable row level security;
create policy "members read recs" on recommendations for select using (is_session_member(session_id));
