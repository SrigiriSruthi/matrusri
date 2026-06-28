-- Make students.dorm nullable (we no longer ask for it on the Add Student form)
alter table public.students alter column dorm drop not null;
