-- Schema inicial para Araujo Premiacoes.
-- Este arquivo ainda nao foi aplicado em um projeto Supabase real.

create extension if not exists pgcrypto;

create type public.app_role as enum ('user', 'admin');
create type public.raffle_status as enum ('draft', 'open', 'closed', 'completed');
create type public.winner_selection_type as enum ('manual', 'automatic');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.raffles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  winner_count integer not null check (winner_count > 0),
  status public.raffle_status not null default 'draft',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create table public.raffle_participants (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (raffle_id, user_id)
);

create table public.raffle_winners (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  selected_by public.winner_selection_type not null,
  selected_at timestamptz not null default now(),
  unique (raffle_id, user_id)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.raffles enable row level security;
alter table public.raffle_participants enable row level security;
alter table public.raffle_winners enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id or public.is_admin());

create policy "profiles_insert_own_user"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id and role = 'user');

create policy "profiles_update_own_user_data"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id or public.is_admin())
with check (public.is_admin() or ((select auth.uid()) = id and role = 'user'));

create policy "raffles_public_can_view_visible"
on public.raffles
for select
to anon, authenticated
using (status in ('open', 'closed', 'completed') or public.is_admin());

create policy "raffles_admin_insert"
on public.raffles
for insert
to authenticated
with check (public.is_admin() and created_by = (select auth.uid()));

create policy "raffles_admin_update"
on public.raffles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "raffles_admin_delete"
on public.raffles
for delete
to authenticated
using (public.is_admin());

create policy "participants_user_select_own"
on public.raffle_participants
for select
to authenticated
using ((select auth.uid()) = user_id or public.is_admin());

create policy "participants_user_insert_open_raffle"
on public.raffle_participants
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.raffles
    where raffles.id = raffle_id
      and raffles.status = 'open'
  )
);

create policy "participants_admin_delete"
on public.raffle_participants
for delete
to authenticated
using (public.is_admin());

create policy "winners_select_own_or_visible_completed"
on public.raffle_winners
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or public.is_admin()
  or exists (
    select 1
    from public.raffles
    where raffles.id = raffle_id
      and raffles.status = 'completed'
  )
);

create policy "winners_admin_insert"
on public.raffle_winners
for insert
to authenticated
with check (public.is_admin());

create policy "winners_admin_delete"
on public.raffle_winners
for delete
to authenticated
using (public.is_admin());

create policy "audit_logs_admin_select"
on public.audit_logs
for select
to authenticated
using (public.is_admin());

create policy "audit_logs_admin_insert"
on public.audit_logs
for insert
to authenticated
with check (public.is_admin() and admin_id = (select auth.uid()));
