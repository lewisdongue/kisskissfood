-- Fix friend_requests trigger referencing NEW.user_id
-- Error seen from PostgREST:
--   record "new" has no field "user_id"
--
-- Run this in Supabase Dashboard -> SQL Editor.
-- It creates/replaces the default notification triggers for friend requests
-- using friend_requests.from_user_id and friend_requests.to_user_id.

-- 1) Inspect existing triggers/functions on friend_requests (optional)
-- select t.tgname, pg_get_triggerdef(t.oid) as trigger_def, p.proname
-- from pg_trigger t
-- join pg_class c on c.oid = t.tgrelid
-- join pg_namespace n on n.oid = c.relnamespace
-- join pg_proc p on p.oid = t.tgfoid
-- where n.nspname='public' and c.relname='friend_requests' and not t.tgisinternal;

-- 2) Create/replace friend request notification function (INSERT)
create or replace function public.notify_friend_request()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Notify the recipient (to_user_id) that they received a friend request
  insert into public.notifications (user_id, type, title, message, data, read, created_at, sent_via)
  values (
    new.to_user_id,
    'friend_request_received',
    'New friend request',
    'The person you are talking to wants to be friends.',
    jsonb_build_object(
      'friend_id', new.from_user_id,
      'request_id', new.id
    ),
    false,
    now(),
    array['in_app']::text[]
  )
  on conflict on constraint unique_user_notification_dedup do nothing;

  return new;
end;
$$;

-- 3) Create/replace friend accepted notification function (UPDATE -> accepted)
create or replace function public.notify_friend_accepted()
returns trigger
language plpgsql
security definer
as $$
begin
  if (new.status = 'accepted' and old.status is distinct from 'accepted') then
    -- Notify BOTH users that friendship is accepted
    insert into public.notifications (user_id, type, title, message, data, read, created_at, sent_via)
    values
      (
        new.from_user_id,
        'friend_accepted',
        'Friend request accepted',
        'You are now connected as friends.',
        jsonb_build_object('friend_id', new.to_user_id, 'request_id', new.id),
        false,
        now(),
        array['in_app']::text[]
      ),
      (
        new.to_user_id,
        'friend_accepted',
        'Friend request accepted',
        'You are now connected as friends.',
        jsonb_build_object('friend_id', new.from_user_id, 'request_id', new.id),
        false,
        now(),
        array['in_app']::text[]
      );
    -- If you have dedup constraints, make this safe to run even if multiple triggers fire
    -- in the same transaction.
    -- NOTE: Postgres applies ON CONFLICT to the full INSERT, but with multi-row VALUES,
    -- it will skip conflicting rows and insert the rest.
    -- We keep this separate to preserve readability.
    -- (No-op: statement-level comment only)
  end if;

  return new;
end;
$$;

-- 4) Ensure triggers exist and point at the corrected functions
drop trigger if exists trg_notify_friend_request on public.friend_requests;
create trigger trg_notify_friend_request
after insert on public.friend_requests
for each row
execute function public.notify_friend_request();

drop trigger if exists trg_notify_friend_accepted on public.friend_requests;
create trigger trg_notify_friend_accepted
after update of status on public.friend_requests
for each row
execute function public.notify_friend_accepted();


