-- Group-3 review fix (HIGH/SECURITY): the original
-- "images_insert_authenticated" policy (20260831000200) checked only
-- `bucket_id = 'images'`, so any authenticated Sunner could upload to ANY
-- path inside the bucket -- including another Sunner's
-- kudos/{their_id}/{kudos_id}/... prefix, defeating the app-level path
-- convention entirely. This drops that policy and recreates it scoped to
-- the caller's own sender segment, matching
-- kudos/{sender_id}/{kudos_id}/{position}-{filename}
-- (storage.foldername(name) returns the path's folder segments as text[],
-- excluding the filename itself, so [1] = 'kudos' and [2] = sender_id).
-- The select policy is unchanged -- every signed-in Sunner still needs to
-- view every kudos's images in the feed, not just their own uploads.
--
-- Inverse of what this drops: the old policy was
--   create policy "images_insert_authenticated" on storage.objects
--   for insert to authenticated with check (bucket_id = 'images');
-- (no ownership/path check at all).
--
-- Rollback: drop policy "images_insert_authenticated" on storage.objects;
-- create policy "images_insert_authenticated" on storage.objects for insert
-- to authenticated with check (bucket_id = 'images');
drop policy "images_insert_authenticated" on storage.objects;

create policy "images_insert_authenticated"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'images'
  and (storage.foldername(name))[1] = 'kudos'
  and (storage.foldername(name))[2] = auth.uid()::text
);
