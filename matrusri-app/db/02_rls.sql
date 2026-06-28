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
