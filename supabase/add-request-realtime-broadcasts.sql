drop policy if exists "request_broadcast_read_access" on realtime.messages;
drop policy if exists "app_broadcast_read_access" on realtime.messages;
create policy "app_broadcast_read_access"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and (
    (
      realtime.topic() = 'dashboard:admin'
      and public.current_user_role()::text = 'admin'
    )
    or (
      split_part(realtime.topic(), ':', 1) = 'company'
      and (
        public.current_user_role()::text = 'admin'
        or (
          public.current_user_role()::text = 'supervisor'
          and split_part(realtime.topic(), ':', 2) = public.current_user_company_id()::text
        )
      )
    )
    or (
      split_part(realtime.topic(), ':', 1) = 'user'
      and split_part(realtime.topic(), ':', 2) = auth.uid()::text
    )
    or (
      split_part(realtime.topic(), ':', 1) = 'request'
      and exists (
        select 1
        from public.requests r
        where r.id::text = split_part(realtime.topic(), ':', 2)
          and (
            public.current_user_role()::text = 'admin'
            or (
              public.current_user_role()::text = 'supervisor'
              and r.company_id = public.current_user_company_id()
            )
            or (
              public.current_user_role()::text = 'ops'
              and r.company_id = public.current_user_company_id()
              and r.created_by = auth.uid()
            )
          )
      )
    )
  )
);

create or replace function public.broadcast_request_refresh()
returns trigger
security definer
language plpgsql
set search_path = public
as $$
declare
  request_key text;
  company_key text;
  owner_key text;
begin
  if TG_TABLE_NAME = 'requests' then
    request_key := coalesce(
      to_jsonb(NEW) ->> 'id',
      to_jsonb(OLD) ->> 'id'
    );
    company_key := coalesce(
      to_jsonb(NEW) ->> 'company_id',
      to_jsonb(OLD) ->> 'company_id'
    );
    owner_key := coalesce(
      to_jsonb(NEW) ->> 'created_by',
      to_jsonb(OLD) ->> 'created_by'
    );
  elsif TG_TABLE_NAME in (
    'storyboards',
    'videos',
    'storyboard_comments',
    'doctor_review_sessions',
    'doctor_storyboard_review_sessions'
  ) then
    request_key := coalesce(
      to_jsonb(NEW) ->> 'request_id',
      to_jsonb(OLD) ->> 'request_id'
    );

    if request_key is not null and request_key <> '' then
      select r.company_id::text, r.created_by::text
      into company_key, owner_key
      from public.requests r
      where r.id::text = request_key;
    end if;
  else
    return coalesce(NEW, OLD);
  end if;

  if request_key is null or request_key = '' then
    return coalesce(NEW, OLD);
  end if;

  perform realtime.send(
    jsonb_build_object(
      'request_id', request_key,
      'schema', TG_TABLE_SCHEMA,
      'table', TG_TABLE_NAME,
      'operation', TG_OP
    ),
    'refresh',
    'request:' || request_key,
    true
  );

  perform realtime.send(
    jsonb_build_object(
      'request_id', request_key,
      'schema', TG_TABLE_SCHEMA,
      'table', TG_TABLE_NAME,
      'operation', TG_OP
    ),
    'refresh',
    'dashboard:admin',
    true
  );

  if company_key is not null and company_key <> '' then
    perform realtime.send(
      jsonb_build_object(
        'request_id', request_key,
        'company_id', company_key,
        'schema', TG_TABLE_SCHEMA,
        'table', TG_TABLE_NAME,
        'operation', TG_OP
      ),
      'refresh',
      'company:' || company_key,
      true
    );
  end if;

  if owner_key is not null and owner_key <> '' then
    perform realtime.send(
      jsonb_build_object(
        'request_id', request_key,
        'user_id', owner_key,
        'schema', TG_TABLE_SCHEMA,
        'table', TG_TABLE_NAME,
        'operation', TG_OP
      ),
      'refresh',
      'user:' || owner_key,
      true
    );
  end if;

  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists broadcast_request_refresh_on_requests on public.requests;
create trigger broadcast_request_refresh_on_requests
after insert or update or delete on public.requests
for each row
execute function public.broadcast_request_refresh();

drop trigger if exists broadcast_request_refresh_on_storyboards on public.storyboards;
create trigger broadcast_request_refresh_on_storyboards
after insert or update or delete on public.storyboards
for each row
execute function public.broadcast_request_refresh();

drop trigger if exists broadcast_request_refresh_on_videos on public.videos;
create trigger broadcast_request_refresh_on_videos
after insert or update or delete on public.videos
for each row
execute function public.broadcast_request_refresh();

drop trigger if exists broadcast_request_refresh_on_storyboard_comments on public.storyboard_comments;
create trigger broadcast_request_refresh_on_storyboard_comments
after insert or update or delete on public.storyboard_comments
for each row
execute function public.broadcast_request_refresh();

drop trigger if exists broadcast_request_refresh_on_doctor_review_sessions on public.doctor_review_sessions;
create trigger broadcast_request_refresh_on_doctor_review_sessions
after insert or update or delete on public.doctor_review_sessions
for each row
execute function public.broadcast_request_refresh();

drop trigger if exists broadcast_request_refresh_on_doctor_storyboard_review_sessions on public.doctor_storyboard_review_sessions;
create trigger broadcast_request_refresh_on_doctor_storyboard_review_sessions
after insert or update or delete on public.doctor_storyboard_review_sessions
for each row
execute function public.broadcast_request_refresh();
