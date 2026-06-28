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
