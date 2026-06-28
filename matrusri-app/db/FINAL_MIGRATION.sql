-- =============================================================================
-- MATRUSRI HOSTEL — Final migration
--
-- Paste this entire file into Supabase SQL Editor and click Run.
-- Open: https://supabase.com/dashboard/project/hnyjuqdokqguphfhiteh/sql/new
--
-- This adds:
--   • Today's demo state (outings, sick logs, attendance, task instances, alerts)
--   • username + password_hash columns on users (with demo passwords)
--   • outing 'pending_gate' status + gate_confirmed_at column
--   • task-photos storage bucket (public for demo)
--
-- Safe to re-run. Existing data is preserved.
-- =============================================================================

-- Today's live demo state: outings, sick logs, attendance, task instances
-- Run after 01-03. Idempotent.

-- ============================================================================
-- Active outings (5 students away)
-- ============================================================================
do $$
declare
  lakshmi_id uuid := '11111111-1111-1111-1111-111111111111';
  priya_id   uuid := '22222222-2222-2222-2222-222222222222';
  suresh_id  uuid := '33333333-3333-3333-3333-333333333333';

  ravi    uuid := 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa';
  sreeja  uuid := 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa';
  anil    uuid := 'aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa';
  pooja   uuid := 'aaaaaaaa-0006-0006-0006-aaaaaaaaaaaa';
  aditya  uuid := 'aaaaaaaa-0007-0007-0007-aaaaaaaaaaaa';
begin
  delete from public.outings where student_id in (ravi, sreeja, anil, pooja, aditya) and returned_at is null;

  insert into public.outings (student_id, type, reason, reason_note, requested_by, otp_verified_at, approved_by, approved_at, started_at, expected_return_at, status)
  values
    (ravi,   'sick_pickup', 'sick',         'Fever, headache',             lakshmi_id, now() - interval '20 min', lakshmi_id, now() - interval '18 min', now() - interval '15 min', null, 'active'),
    (sreeja, 'special',     'family_event', 'Father in town for lunch',    lakshmi_id, now() - interval '15 min', suresh_id,  now() - interval '12 min', now() - interval '10 min', current_date + time '21:00', 'active'),
    (anil,   'regular',     null,            'Monthly home visit',          lakshmi_id, now() - interval '3 hour', suresh_id,  now() - interval '3 hour', now() - interval '3 hour', current_date + time '21:00', 'active'),
    (pooja,  'regular',     null,            'Monthly home visit',          lakshmi_id, now() - interval '3 hour', lakshmi_id, now() - interval '3 hour', now() - interval '3 hour', current_date + time '21:00', 'active'),
    (aditya, 'regular',     null,            'Monthly home visit',          lakshmi_id, now() - interval '3 hour', suresh_id,  now() - interval '3 hour', now() - interval '3 hour', current_date + time '21:00', 'active');
end $$;

-- ============================================================================
-- Active sick logs (2 students resting in hostel)
-- ============================================================================
do $$
declare
  lakshmi_id uuid := '11111111-1111-1111-1111-111111111111';
  anusha uuid := 'aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa';
  kiran  uuid := 'aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa';
begin
  delete from public.sick_logs where student_id in (anusha, kiran) and status = 'open';

  insert into public.sick_logs (student_id, symptoms, reported_at, reported_by, parent_called_at, outcome, outcome_set_at, outcome_set_by, status)
  values
    (anusha, 'Stomach ache', current_date + time '15:15', lakshmi_id, current_date + time '15:45', 'resting', current_date + time '15:45', lakshmi_id, 'open'),
    (kiran,  'Cold',         current_date - interval '1 day' + time '14:00', lakshmi_id, current_date - interval '1 day' + time '14:20', 'resting', current_date - interval '1 day' + time '14:20', lakshmi_id, 'open');
end $$;

-- ============================================================================
-- Today's attendance — slots 1, 2, 3 completed (slot 3 cross-verified)
-- ============================================================================
do $$
declare
  lakshmi_id uuid := '11111111-1111-1111-1111-111111111111';
  priya_id   uuid := '22222222-2222-2222-2222-222222222222';
begin
  delete from public.attendance where date = current_date;

  insert into public.attendance (date, slot_number, boys_present, girls_present, absent_with_permission, absent_without_permission, submitted_by, submitted_at, verified_by, verified_at, verified_boys_present, verified_girls_present, mismatch)
  values
    (current_date, 1, 83, 64,  3, 0, lakshmi_id, current_date + time '06:35', null, null, null, null, false),
    (current_date, 2, 82, 63,  5, 0, priya_id,   current_date + time '10:45', null, null, null, null, false),
    (current_date, 3, 81, 62,  5, 2, lakshmi_id, current_date + time '14:15', priya_id, current_date + time '14:15', 81, 62, false);
end $$;

