-- Add icon column to task templates
alter table public.task_templates
  add column if not exists icon text not null default '📋';

-- Set icons for known tasks (idempotent — only updates the icon)
update public.task_templates set icon = '🔌' where name = 'Fans OFF';
update public.task_templates set icon = '🚰' where name in ('Bore pump ON', 'Bore pump OFF', 'Water pump OFF photo');
update public.task_templates set icon = '🧘' where name = 'Yoga photo';
update public.task_templates set icon = '🔢' where name like 'Attendance #%';
update public.task_templates set icon = '🔒' where name = 'Room lock confirmation';
update public.task_templates set icon = '🍳' where name = 'Breakfast wastage photo';
update public.task_templates set icon = '🍛' where name = 'Lunch wastage photo';
update public.task_templates set icon = '🫖' where name = 'Snacks wastage photo';
update public.task_templates set icon = '🍽' where name = 'Dinner wastage photo';
update public.task_templates set icon = '🤒' where name = 'Sick check + snacks';
update public.task_templates set icon = '📖' where name = 'Evening study hall';
update public.task_templates set icon = '🧹' where name = 'Dining + Learning hall photos';
update public.task_templates set icon = '🧺' where name = 'Laundry distribution';
