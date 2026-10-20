-- ED BUSINESS CENTER — interactions de la communauté et téléversement des avatars
-- À exécuter dans Supabase SQL Editor après sauvegarde.
-- Prérequis : public.profiles, public.publications et le bucket public ed-b-center-images existent.

begin;

-- Les points affichés par l'application sont conservés dans le profil.
alter table public.profiles
  add column if not exists points integer not null default 0;

-- Réactions et commentaires sur les publications.
create table if not exists public.publication_interactions (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.publications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  interaction_type text not null check (interaction_type in ('like', 'comment')),
  content text,
  points_awarded boolean not null default false,
  created_at timestamptz not null default now(),
  constraint publication_comment_content_check
    check (interaction_type <> 'comment' or length(trim(coalesce(content, ''))) between 1 and 1000)
);

create index if not exists publication_interactions_publication_created_idx
  on public.publication_interactions (publication_id, created_at desc);
create index if not exists publication_interactions_user_publication_idx
  on public.publication_interactions (user_id, publication_id);
create unique index if not exists publication_interactions_unique_like_idx
  on public.publication_interactions (publication_id, user_id)
  where interaction_type = 'like';

alter table public.publication_interactions enable row level security;
revoke all on public.publication_interactions from anon, authenticated;
grant select on public.publication_interactions to authenticated;

drop policy if exists "Members read interactions on published posts" on public.publication_interactions;
create policy "Members read interactions on published posts"
  on public.publication_interactions for select to authenticated
  using (exists (
    select 1 from public.publications p
    where p.id = publication_id and p.is_published = true
  ));

-- Toutes les écritures passent par cette fonction afin d'attribuer au maximum
-- un point par membre et par publication, qu'il aime ou commente.
create or replace function public.interact_with_publication(
  p_publication_id uuid,
  p_interaction_type text,
  p_content text default null
) returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_had_interaction boolean;
  v_points_awarded boolean := false;
  v_total_points integer := 0;
  v_content text := nullif(trim(coalesce(p_content, '')), '');
begin
  if v_user_id is null then
    raise exception 'Connexion obligatoire.' using errcode = '28000';
  end if;
  if p_interaction_type not in ('like', 'comment') then
    raise exception 'Type d’interaction invalide.' using errcode = '22023';
  end if;
  if p_interaction_type = 'comment' and (v_content is null or length(v_content) > 1000) then
    raise exception 'Le commentaire doit contenir entre 1 et 1000 caractères.' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.publications
    where id = p_publication_id and is_published = true and category = 'community'
  ) then
    raise exception 'Publication communautaire indisponible.' using errcode = 'P0002';
  end if;

  -- Sérialiser les interactions du compte afin d'éviter les doubles points concurrents.
  perform 1 from public.profiles where id = v_user_id for update;
  select exists (
    select 1 from public.publication_interactions
    where publication_id = p_publication_id and user_id = v_user_id
  ) into v_had_interaction;

  insert into public.publication_interactions
    (publication_id, user_id, interaction_type, content, points_awarded)
  values
    (p_publication_id, v_user_id, p_interaction_type, case when p_interaction_type = 'comment' then v_content else null end,
     not v_had_interaction)
  on conflict do nothing;

  if not v_had_interaction then
    -- Une interaction existante pourrait avoir été créée par une requête concurrente;
    -- n'ajouter le point que si cette transaction a réellement inséré la ligne.
    if found then
      update public.profiles set points = coalesce(points, 0) + 1 where id = v_user_id;
      v_points_awarded := found;
      if v_points_awarded then
        update public.publication_interactions
          set points_awarded = true
          where id = (
            select id from public.publication_interactions
            where publication_id = p_publication_id and user_id = v_user_id
              and interaction_type = p_interaction_type
            order by created_at desc limit 1
          );
      end if;
    end if;
  end if;

  select coalesce(points, 0) into v_total_points
    from public.profiles where id = v_user_id;

  return jsonb_build_object(
    'points_awarded', coalesce(v_points_awarded, false),
    'total_points', coalesce(v_total_points, 0)
  );
end;
$$;
revoke all on function public.interact_with_publication(uuid, text, text) from public;
grant execute on function public.interact_with_publication(uuid, text, text) to authenticated;

-- Autoriser un membre à téléverser/modifier uniquement ses propres photos de profil.
-- Les images publiques de la racine du bucket restent lisibles comme avant.
drop policy if exists "Members upload own ED B-CENTER avatar" on storage.objects;
create policy "Members upload own ED B-CENTER avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'ed-b-center-images'
    and (storage.foldername(name))[1] = 'user-avatars'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "Members update own ED B-CENTER avatar" on storage.objects;
create policy "Members update own ED B-CENTER avatar"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'ed-b-center-images'
    and (storage.foldername(name))[1] = 'user-avatars'
    and (storage.foldername(name))[2] = auth.uid()::text
  )
  with check (
    bucket_id = 'ed-b-center-images'
    and (storage.foldername(name))[1] = 'user-avatars'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

commit;
