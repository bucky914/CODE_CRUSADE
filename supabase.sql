-- Run this in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  pass_no text not null check (char_length(btrim(pass_no)) between 1 and 50),
  started_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  status text not null default 'started' check (status in ('started', 'expired')),
  constraint participants_pass_no_key unique (pass_no)
);

create index if not exists participants_started_at_idx on public.participants (started_at);

-- Prevent the browser from rewriting the competition start time or identity.
create or replace function public.protect_participant_attempt()
returns trigger language plpgsql as $$
begin
  if new.id <> old.id or new.name <> old.name or new.pass_no <> old.pass_no
     or new.started_at <> old.started_at or new.created_at <> old.created_at then
    raise exception 'Participant attempt details cannot be changed';
  end if;
  if old.status = 'expired' and new.status <> 'expired' then
    raise exception 'An expired attempt cannot be reopened';
  end if;
  return new;
end; $$;
drop trigger if exists protect_participant_attempt_trigger on public.participants;
create trigger protect_participant_attempt_trigger before update on public.participants
for each row execute function public.protect_participant_attempt();

alter table public.participants enable row level security;
grant usage on schema public to anon;
grant insert, select, update on public.participants to anon;
create policy "anonymous registration" on public.participants for insert to anon with check (status = 'started');
-- With no Auth in V1, the UUID stored locally acts as the session capability. Do not store personal/sensitive data here.
create policy "read active attempt" on public.participants for select to anon using (true);
create policy "expire active attempt" on public.participants for update to anon using (status = 'started') with check (status in ('started', 'expired'));
