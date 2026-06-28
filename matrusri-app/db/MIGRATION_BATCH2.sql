-- =============================================================================
-- MATRUSRI HOSTEL — Migration batch 2
--
-- Paste this entire file into Supabase SQL Editor and click Run.
-- Open: https://supabase.com/dashboard/project/hnyjuqdokqguphfhiteh/sql/new
--
-- Adds:
--   • Jaya (management) and Sruthi (staff) users, password 'matrusri'
--   • laundry_state table for simple pending counter
-- =============================================================================

-- Add additional users: jaya (management) and sruthi (staff)
-- Both use password "matrusri".

do $$
declare
  jaya_id   uuid := '66666666-6666-6666-6666-666666666666';
  sruthi_id uuid := '77777777-7777-7777-7777-777777777777';
  default_hash text := '$2b$10$KY957SklWARLB5eYorSYEuigAbqRd//zZ6YqKC46Ab0TDBoW1WGnS';
begin
  -- auth.users entries
  insert into auth.users (id, instance_id, aud, role, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data, raw_app_meta_data, is_super_admin, encrypted_password)
  values
    (jaya_id,   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jaya@matrusri.demo',   now(), now(), now(), '{}', '{"provider":"email","providers":["email"]}', false, crypt('demo-only', gen_salt('bf'))),
    (sruthi_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sruthi@matrusri.demo', now(), now(), now(), '{}', '{"provider":"email","providers":["email"]}', false, crypt('demo-only', gen_salt('bf')))
  on conflict (id) do nothing;

  -- public.users entries with username/password
  insert into public.users (id, name, username, phone, role, language, password_hash)
  values
    (jaya_id,   'Jaya',   'jaya',   '+919876543215', 'management', 'en', default_hash),
    (sruthi_id, 'Sruthi', 'sruthi', '+919876543216', 'staff',      'en', default_hash)
  on conflict (id) do nothing;
end $$;

-- Add Sruthi as an approver in config
update public.config
set approver_user_ids = approver_user_ids || array['77777777-7777-7777-7777-777777777777'::uuid]
where id = 1
  and not ('77777777-7777-7777-7777-777777777777'::uuid = any(approver_user_ids));
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
