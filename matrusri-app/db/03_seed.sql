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
