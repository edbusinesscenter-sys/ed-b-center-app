-- ED B-CENTER : actualités, interactions, points et notifications
alter table public.profiles add column if not exists points integer not null default 0;
-- À exécuter dans Supabase SQL Editor avant d’activer ces écrans.

create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  body text not null default '',
  image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.publication_interactions (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.publications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  interaction_type text not null check (interaction_type in ('like','comment')),
  content text,
  created_at timestamptz not null default now(),
  constraint comment_requires_content check (interaction_type <> 'comment' or length(trim(coalesce(content,''))) > 0)
);
create index if not exists publication_interactions_post_idx on public.publication_interactions(publication_id, created_at);
create index if not exists publication_interactions_user_idx on public.publication_interactions(user_id, publication_id);

-- Une ligne de points par compte et publication : les likes/commentaires multiples ne rapportent jamais un deuxième point.
create table if not exists public.publication_point_awards (
  publication_id uuid not null references public.publications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (publication_id, user_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  link text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);

alter table public.publications enable row level security;
alter table public.publication_interactions enable row level security;
alter table public.publication_point_awards enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Published posts visible to signed-in users" on public.publications;
create policy "Published posts visible to signed-in users" on public.publications for select to authenticated using (is_published = true);
drop policy if exists "Users can see interactions on visible posts" on public.publication_interactions;
create policy "Users can see interactions on visible posts" on public.publication_interactions for select to authenticated using (exists (select 1 from public.publications p where p.id = publication_id and p.is_published = true));
drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users can mark own notifications read" on public.notifications;
create policy "Users can mark own notifications read" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Role is checked in the database; only admins can publish or manage posts.
create or replace function public.is_ed_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin');
$$;

drop policy if exists "Admins manage publications" on public.publications;
create policy "Admins manage publications" on public.publications for all to authenticated using (public.is_ed_admin()) with check (public.is_ed_admin());

create or replace function public.interact_with_publication(
  p_publication_id uuid,
  p_interaction_type text,
  p_content text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_awarded boolean := false;
  v_points integer := 0;
  v_interaction_id uuid;
begin
  if v_user is null then raise exception 'Authentification requise'; end if;
  if p_interaction_type not in ('like','comment') then raise exception 'Action non valide'; end if;
  if not exists (select 1 from public.publications where id = p_publication_id and is_published = true) then raise exception 'Publication introuvable'; end if;
  if p_interaction_type = 'comment' and length(trim(coalesce(p_content,''))) = 0 then raise exception 'Le commentaire est vide'; end if;

  -- Un seul like par compte et publication; les commentaires restent multiples.
  if p_interaction_type = 'like' then
    if not exists (select 1 from public.publication_interactions where publication_id=p_publication_id and user_id=v_user and interaction_type='like') then
      insert into public.publication_interactions(publication_id,user_id,interaction_type) values(p_publication_id,v_user,'like') returning id into v_interaction_id;
    end if;
  else
    insert into public.publication_interactions(publication_id,user_id,interaction_type,content) values(p_publication_id,v_user,'comment',left(trim(p_content),1000)) returning id into v_interaction_id;
  end if;

  insert into public.publication_point_awards(publication_id,user_id) values(p_publication_id,v_user) on conflict do nothing;
  v_awarded := found;
  if v_awarded then
    update public.profiles set points = coalesce(points,0) + 1 where id = v_user returning points into v_points;
    if not found then
      insert into public.profiles(id, points) values(v_user,1) on conflict(id) do update set points=coalesce(public.profiles.points,0)+1 returning points into v_points;
    end if;
  else
    select coalesce(points,0) into v_points from public.profiles where id=v_user;
  end if;
  return jsonb_build_object('points_awarded',v_awarded,'total_points',coalesce(v_points,0),'interaction_id',v_interaction_id);
end;
$$;
grant execute on function public.interact_with_publication(uuid,text,text) to authenticated;

-- Realtime notifications : activer la table notifications dans Supabase Realtime si ce n’est pas déjà fait.
