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
  default_hash text := '$2b$10$Q5oN8K4VqxqV.Ml0rN.5CO9p.PvbZQH4w4qLEnTQ4z9bN3mIqvE.S';
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