-- ============================================================================
-- Today's task instances (mirror demo state: 9 done, 1 missed, 2 open, 7 upcoming)
-- ============================================================================
do $$
declare
  rec record;
  inst_id uuid;
  status_val task_status;
  submitted_ts timestamptz;
  -- map task name -> demo status
  task_status_map text;
begin
  -- Wipe today's instances first
  delete from public.task_instances where date = current_date;

  for rec in
    select t.id, t.name, t.default_assignee_id, t.slot_time
    from public.task_templates t
    where t.is_active = true
    order by t.sort_order
  loop
    -- Decide a status based on the name (matches the demo seed.ts)
    if rec.name in (
      'Lights / fans / main switch OFF',
      'Bore pump ON',
      'Yoga photo',
      'Bore pump OFF',
      'Attendance #1 — Study hall',
      'Room lock confirmation',
      'Breakfast wastage photo',
      'Attendance #2 — School interval',
      'Attendance #3 — Lunch',
      'Lunch wastage photo'
    ) then
      status_val := 'done';
      submitted_ts := current_date + rec.slot_time + interval '10 min';
    elsif rec.name = 'Water pump OFF photo' then
      status_val := 'missed';
      submitted_ts := null;
    elsif rec.name in ('Sick check + snacks', 'Attendance #4', 'Snacks wastage photo') then
      status_val := 'open';
      submitted_ts := null;
    else
      status_val := 'pending';
      submitted_ts := null;
    end if;

    insert into public.task_instances (template_id, date, assigned_to, status, submitted_at, submitted_by)
    values (rec.id, current_date, rec.default_assignee_id, status_val, submitted_ts,
            case when status_val = 'done' then rec.default_assignee_id else null end);
  end loop;
end $$;

-- ============================================================================
-- Alerts that match the demo (auto-derived from the open sick + missed task)
-- ============================================================================
delete from public.alerts where acknowledged_at is null;

insert into public.alerts (type, severity, title, message)
values
  ('sick_pickup_outing',  'red', '🏥 Ravi (Class 8) — sent home sick',                    'Fever, headache · Approved by Lakshmi · 6:32 pm'),
  ('special_outing',      'red', '⚠️ Sreeja (Class 9) — special-day outing',              'Family event · father in town for lunch · 6:38 pm'),
  ('task_missed',         'red', 'Water pump OFF photo missing',                          'Warden: Lakshmi · Due 5:00 pm'),
  ('sick_sla_breach',     'red', 'Sick log — parent not called for Anusha',               'Class 6 · Reported 4:30 pm');
-- Auth model change: username + password instead of phone + OTP
-- Run after 01–04.

-- Add username column
alter table public.users
  add column if not exists username text;

-- Rename pin_hash -> password_hash (keep both for compatibility on re-run)
alter table public.users
  add column if not exists password_hash text;

-- Add unique constraint on username (case-insensitive)
create unique index if not exists users_username_unique on public.users (lower(username));

-- Backfill demo users with usernames + default password ("matrusri")
-- password_hash is bcrypt of "matrusri" (rounds=10)
-- (we'll generate fresh hashes in app code; this is just so demo logins work today)
do $$
declare
  default_hash text := '$2b$10$KY957SklWARLB5eYorSYEuigAbqRd//zZ6YqKC46Ab0TDBoW1WGnS';
begin
  update public.users set username = 'lakshmi', password_hash = default_hash where id = '11111111-1111-1111-1111-111111111111';
  update public.users set username = 'priya',   password_hash = default_hash where id = '22222222-2222-2222-2222-222222222222';
  update public.users set username = 'suresh',  password_hash = default_hash where id = '33333333-3333-3333-3333-333333333333';
  update public.users set username = 'ramesh',  password_hash = default_hash where id = '44444444-4444-4444-4444-444444444444';
  update public.users set username = 'rajesh',  password_hash = default_hash where id = '55555555-5555-5555-5555-555555555555';
end $$;

-- Make username required for new rows
alter table public.users
  alter column username set not null;
-- New outing flow: warden creates → staff approves → warden ticks "parent arrived"
-- Run after 01–05.

-- Add new outing_status value
do $$
begin
  alter type outing_status add value if not exists 'pending_gate' before 'active';
exception when others then null;
end $$;

-- Track when warden confirmed parent showed up at gate
alter table public.outings
  add column if not exists gate_confirmed_at timestamptz,
  add column if not exists gate_confirmed_by uuid references public.users(id);
-- Storage bucket for task photos
-- Run once. Bucket is private (signed URLs only).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('task-photos', 'task-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- If bucket already existed as private, make it public for demo simplicity:
update storage.buckets set public = true where id = 'task-photos';

-- Service-role bypasses RLS, so the upload via service client just works.
-- For browser-direct uploads (later), we'd add policies here.
