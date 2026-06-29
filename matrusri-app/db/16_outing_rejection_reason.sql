-- Optional rejection reason captured by staff when rejecting an outing.
-- Surfaced to the warden so they (and the parent) understand why a request was denied.

alter table public.outings
  add column if not exists rejection_reason text;
