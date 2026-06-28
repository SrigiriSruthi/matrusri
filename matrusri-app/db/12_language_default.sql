-- Ensure every user has a language set (defaults to 'en' if NULL)
update public.users set language = 'en' where language is null;

-- Add a constraint to keep it valid going forward
do $$ begin
  alter table public.users
    add constraint users_language_check
    check (language in ('en', 'te', 'hi'));
exception when duplicate_object then null; end $$;
