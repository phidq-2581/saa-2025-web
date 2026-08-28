-- Opt-in dev seed: promotes exactly one local developer account to admin.
--
-- NEVER auto-applied. supabase/config.toml [db.seed].sql_paths only globs
-- "./seeds/common/*.sql" plus "env(SUPABASE_EXTRA_SEEDS)" — this file lives
-- under seeds/dev/, outside that glob, so a plain `supabase db reset` never
-- touches it. Run it explicitly:
--
--   SUPABASE_EXTRA_SEEDS=./seeds/dev/promote-admin.sql supabase db reset
--
-- Target: the git author's @sun-asterisk.com address (`git config user.email`).
-- The E2E admin/member fixtures (Phase 03) set their own role directly and
-- do not depend on this seed.
update public.profile
set role = 'admin'
where id in (
  select id from auth.users where email = 'duong.quang.phi@sun-asterisk.com'
);
