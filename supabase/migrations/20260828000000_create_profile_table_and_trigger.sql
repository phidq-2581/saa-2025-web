-- Phase 01 (F001): profile table, RLS, and the auth.users provisioning trigger.
--
-- public.profile mirrors auth.users 1:1 and carries the app-level `role`
-- (admin | member) that Supabase itself has no concept of. The row is
-- provisioned by a security-definer trigger on auth.users insert, so
-- provisioning is atomic with account creation and never relies on app
-- code running after sign-in.
create table public.profile (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  department text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

alter table public.profile enable row level security;

-- A signed-in user may read only their own profile row. No insert/update/
-- delete policy is added here (YAGNI) — inserts happen exclusively via the
-- trigger's definer rights, and there is no self-service profile edit yet.
create policy "profile_select_own"
on public.profile
for select
to authenticated
using (auth.uid() = id);

grant select on public.profile to authenticated;

-- security definer is required: the trigger fires as part of the
-- auth.users insert, which the calling role has no insert grant on
-- public.profile for. search_path is pinned to `public` to avoid
-- search-path hijacking, standard hardening for a definer function.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profile (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
