-- Phase 01 (F005/F006): kudos cluster -- tables, RLS, aggregate view and the
-- atomic create_kudos RPC. Rollback: drop function
-- public.create_kudos(uuid, uuid, jsonb, boolean, text, uuid[], text[]);
-- drop view public.kudos_card_view; drop table public.secret_box_gift,
-- public.special_days, public.heart, public.kudos_hashtag, public.kudos_image,
-- public.kudos, public.hashtag, public.department cascade.

-- ---------------------------------------------------------------------------
-- department: seed-only reference list for the Phong ban filter dropdown.
-- Admin manages via Studio/SQL, same pattern as special_days below.
-- ---------------------------------------------------------------------------
create table public.department (
  name text primary key
);

alter table public.department enable row level security;

create policy "department_select_authenticated"
on public.department
for select
to authenticated
using (true);

grant select on public.department to authenticated;

-- ---------------------------------------------------------------------------
-- hashtag: seed-only reference list for the hashtag picker + board filter.
-- No app-side insert -- the "+ Hashtag" control is a picker over this fixed
-- set, not a tag-creation form.
-- ---------------------------------------------------------------------------
create table public.hashtag (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.hashtag enable row level security;

create policy "hashtag_select_authenticated"
on public.hashtag
for select
to authenticated
using (true);

grant select on public.hashtag to authenticated;

-- ---------------------------------------------------------------------------
-- kudos: one row per submitted "Viet Kudo". No heart_count column --
-- deliberately not denormalized (YAGNI); heart counts are a live aggregate
-- via kudos_card_view.
-- ---------------------------------------------------------------------------
create table public.kudos (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id),
  receiver_id uuid not null references auth.users (id),
  content jsonb not null,
  is_anonymous boolean not null default false,
  anonymous_display_name text,
  created_at timestamptz not null default now()
);

alter table public.kudos enable row level security;

create policy "kudos_select_authenticated"
on public.kudos
for select
to authenticated
using (true);

create policy "kudos_insert_own"
on public.kudos
for insert
to authenticated
with check (sender_id = auth.uid());

grant select, insert on public.kudos to authenticated;

-- ---------------------------------------------------------------------------
-- kudos_image: up to 5 images per kudos. Immutable once submitted -- no
-- update/delete policy.
-- ---------------------------------------------------------------------------
create table public.kudos_image (
  id uuid primary key default gen_random_uuid(),
  kudos_id uuid not null references public.kudos (id) on delete cascade,
  storage_path text not null,
  position smallint not null,
  created_at timestamptz not null default now(),
  constraint kudos_image_position_range check (position between 0 and 4)
);

alter table public.kudos_image enable row level security;

create policy "kudos_image_select_authenticated"
on public.kudos_image
for select
to authenticated
using (true);

create policy "kudos_image_insert_own"
on public.kudos_image
for insert
to authenticated
with check (
  exists (
    select 1 from public.kudos k
    where k.id = kudos_id and k.sender_id = auth.uid()
  )
);

grant select, insert on public.kudos_image to authenticated;

-- ---------------------------------------------------------------------------
-- kudos_hashtag: 1-5 rows per kudos, join table. PK doubles as the
-- "no duplicate tag per kudos" rule.
-- ---------------------------------------------------------------------------
create table public.kudos_hashtag (
  kudos_id uuid not null references public.kudos (id) on delete cascade,
  hashtag_id uuid not null references public.hashtag (id),
  primary key (kudos_id, hashtag_id)
);

alter table public.kudos_hashtag enable row level security;

create policy "kudos_hashtag_select_authenticated"
on public.kudos_hashtag
for select
to authenticated
using (true);

create policy "kudos_hashtag_insert_own"
on public.kudos_hashtag
for insert
to authenticated
with check (
  exists (
    select 1 from public.kudos k
    where k.id = kudos_id and k.sender_id = auth.uid()
  )
);

grant select, insert on public.kudos_hashtag to authenticated;

-- ---------------------------------------------------------------------------
-- heart: one row per (kudos, liker) -- the row's existence is the "liked"
-- state. PK doubles as the "one heart per user per kudo" rule.
-- granted_amount is decided server-side (special_days check) before insert
-- -- see Phase 05's write layer; not a DB-level invariant.
-- ---------------------------------------------------------------------------
create table public.heart (
  kudos_id uuid not null references public.kudos (id) on delete cascade,
  user_id uuid not null references auth.users (id),
  granted_amount smallint not null check (granted_amount in (1, 2)),
  created_at timestamptz not null default now(),
  primary key (kudos_id, user_id)
);

alter table public.heart enable row level security;

create policy "heart_select_authenticated"
on public.heart
for select
to authenticated
using (true);

-- `user_id <> sender_id` is BR "sender cannot heart own kudo", enforced at
-- the database, not just the UI.
create policy "heart_insert_not_self"
on public.heart
for insert
to authenticated
with check (
  user_id = auth.uid()
  and user_id <> (select sender_id from public.kudos where id = kudos_id)
);

create policy "heart_delete_own"
on public.heart
for delete
to authenticated
using (user_id = auth.uid());

