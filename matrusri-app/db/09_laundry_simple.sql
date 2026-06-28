-- Simpler laundry model: just track a running "unclaimed" count that
-- carries forward day to day. No batches, no per-student item rows for now.

create table if not exists public.laundry_state (
  id           int primary key default 1,
  pending_count int not null default 0,
  last_updated_at timestamptz not null default now(),
  last_updated_by uuid references public.users(id)
);

insert into public.laundry_state (id, pending_count) values (1, 0)
on conflict (id) do nothing;

alter table public.laundry_state enable row level security;

drop policy if exists "laundry_state_read" on public.laundry_state;
create policy "laundry_state_read" on public.laundry_state
  for select using (auth.uid() is not null);

drop policy if exists "laundry_state_write" on public.laundry_state;
create policy "laundry_state_write" on public.laundry_state
  for update using (current_user_role() in ('warden', 'management'));
