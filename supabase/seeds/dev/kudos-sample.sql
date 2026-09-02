-- Opt-in dev seed: one sample kudos between the first two locally signed-in
-- accounts, for manual /kudos board QA. NEVER auto-applied -- outside the
-- "./seeds/common/*.sql" glob (supabase/config.toml [db.seed]), so a plain
-- `supabase db reset` never touches it. Run it explicitly:
--
--   SUPABASE_EXTRA_SEEDS=./seeds/dev/kudos-sample.sql supabase db reset
--
-- Requires >= 2 signed-in local accounts (public.profile rows) already
-- present -- inserts nothing otherwise (no invented users). The body copy
-- below is a structural placeholder, not MoMorph design content: this seed
-- is a local dev convenience, and no kudos card body text is sourced in any
-- spec/test-case row for this phase (same gap-flagging precedent as the
-- round-1 C2.4-C2.6 placeholder copy, docs note).
--
-- Not idempotent across re-runs (each run adds one more sample kudos) --
-- acceptable for a manual, opt-in dev convenience seed.
do $$
declare
  v_kudos_id uuid := gen_random_uuid();
  v_sender uuid;
  v_receiver uuid;
  v_hashtag_id uuid;
begin
  select id into v_sender from public.profile order by created_at limit 1;
  select id into v_receiver from public.profile order by created_at offset 1 limit 1;

  if v_sender is null or v_receiver is null then
    raise notice 'kudos-sample seed: fewer than 2 local profiles -- skipped';
    return;
  end if;

  insert into public.kudos (id, sender_id, receiver_id, content, is_anonymous)
  values (
    v_kudos_id,
    v_sender,
    v_receiver,
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Sample kudos -- dev seed placeholder, not design copy."}]}]}'::jsonb,
    false
  );

  for v_hashtag_id in select id from public.hashtag order by name limit 2 loop
    insert into public.kudos_hashtag (kudos_id, hashtag_id) values (v_kudos_id, v_hashtag_id);
  end loop;
end $$;