grant select, insert, delete on public.heart to authenticated;

-- ---------------------------------------------------------------------------
-- special_days: admin-configured dates that double the heart grant. Seed
-- empty -- admin populates via SQL/Studio; no admin UI this round.
-- ---------------------------------------------------------------------------
create table public.special_days (
  day date primary key
);

alter table public.special_days enable row level security;

create policy "special_days_select_authenticated"
on public.special_days
for select
to authenticated
using (true);

grant select on public.special_days to authenticated;

-- ---------------------------------------------------------------------------
-- secret_box_gift: minimal admin-managed log of Secret Box redemptions, so
-- the sidebar counters and the future "most recent gift recipients"
-- leaderboard read a real (if currently empty) DB source instead of a
-- hardcoded 0 (clarifications.md Session 2026-08-31). No write path for
-- `authenticated` this round -- the redemption flow ships in a later round.
-- ---------------------------------------------------------------------------
create table public.secret_box_gift (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users (id),
  granted_at timestamptz not null default now()
);

alter table public.secret_box_gift enable row level security;

create policy "secret_box_gift_select_authenticated"
on public.secret_box_gift
for select
to authenticated
using (true);

grant select on public.secret_box_gift to authenticated;

-- ---------------------------------------------------------------------------
-- kudos_card_view: kudos joined with heart aggregate, sender/receiver
-- profile, hashtags and image paths -- one query, not N+1. `security_invoker`
-- is required: without it the view runs as its owner and silently bypasses
-- the RLS on the tables it joins. Lateral subqueries keep the fan-out from
-- hearts/hashtags/images from multiplying rows.
-- ---------------------------------------------------------------------------
create view public.kudos_card_view
with (security_invoker = true) as
select
  k.id,
  k.sender_id,
  sender.full_name as sender_full_name,
  sender.avatar_url as sender_avatar_url,
  k.receiver_id,
  receiver.full_name as receiver_full_name,
  receiver.avatar_url as receiver_avatar_url,
  k.content,
  k.is_anonymous,
  k.anonymous_display_name,
  k.created_at,
  hearts.heart_count,
  coalesce(hashtags.hashtag_ids, '{}') as hashtag_ids,
  coalesce(hashtags.hashtag_names, '{}') as hashtag_names,
  coalesce(images.image_paths, '{}') as image_paths
from public.kudos k
join public.profile sender on sender.id = k.sender_id
join public.profile receiver on receiver.id = k.receiver_id
left join lateral (
  select count(*)::int as heart_count
  from public.heart h
  where h.kudos_id = k.id
) hearts on true
left join lateral (
  select
    array_agg(ht.id order by ht.name) as hashtag_ids,
    array_agg(ht.name order by ht.name) as hashtag_names
  from public.kudos_hashtag kh
  join public.hashtag ht on ht.id = kh.hashtag_id
  where kh.kudos_id = k.id
) hashtags on true
left join lateral (
  select array_agg(ki.storage_path order by ki.position) as image_paths
  from public.kudos_image ki
  where ki.kudos_id = k.id
) images on true;

grant select on public.kudos_card_view to authenticated;

-- ---------------------------------------------------------------------------
-- create_kudos: one transaction inserting kudos + kudos_hashtag +
-- kudos_image, RLS-checked as the caller (`security invoker`). Guards the
-- 1-5 hashtag and <=5 image ceilings so a partial write (e.g. a kudos with 0
-- hashtags) can never land at rest -- BR-003. An unhandled `raise exception`
-- inside a plpgsql function rolls back every change the function made.
-- ---------------------------------------------------------------------------
create function public.create_kudos(
  p_id uuid,
  p_receiver uuid,
  p_content jsonb,
  p_is_anonymous boolean,
  p_display_name text,
  p_hashtag_ids uuid[],
  p_image_paths text[]
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_hashtag_count int := coalesce(array_length(p_hashtag_ids, 1), 0);
  v_image_count int := coalesce(array_length(p_image_paths, 1), 0);
  v_hashtag_id uuid;
  v_image_path text;
  v_position smallint := 0;
begin
  if v_hashtag_count < 1 or v_hashtag_count > 5 then
    raise exception 'create_kudos: hashtag count must be between 1 and 5, got %', v_hashtag_count;
  end if;

  if v_image_count > 5 then
    raise exception 'create_kudos: image count must not exceed 5, got %', v_image_count;
  end if;

  insert into public.kudos (id, sender_id, receiver_id, content, is_anonymous, anonymous_display_name)
  values (p_id, auth.uid(), p_receiver, p_content, p_is_anonymous, p_display_name);

  foreach v_hashtag_id in array p_hashtag_ids loop
    insert into public.kudos_hashtag (kudos_id, hashtag_id) values (p_id, v_hashtag_id);
  end loop;

  foreach v_image_path in array p_image_paths loop
    insert into public.kudos_image (kudos_id, storage_path, position) values (p_id, v_image_path, v_position);
    v_position := v_position + 1;
  end loop;

  return p_id;
end;
$$;

grant execute on function public.create_kudos(uuid, uuid, jsonb, boolean, text, uuid[], text[]) to authenticated;
