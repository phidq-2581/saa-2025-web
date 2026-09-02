-- Phase 01 (F005/F006): storage.objects RLS for the `images` bucket -- no
-- policy existed before this round (bucket was unused). Insert lets any
-- signed-in Sunner upload; select lets every signed-in Sunner view every
-- kudos's images in the feed, not just their own uploads. No update/delete
-- -- images are immutable once a kudos is submitted (removing a thumbnail
-- pre-submit happens client-side, before upload). Path convention:
-- kudos/{sender_id}/{kudos_id}/{position}-{original_filename}. Rollback:
-- drop policy "images_insert_authenticated" on storage.objects; drop policy
-- "images_select_authenticated" on storage.objects.
create policy "images_insert_authenticated"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'images');

create policy "images_select_authenticated"
on storage.objects
for select
to authenticated
using (bucket_id = 'images');
