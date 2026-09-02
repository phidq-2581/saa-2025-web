-- Phase 01 (F005/F006): widen public.profile select so any authenticated
-- Sunner can read any profile row (recipient autocomplete, @mention search,
-- sender/receiver display, /profile stub) -- clarifications.md Session
-- 2026-08-31: "khong co cot nhay cam trong bang". Replaces
-- profile_select_own rather than stacking a second permissive policy --
-- Postgres ORs multiple permissive select policies together, so leaving both
-- would make the old one dead weight. Rollback: drop policy
-- "profile_select_all_authenticated" on public.profile; recreate
-- profile_select_own using (auth.uid() = id).
drop policy "profile_select_own" on public.profile;

create policy "profile_select_all_authenticated"
on public.profile
for select
to authenticated
using (true);
