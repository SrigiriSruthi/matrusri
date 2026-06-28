-- Matrusri Hostel Management — Schema
-- Run order: 01_schema.sql → 02_rls.sql → 03_seed.sql
-- Idempotent: safe to re-run.

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "pgcrypto";

-- ============================================================================
-- Enums
-- ============================================================================
do $$ begin
  create type user_role as enum ('management', 'warden', 'staff');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gender as enum ('boy', 'girl');
exception when duplicate_object then null; end $$;

do $$ begin
  create type proof_type as enum ('photo', 'count', 'tap');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('pending', 'open', 'done', 'missed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type outing_type as enum ('regular', 'special', 'sick_pickup');
exception when duplicate_object then null; end $$;

do $$ begin
  create type outing_reason as enum ('sick', 'family_event', 'doctor_visit', 'emergency', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type outing_status as enum ('pending_otp', 'pending_approval', 'active', 'closed', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sick_outcome as enum ('resting', 'sent_home', 'at_doctor', 'recovered');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sick_status as enum ('open', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pump_status as enum ('pending', 'running', 'done', 'missed', 'interrupted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type wastage_level as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- Users  (linked to auth.users via id)
-- ============================================================================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  phone       text not null unique,
  role        user_role not null,
  language    text not null default 'en',
  pin_hash    text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists users_role_idx on public.users(role) where is_active;

-- ============================================================================
-- Students
-- ============================================================================
create table if not exists public.students (
  id                            uuid primary key default gen_random_uuid(),
  name                          text not null,
  roll_no                       text unique,
  class                         text not null,
  dorm                          text not null,
  gender                        gender not null,
  parent_name                   text not null,
  parent_phone                  text not null,
  emergency_contact_name        text,
  emergency_contact_phone       text,
  emergency_contact_relation    text,
  is_active                     boolean not null default true,
  created_at                    timestamptz not null default now()
);
create index if not exists students_active_idx on public.students(is_active);
create index if not exists students_gender_idx on public.students(gender, is_active);

-- ============================================================================
-- Task templates  (schedule definition — relatively static)
-- ============================================================================
create table if not exists public.task_templates (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slot_time       time not null,
  window_start    time not null,
  window_end      time not null,
  proof_type      proof_type not null,
  default_assignee_id uuid references public.users(id),
  days_active     int[] not null default '{0,1,2,3,4,5,6}',   -- 0=Sun ... 6=Sat
  sort_order      int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- ============================================================================
-- Task instances  (one per template per day)
-- ============================================================================
create table if not exists public.task_instances (
  id              uuid primary key default gen_random_uuid(),
  template_id     uuid not null references public.task_templates(id) on delete cascade,
  date            date not null,
  assigned_to     uuid references public.users(id),
  status          task_status not null default 'pending',
  photo_url       text,
  count_data      jsonb,
  note            text,
  submitted_at    timestamptz,
  submitted_by    uuid references public.users(id),
  created_at      timestamptz not null default now(),
  unique (template_id, date)
);
create index if not exists task_instances_date_idx on public.task_instances(date);
create index if not exists task_instances_assignee_idx on public.task_instances(assigned_to, date);
create index if not exists task_instances_status_idx on public.task_instances(status, date);

-- ============================================================================
-- Attendance
-- ============================================================================
create table if not exists public.attendance (
  id                            uuid primary key default gen_random_uuid(),
  date                          date not null,
  slot_number                   smallint not null check (slot_number between 1 and 5),
  boys_present                  smallint not null check (boys_present >= 0),
  girls_present                 smallint not null check (girls_present >= 0),
  absent_with_permission        smallint not null default 0,
  absent_without_permission     smallint not null default 0,
  submitted_by                  uuid not null references public.users(id),
  submitted_at                  timestamptz not null default now(),
  verified_by                   uuid references public.users(id),
  verified_at                   timestamptz,
  verified_boys_present         smallint,    -- the second warden's independent count
  verified_girls_present        smallint,
  mismatch                      boolean not null default false,
  unique (date, slot_number)
);
create index if not exists attendance_date_idx on public.attendance(date);

-- ============================================================================
-- Outings
-- ============================================================================
create table if not exists public.outings (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.students(id),
  type                outing_type not null,
  reason              outing_reason,
  reason_note         text,
  otp_code_hash       text,
  otp_sent_at         timestamptz,
  otp_verified_at     timestamptz,
  requested_by        uuid not null references public.users(id),
  approved_by         uuid references public.users(id),
  approved_at         timestamptz,
  started_at          timestamptz,
  expected_return_at  timestamptz,
  returned_at         timestamptz,
  status              outing_status not null default 'pending_otp',
  linked_sick_log_id  uuid,
  created_at          timestamptz not null default now()
);
create index if not exists outings_student_idx on public.outings(student_id, started_at desc);
create index if not exists outings_status_idx on public.outings(status) where status != 'closed';
create index if not exists outings_active_idx on public.outings(status, returned_at) where status = 'active';

-- ============================================================================
-- Sick logs
-- ============================================================================
create table if not exists public.sick_logs (
  id                        uuid primary key default gen_random_uuid(),
  student_id                uuid not null references public.students(id),
  symptoms                  text not null,
  reported_at               timestamptz not null default now(),
  reported_by               uuid not null references public.users(id),
  parent_called_at          timestamptz,
  emergency_called_at       timestamptz,
  outcome                   sick_outcome,
  outcome_set_at            timestamptz,
  outcome_set_by            uuid references public.users(id),
  triggered_outing_id       uuid references public.outings(id),
  status                    sick_status not null default 'open',
  closed_at                 timestamptz,
  daily_followup_notes      jsonb default '[]'::jsonb,   -- array of {date, note, by}
  created_at                timestamptz not null default now()
);
create index if not exists sick_logs_student_idx on public.sick_logs(student_id, reported_at desc);
create index if not exists sick_logs_open_idx on public.sick_logs(status) where status = 'open';

alter table public.outings
  drop constraint if exists outings_linked_sick_log_fk;
alter table public.outings
  add constraint outings_linked_sick_log_fk
  foreign key (linked_sick_log_id) references public.sick_logs(id);

-- ============================================================================
-- Pump schedules + sessions
-- ============================================================================
create table if not exists public.pump_schedules (
  id                       uuid primary key default gen_random_uuid(),
  name                     text not null,
  target_on_time           time not null,
  target_off_time          time not null,
  target_duration_minutes  int not null,
  tolerance_minutes        int not null default 15,
  on_window_start          time not null,
  on_window_end            time not null,
  off_window_start         time not null,
  off_window_end           time not null,
  assigned_warden_id       uuid references public.users(id),
  days_active              int[] not null default '{0,1,2,3,4,5,6}',
  is_active                boolean not null default true,
  created_at               timestamptz not null default now()
);

create table if not exists public.pump_sessions (
  id                uuid primary key default gen_random_uuid(),
  schedule_id       uuid not null references public.pump_schedules(id) on delete cascade,
  date              date not null,
  on_photo_url      text,
  on_at             timestamptz,
  on_by             uuid references public.users(id),
  off_photo_url     text,
  off_at            timestamptz,
  off_by            uuid references public.users(id),
  duration_minutes  int,
  status            pump_status not null default 'pending',
  anomaly_flags     jsonb default '[]'::jsonb,
  interruption_note text,
  created_at        timestamptz not null default now(),
  unique (schedule_id, date)
);
create index if not exists pump_sessions_date_idx on public.pump_sessions(date);

-- ============================================================================
-- Laundry
-- ============================================================================
create table if not exists public.laundry_batches (
  id            uuid primary key default gen_random_uuid(),
  vendor_name   text not null,
  pickup_date   date,
  return_date   date,
  pickup_photo_url text,
  status        text not null default 'open',     -- open / collected / returned / distributed
  created_at    timestamptz not null default now()
);

create table if not exists public.laundry_items (
  id              uuid primary key default gen_random_uuid(),
  batch_id        uuid not null references public.laundry_batches(id) on delete cascade,
  student_id      uuid not null references public.students(id),
  picked_count    smallint not null default 0,
  returned_count  smallint not null default 0,
  unclaimed_count smallint not null default 0,
  distributed_at  timestamptz,
  distributed_by  uuid references public.users(id),
  complaints      jsonb default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  unique (batch_id, student_id)
);

-- ============================================================================
-- Supplies (weekly veg, monthly checklist, food wastage)
-- ============================================================================
create table if not exists public.supplies (
  id              uuid primary key default gen_random_uuid(),
  kind            text not null,                      -- weekly_veg / monthly / wastage
  date            date not null,
  meal_slot       text,                               -- breakfast/lunch/snacks/dinner (for wastage)
  acknowledged    boolean,                            -- yes/no for delivery
  wastage_level   wastage_level,                      -- low/medium/high
  photo_url       text,
  note            text,
  items           jsonb,                              -- for monthly checklist
  submitted_by    uuid references public.users(id),
  submitted_at    timestamptz not null default now()
);
create index if not exists supplies_date_idx on public.supplies(date desc);

-- ============================================================================
-- Alerts (red/yellow events surfaced to management)
-- ============================================================================
create table if not exists public.alerts (
  id                    uuid primary key default gen_random_uuid(),
  type                  text not null,
  severity              text not null check (severity in ('red', 'yellow')),
  related_entity_type   text,
  related_entity_id     uuid,
  title                 text not null,
  message               text,
  created_at            timestamptz not null default now(),
  acknowledged_at       timestamptz,
  acknowledged_by       uuid references public.users(id)
);
create index if not exists alerts_open_idx on public.alerts(created_at desc) where acknowledged_at is null;

-- ============================================================================
-- Audit log (light — every meaningful state change)
-- ============================================================================
create table if not exists public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references public.users(id),
  action       text not null,
  entity_type  text,
  entity_id    uuid,
  details      jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists audit_log_entity_idx on public.audit_log(entity_type, entity_id);

-- ============================================================================
-- Config (single-row hostel-wide settings)
-- ============================================================================
create table if not exists public.config (
  id                       int primary key default 1,
  hostel_name              text not null default 'Matrusri Hostel',
  outing_default_dow       int not null default 6,    -- 6 = Saturday
  outing_default_week      int not null default 2,    -- 2nd Saturday
  approver_user_ids        uuid[] default '{}',
  retention_days_photos    int not null default 30,
  parent_call_sla_minutes  int not null default 60,
  emergency_call_sla_hours int not null default 2,
  resting_alert_days       int not null default 3,
  updated_at               timestamptz not null default now()
);
insert into public.config (id) values (1) on conflict (id) do nothing;
-- Matrusri Hostel — Row-Level Security policies
-- Run after 01_schema.sql

-- ============================================================================
-- Helper: role lookup
-- ============================================================================
create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

-- ============================================================================
-- Enable RLS on every table
-- ============================================================================
alter table public.users           enable row level security;
alter table public.students        enable row level security;
alter table public.task_templates  enable row level security;
alter table public.task_instances  enable row level security;
alter table public.attendance      enable row level security;
alter table public.outings         enable row level security;
alter table public.sick_logs       enable row level security;
alter table public.pump_schedules  enable row level security;
alter table public.pump_sessions   enable row level security;
alter table public.laundry_batches enable row level security;
alter table public.laundry_items   enable row level security;
alter table public.supplies        enable row level security;
alter table public.alerts          enable row level security;
alter table public.audit_log       enable row level security;
alter table public.config          enable row level security;

-- ============================================================================
-- Drop any existing policies (so this file is re-runnable)
-- ============================================================================
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- ============================================================================
-- USERS — everyone can read user list (for warden/staff names); only mgmt writes
-- ============================================================================
create policy users_read on public.users
  for select using (auth.uid() is not null);

create policy users_self_update on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy users_mgmt_write on public.users
  for all using (current_user_role() = 'management')
           with check (current_user_role() = 'management');

-- ============================================================================
-- STUDENTS — wardens/staff/mgmt can read; only mgmt edits
-- ============================================================================
create policy students_read on public.students
  for select using (auth.uid() is not null);

create policy students_mgmt_write on public.students
  for all using (current_user_role() = 'management')
           with check (current_user_role() = 'management');

-- ============================================================================
-- TASK_TEMPLATES — all roles read, mgmt edits
-- ============================================================================
create policy templates_read on public.task_templates
  for select using (auth.uid() is not null);

create policy templates_mgmt_write on public.task_templates
  for all using (current_user_role() = 'management')
           with check (current_user_role() = 'management');

-- ============================================================================
-- TASK_INSTANCES — wardens see all (to coordinate), update only own
-- ============================================================================
create policy task_instances_read on public.task_instances
  for select using (auth.uid() is not null);

create policy task_instances_warden_update on public.task_instances
  for update using (
    assigned_to = auth.uid()
    or current_user_role() = 'management'
  ) with check (
    assigned_to = auth.uid()
    or current_user_role() = 'management'
  );

create policy task_instances_mgmt_insert on public.task_instances
  for insert with check (current_user_role() = 'management');

-- ============================================================================
-- ATTENDANCE — wardens insert+update own slots, all read, mgmt can edit
-- ============================================================================
create policy attendance_read on public.attendance
  for select using (auth.uid() is not null);

create policy attendance_warden_insert on public.attendance
  for insert with check (
    current_user_role() in ('warden', 'management')
    and submitted_by = auth.uid()
  );

create policy attendance_warden_update on public.attendance
  for update using (
    submitted_by = auth.uid()
    or verified_by = auth.uid()
    or current_user_role() = 'management'
  );

-- ============================================================================
-- OUTINGS — wardens create, staff approve, all read
-- ============================================================================
create policy outings_read on public.outings
  for select using (auth.uid() is not null);

create policy outings_warden_create on public.outings
  for insert with check (
    current_user_role() in ('warden', 'management')
    and requested_by = auth.uid()
  );

create policy outings_update on public.outings
  for update using (
    current_user_role() in ('warden', 'staff', 'management')
  );

-- ============================================================================
-- SICK_LOGS — wardens create + update; all read
-- ============================================================================
create policy sick_read on public.sick_logs
  for select using (auth.uid() is not null);

create policy sick_warden_write on public.sick_logs
  for all using (current_user_role() in ('warden', 'management'))
           with check (current_user_role() in ('warden', 'management'));

-- ============================================================================
-- PUMP — wardens log, mgmt configures
-- ============================================================================
create policy pump_schedules_read on public.pump_schedules
  for select using (auth.uid() is not null);

create policy pump_schedules_mgmt_write on public.pump_schedules
  for all using (current_user_role() = 'management')
           with check (current_user_role() = 'management');

create policy pump_sessions_read on public.pump_sessions
  for select using (auth.uid() is not null);

create policy pump_sessions_warden_write on public.pump_sessions
  for all using (current_user_role() in ('warden', 'management'))
           with check (current_user_role() in ('warden', 'management'));

-- ============================================================================
-- LAUNDRY — wardens log, all read
-- ============================================================================
create policy laundry_batches_read on public.laundry_batches
  for select using (auth.uid() is not null);

create policy laundry_batches_warden_write on public.laundry_batches
  for all using (current_user_role() in ('warden', 'management'))
           with check (current_user_role() in ('warden', 'management'));

create policy laundry_items_read on public.laundry_items
  for select using (auth.uid() is not null);

create policy laundry_items_warden_write on public.laundry_items
  for all using (current_user_role() in ('warden', 'management'))
           with check (current_user_role() in ('warden', 'management'));

-- ============================================================================
-- SUPPLIES — wardens log, all read
-- ============================================================================
create policy supplies_read on public.supplies
  for select using (auth.uid() is not null);

create policy supplies_warden_write on public.supplies
  for all using (current_user_role() in ('warden', 'management'))
           with check (current_user_role() in ('warden', 'management'));

-- ============================================================================
-- ALERTS — all roles see, mgmt can ack
-- ============================================================================
create policy alerts_read on public.alerts
  for select using (auth.uid() is not null);

create policy alerts_mgmt_update on public.alerts
  for update using (current_user_role() = 'management');

-- ============================================================================
-- AUDIT_LOG — mgmt only
-- ============================================================================
create policy audit_mgmt_read on public.audit_log
  for select using (current_user_role() = 'management');

-- ============================================================================
-- CONFIG — all read, mgmt writes
-- ============================================================================
create policy config_read on public.config
  for select using (auth.uid() is not null);

create policy config_mgmt_write on public.config
  for update using (current_user_role() = 'management');
-- Matrusri Hostel — Demo seed data
-- Run after 01_schema.sql and 02_rls.sql.
-- Notes:
--   • User rows here reference auth.users(id). Real users will be created
--     by the signup flow. For demo, we insert directly via service_role.
--   • Safe to re-run: uses ON CONFLICT DO NOTHING / unique keys.

-- ============================================================================
-- Demo users
-- We need auth.users entries first, then public.users rows.
-- ============================================================================
do $$
declare
  lakshmi_id uuid := '11111111-1111-1111-1111-111111111111';
  priya_id   uuid := '22222222-2222-2222-2222-222222222222';
  suresh_id  uuid := '33333333-3333-3333-3333-333333333333';
  ramesh_id  uuid := '44444444-4444-4444-4444-444444444444';
  rajesh_id  uuid := '55555555-5555-5555-5555-555555555555';
begin
  -- Insert into auth.users (the actual auth identity)
  insert into auth.users (id, instance_id, aud, role, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data, raw_app_meta_data, is_super_admin, encrypted_password)
  values
    (lakshmi_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lakshmi@matrusri.demo', now(), now(), now(), '{}', '{"provider":"email","providers":["email"]}', false, crypt('demo-only', gen_salt('bf'))),
    (priya_id,   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya@matrusri.demo',   now(), now(), now(), '{}', '{"provider":"email","providers":["email"]}', false, crypt('demo-only', gen_salt('bf'))),
    (suresh_id,  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'suresh@matrusri.demo',  now(), now(), now(), '{}', '{"provider":"email","providers":["email"]}', false, crypt('demo-only', gen_salt('bf'))),
    (ramesh_id,  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ramesh@matrusri.demo',  now(), now(), now(), '{}', '{"provider":"email","providers":["email"]}', false, crypt('demo-only', gen_salt('bf'))),
    (rajesh_id,  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rajesh@matrusri.demo',  now(), now(), now(), '{}', '{"provider":"email","providers":["email"]}', false, crypt('demo-only', gen_salt('bf')))
  on conflict (id) do nothing;

  insert into public.users (id, name, phone, role, language)
  values
    (lakshmi_id, 'Lakshmi Devi',  '+919876543210', 'warden',     'en'),
    (priya_id,   'Priya Sharma',  '+919876543211', 'warden',     'en'),
    (suresh_id,  'Suresh Kumar',  '+919876543212', 'staff',      'en'),
    (ramesh_id,  'Ramesh Naidu',  '+919876543213', 'warden',     'en'),
    (rajesh_id,  'Rajesh Naidu',  '+919876543214', 'management', 'en')
  on conflict (id) do nothing;
end $$;

-- ============================================================================
-- Demo students (just the ones referenced in the app — 5 to start)
-- ============================================================================
insert into public.students (id, name, roll_no, class, dorm, gender, parent_name, parent_phone, emergency_contact_name, emergency_contact_phone, emergency_contact_relation)
values
  ('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Ravi Kumar',   '0045', '8', 'A', 'boy',  'Sujatha',  '+919810000001', 'Uncle Ramesh',    '+919810000002', 'uncle'),
  ('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'Sreeja Reddy', '0089', '9', 'B', 'girl', 'Rajesh',   '+919810000003', 'Aunt Padma',      '+919810000004', 'aunt'),
  ('aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa', 'Anusha',       '0034', '6', 'B', 'girl', 'Geetha',   '+919810000005', 'Grandfather Subbarao', '+919810000006', 'grandfather'),
  ('aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa', 'Kiran',        '0091', '9', 'B', 'boy',  'Murthy',   '+919810000007', 'Aunt Vani',       '+919810000008', 'aunt'),
  ('aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa', 'Anil Kumar',   '0023', '7', 'A', 'boy',  'Rao',      '+919810000009', 'Uncle Naidu',     '+919810000010', 'uncle'),
  ('aaaaaaaa-0006-0006-0006-aaaaaaaaaaaa', 'Pooja',        '0058', '6', 'B', 'girl', 'Lakshmi',  '+919810000011', 'Grandmother Sita','+919810000012', 'grandmother'),
  ('aaaaaaaa-0007-0007-0007-aaaaaaaaaaaa', 'Aditya',       '0067', '7', 'A', 'boy',  'Naidu',    '+919810000013', 'Uncle Ravi',      '+919810000014', 'uncle')
on conflict (id) do nothing;

-- ============================================================================
-- Task templates (the daily schedule)
-- ============================================================================
do $$
declare
  lakshmi_id uuid := '11111111-1111-1111-1111-111111111111';
  priya_id   uuid := '22222222-2222-2222-2222-222222222222';
  suresh_id  uuid := '33333333-3333-3333-3333-333333333333';
  ramesh_id  uuid := '44444444-4444-4444-4444-444444444444';
begin
  insert into public.task_templates (name, slot_time, window_start, window_end, proof_type, default_assignee_id, sort_order)
  values
    ('Lights / fans / main switch OFF', '05:00', '05:00', '07:00', 'tap',   lakshmi_id, 1),
    ('Bore pump ON',                    '05:00', '04:50', '05:30', 'photo', lakshmi_id, 2),
    ('Yoga photo',                      '05:30', '05:15', '07:45', 'photo', suresh_id,  3),
    ('Bore pump OFF',                   '06:00', '05:50', '06:30', 'photo', lakshmi_id, 4),
    ('Attendance #1 — Study hall',      '06:30', '06:30', '08:30', 'count', lakshmi_id, 5),
    ('Room lock confirmation',          '06:30', '06:30', '08:30', 'tap',   lakshmi_id, 6),
    ('Breakfast wastage photo',         '09:00', '09:00', '11:00', 'photo', priya_id,   7),
    ('Attendance #2 — School interval', '10:00', '10:00', '12:30', 'count', priya_id,   8),
    ('Attendance #3 — Lunch',           '14:00', '14:00', '16:00', 'count', lakshmi_id, 9),
    ('Lunch wastage photo',             '14:00', '14:00', '16:00', 'photo', priya_id,   10),
    ('Water pump OFF photo',            '17:00', '17:00', '19:00', 'photo', lakshmi_id, 11),
    ('Sick check + snacks',             '17:00', '17:00', '19:00', 'tap',   lakshmi_id, 12),
    ('Attendance #4',                   '18:00', '18:00', '20:00', 'count', priya_id,   13),
    ('Snacks wastage photo',            '18:00', '18:00', '20:00', 'photo', priya_id,   14),
    ('Evening study hall',              '20:00', '20:00', '21:00', 'tap',   lakshmi_id, 15),
    ('Dining + Learning hall photos',   '21:00', '21:00', '23:00', 'photo', lakshmi_id, 16),
    ('Laundry distribution',            '21:00', '21:00', '21:30', 'tap',   lakshmi_id, 17),
    ('Attendance #5 — Day close',       '21:30', '21:30', '23:00', 'count', lakshmi_id, 18),
    ('Dinner wastage photo',            '21:30', '21:30', '23:30', 'photo', ramesh_id,  19)
  on conflict do nothing;
end $$;

-- ============================================================================
-- Pump schedule (bore pump, 5:00–6:00 am, 1 hour, ±15 min tolerance)
-- ============================================================================
do $$
declare
  lakshmi_id uuid := '11111111-1111-1111-1111-111111111111';
begin
  insert into public.pump_schedules (name, target_on_time, target_off_time, target_duration_minutes, tolerance_minutes, on_window_start, on_window_end, off_window_start, off_window_end, assigned_warden_id)
  values
    ('Bore pump morning', '05:00', '06:00', 60, 15, '04:50', '05:30', '05:50', '06:30', lakshmi_id)
  on conflict do nothing;
end $$;

-- ============================================================================
-- Config — set approver list
-- ============================================================================
update public.config
set approver_user_ids = array[
  '33333333-3333-3333-3333-333333333333'::uuid,   -- Suresh
  '11111111-1111-1111-1111-111111111111'::uuid,   -- Lakshmi
  '22222222-2222-2222-2222-222222222222'::uuid    -- Priya
]
where id = 1;
