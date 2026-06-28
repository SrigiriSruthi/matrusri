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
