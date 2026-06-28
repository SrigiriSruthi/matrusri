-- New laundry model: "problem students" list.
-- Only students with an active issue appear. Open until warden clears.
-- Replaces the laundry_state pending-counter.

create table if not exists public.laundry_issues (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students(id),
  item_count    smallint not null default 1,
  issue_type    text not null check (issue_type in ('missing', 'damaged', 'uncollected', 'other')),
  note          text,
  created_at    timestamptz not null default now(),
  created_by    uuid references public.users(id),
  cleared_at    timestamptz,
  cleared_by    uuid references public.users(id),
  cleared_note  text
);

create index if not exists laundry_issues_open_idx on public.laundry_issues(created_at desc)
  where cleared_at is null;
create index if not exists laundry_issues_student_idx on public.laundry_issues(student_id);

alter table public.laundry_issues enable row level security;

drop policy if exists "laundry_issues_read" on public.laundry_issues;
create policy "laundry_issues_read" on public.laundry_issues
  for select using (auth.uid() is not null);

drop policy if exists "laundry_issues_write" on public.laundry_issues;
create policy "laundry_issues_write" on public.laundry_issues
  for all using (current_user_role() in ('warden', 'management'))
  with check (current_user_role() in ('warden', 'management'));
