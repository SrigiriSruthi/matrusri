-- Remove the redundant 5 pm "Water pump OFF photo" task.
-- The morning bore pump ON/OFF (5–6 am) covers all pump logging needs.

-- 1. Remove today's instance (if any)
delete from public.task_instances
where template_id in (
  select id from public.task_templates where name = 'Water pump OFF photo'
) and date = current_date;

-- 2. Mark the template inactive (preserves history; safer than delete)
update public.task_templates
set is_active = false
where name = 'Water pump OFF photo';
