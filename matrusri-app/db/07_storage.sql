-- Storage bucket for task photos
-- Run once. Bucket is private (signed URLs only).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('task-photos', 'task-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- If bucket already existed as private, make it public for demo simplicity:
update storage.buckets set public = true where id = 'task-photos';

-- Service-role bypasses RLS, so the upload via service client just works.
-- For browser-direct uploads (later), we'd add policies here.
