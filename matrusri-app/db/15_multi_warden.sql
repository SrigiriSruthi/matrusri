-- Multi-warden task assignment
-- Each task template (and each task instance) can be assigned to multiple wardens.
-- Any one of them can mark it done. First to mark wins; others see it as done.

-- Template-level: many wardens per template
create table if not exists public.task_template_assignees (
  template_id uuid not null references public.task_templates(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  primary key (template_id, user_id)
);
create index if not exists tta_user_idx on public.task_template_assignees(user_id);

-- Instance-level: many wardens per instance
create table if not exists public.task_instance_assignees (
  instance_id uuid not null references public.task_instances(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  primary key (instance_id, user_id)
);
create index if not exists tia_user_idx on public.task_instance_assignees(user_id);

-- Seed both tables from existing single-assignee data so we don't lose anything
insert into public.task_template_assignees (template_id, user_id)
select id, default_assignee_id from public.task_templates
where default_assignee_id is not null
on conflict do nothing;

insert into public.task_instance_assignees (instance_id, user_id)
select id, assigned_to from public.task_instances
where assigned_to is not null
on conflict do nothing;

-- RLS
alter table public.task_template_assignees enable row level security;
alter table public.task_instance_assignees enable row level security;

drop policy if exists "tta_read" on public.task_template_assignees;
create policy "tta_read" on public.task_template_assignees
  for select using (auth.uid() is not null);

drop policy if exists "tta_write" on public.task_template_assignees;
create policy "tta_write" on public.task_template_assignees
  for all using (current_user_role() = 'management')
  with check (current_user_role() = 'management');

drop policy if exists "tia_read" on public.task_instance_assignees;
create policy "tia_read" on public.task_instance_assignees
  for select using (auth.uid() is not null);

drop policy if exists "tia_write" on public.task_instance_assignees;
create policy "tia_write" on public.task_instance_assignees
  for all using (current_user_role() in ('warden', 'management'))
  with check (current_user_role() in ('warden', 'management'));
