-- ED BUSINESS CENTER — migration ateliers, actualités et coordinateur principal
-- À exécuter dans Supabase SQL Editor après sauvegarde de la base.
-- IMPORTANT : cette migration ne connecte PAS encore le prestataire de paiement.
-- Une réservation créée par l'application reste donc "pending" et ne constitue pas un ticket confirmé.

begin;

-- 1) Catégorisation des publications : communauté ou actualités.
alter table public.publications
  add column if not exists category text not null default 'community';

-- Les valeurs autorisées sont explicites pour éviter des catégories arbitraires.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'publications_category_check'
      and conrelid = 'public.publications'::regclass
  ) then
    alter table public.publications
      add constraint publications_category_check
      check (category in ('community', 'news'));
  end if;
end $$;

create index if not exists publications_category_published_created_idx
  on public.publications (category, is_published, created_at desc);

-- 2) Ateliers publics : seuls les comptes autorisés peuvent créer/modifier les ateliers.
create table if not exists public.workshops (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 3 and 180),
  description text not null default '',
  image_url text,
  starts_at timestamptz,
  location text,
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workshops_status_starts_at_idx
  on public.workshops (status, starts_at);

alter table public.workshops enable row level security;
revoke all on public.workshops from anon, authenticated;
grant select on public.workshops to anon, authenticated;
grant insert, update, delete on public.workshops to authenticated;

drop policy if exists "Public can view published workshops" on public.workshops;
create policy "Public can view published workshops"
  on public.workshops for select to anon, authenticated
  using (status = 'published');

drop policy if exists "Admin and trainers manage workshops" on public.workshops;
create policy "Admin and trainers manage workshops"
  on public.workshops for all to authenticated
  using (exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role in ('admin', 'trainer', 'formatrice')
  ))
  with check (exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role in ('admin', 'trainer', 'formatrice')
  ));

-- 3) Réservations. Aucune réservation n'est confirmée par le navigateur.
create table if not exists public.workshop_reservations (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null check (length(trim(full_name)) between 2 and 120),
  phone text not null check (length(trim(phone)) between 5 and 30),
  amount_xaf integer not null default 2500 check (amount_xaf = 2500),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'refunded')),
  payment_reference text,
  payment_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workshop_id, user_id)
);

create index if not exists workshop_reservations_workshop_status_idx
  on public.workshop_reservations (workshop_id, status, created_at desc);

alter table public.workshop_reservations enable row level security;
revoke all on public.workshop_reservations from anon, authenticated;
grant select on public.workshop_reservations to authenticated;

drop policy if exists "Users view own workshop reservations" on public.workshop_reservations;
create policy "Users view own workshop reservations"
  on public.workshop_reservations for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Staff view workshop reservations" on public.workshop_reservations;
create policy "Staff view workshop reservations"
  on public.workshop_reservations for select to authenticated
  using (exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role in ('admin', 'trainer', 'formatrice')
  ));

create or replace function public.create_workshop_reservation(
  p_workshop_id uuid,
  p_full_name text,
  p_phone text
) returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_reservation_id uuid;
begin
  if v_user_id is null then
    raise exception 'Connexion obligatoire pour réserver.' using errcode = '28000';
  end if;
  if length(trim(coalesce(p_full_name, ''))) < 2 or length(trim(coalesce(p_full_name, ''))) > 120 then
    raise exception 'Nom complet invalide.' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_phone, ''))) < 5 or length(trim(coalesce(p_phone, ''))) > 30 then
    raise exception 'Numéro de téléphone invalide.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.workshops where id = p_workshop_id and status = 'published') then
    raise exception 'Cet atelier n''est pas disponible.' using errcode = '22023';
  end if;

  insert into public.workshop_reservations (workshop_id, user_id, full_name, phone, amount_xaf, status)
  values (p_workshop_id, v_user_id, trim(p_full_name), trim(p_phone), 2500, 'pending')
  on conflict (workshop_id, user_id) do update
    set full_name = excluded.full_name,
        phone = excluded.phone,
        amount_xaf = 2500,
        status = case when public.workshop_reservations.status = 'confirmed' then 'confirmed' else 'pending' end,
        updated_at = now()
  returning id into v_reservation_id;

  return jsonb_build_object(
    'reservation_id', v_reservation_id,
    'status', 'pending',
    'amount_xaf', 2500,
    'message', 'Demande enregistrée. Aucun ticket n''est confirmé avant vérification du paiement.'
  );
end;
$$;
revoke all on function public.create_workshop_reservation(uuid, text, text) from public, anon;
grant execute on function public.create_workshop_reservation(uuid, text, text) to authenticated;

-- Liste publique limitée aux participants dont le paiement a été vérifié.
create or replace function public.get_workshop_confirmed_participants(p_workshop_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'full_name', r.full_name,
    'avatar_url', p.avatar_url,
    'confirmed_at', r.payment_verified_at
  ) order by r.payment_verified_at asc), '[]'::jsonb)
  from public.workshop_reservations r
  left join public.profiles p on p.id = r.user_id
  where r.workshop_id = p_workshop_id and r.status = 'confirmed'
    and r.payment_verified_at is not null;
$$;
revoke all on function public.get_workshop_confirmed_participants(uuid) from public;
grant execute on function public.get_workshop_confirmed_participants(uuid) to anon, authenticated;

-- À appeler uniquement depuis un backend de paiement fiable utilisant la clé service_role.
-- Ne pas appeler cette fonction depuis le navigateur.
create or replace function public.mark_workshop_payment_verified(
  p_reservation_id uuid,
  p_payment_reference text
) returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Réservé au backend de paiement.' using errcode = '42501';
  end if;
  if length(trim(coalesce(p_payment_reference, ''))) < 4 then
    raise exception 'Référence de paiement invalide.' using errcode = '22023';
  end if;
  update public.workshop_reservations
    set status = 'confirmed',
        payment_reference = trim(p_payment_reference),
        payment_verified_at = now(),
        updated_at = now()
  where id = p_reservation_id and status = 'pending';
  return found;
end;
$$;
revoke all on function public.mark_workshop_payment_verified(uuid, text) from public, anon, authenticated;

-- 3b) Autoriser les rôles nécessaires dans user_roles sans toucher aux autres colonnes.
do $$
declare c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.user_roles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.user_roles drop constraint %I', c.conname);
  end loop;
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_roles_role_allowed_check'
      and conrelid = 'public.user_roles'::regclass
  ) then
    alter table public.user_roles
      add constraint user_roles_role_allowed_check
      check (role in ('client', 'apprenant', 'trainer', 'formatrice', 'admin'));
  end if;
end $$;

-- 4) Coordonnées de sécurité du coordinateur principal.
create table if not exists public.platform_security_settings (
  singleton boolean primary key default true check (singleton),
  coordinator_user_id uuid references auth.users(id) on delete restrict,
  maintenance_mode boolean not null default false,
  maintenance_message text not null default 'APPLICATION FERMÉE — maintenance en cours',
  updated_at timestamptz not null default now()
);
insert into public.platform_security_settings (singleton)
values (true) on conflict (singleton) do nothing;

alter table public.platform_security_settings enable row level security;
revoke all on public.platform_security_settings from anon, authenticated;

create or replace function public.get_platform_public_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'maintenance_mode', maintenance_mode,
    'maintenance_message', maintenance_message
  )
  from public.platform_security_settings where singleton = true;
$$;
revoke all on function public.get_platform_public_status() from public;
grant execute on function public.get_platform_public_status() to anon, authenticated;

create or replace function public.coordinator_get_control_state()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  v_authorized boolean;
  v_settings jsonb;
begin
  select (coordinator_user_id = auth.uid()),
    jsonb_build_object('maintenance_mode', maintenance_mode, 'maintenance_message', maintenance_message)
  into v_authorized, v_settings
  from public.platform_security_settings where singleton = true;
  return jsonb_build_object('authorized', coalesce(v_authorized, false), 'settings', coalesce(v_settings, '{}'::jsonb));
end;
$$;
revoke all on function public.coordinator_get_control_state() from public;
grant execute on function public.coordinator_get_control_state() to authenticated;

create or replace function public.coordinator_list_users()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare v_result jsonb;
begin
  if not exists (select 1 from public.platform_security_settings where singleton = true and coordinator_user_id = auth.uid()) then
    raise exception 'Accès coordinateur refusé.' using errcode = '42501';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'full_name', coalesce(p.full_name, u.raw_user_meta_data->>'full_name', ''),
    'role', coalesce(ur.role, 'client'),
    'is_banned', (u.banned_until is not null and u.banned_until > now()),
    'is_coordinator', (u.id = s.coordinator_user_id)
  ) order by u.created_at desc), '[]'::jsonb)
  into v_result
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join public.user_roles ur on ur.user_id = u.id
  cross join public.platform_security_settings s
  where s.singleton = true;
  return v_result;
end;
$$;
revoke all on function public.coordinator_list_users() from public;
grant execute on function public.coordinator_list_users() to authenticated;

create or replace function public.coordinator_set_user_role(p_target_user_id uuid, p_new_role text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not exists (select 1 from public.platform_security_settings where singleton = true and coordinator_user_id = auth.uid()) then
    raise exception 'Accès coordinateur refusé.' using errcode = '42501';
  end if;
  if p_target_user_id is null or p_target_user_id = auth.uid() then
    raise exception 'Le rôle du coordinateur principal ne peut pas être modifié ici.' using errcode = '42501';
  end if;
  if p_new_role not in ('client', 'apprenant', 'trainer', 'formatrice', 'admin') then
    raise exception 'Rôle non autorisé.' using errcode = '22023';
  end if;
  if not exists (select 1 from auth.users where id = p_target_user_id) then
    raise exception 'Compte introuvable.' using errcode = 'P0002';
  end if;
  insert into public.user_roles (user_id, role) values (p_target_user_id, p_new_role)
  on conflict (user_id) do update set role = excluded.role;
  return jsonb_build_object('message', 'Rôle mis à jour.');
end;
$$;
revoke all on function public.coordinator_set_user_role(uuid, text) from public;
grant execute on function public.coordinator_set_user_role(uuid, text) to authenticated;

create or replace function public.coordinator_set_user_ban(p_target_user_id uuid, p_banned boolean)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not exists (select 1 from public.platform_security_settings where singleton = true and coordinator_user_id = auth.uid()) then
    raise exception 'Accès coordinateur refusé.' using errcode = '42501';
  end if;
  if p_target_user_id is null or p_target_user_id = auth.uid() then
    raise exception 'Le coordinateur principal ne peut pas se bloquer lui-même.' using errcode = '42501';
  end if;
  if not exists (select 1 from auth.users where id = p_target_user_id) then
    raise exception 'Compte introuvable.' using errcode = 'P0002';
  end if;
  update auth.users set banned_until = case when p_banned then now() + interval '100 years' else null end
  where id = p_target_user_id;
  return jsonb_build_object('message', case when p_banned then 'Compte bloqué.' else 'Compte réactivé.' end);
end;
$$;
revoke all on function public.coordinator_set_user_ban(uuid, boolean) from public;
grant execute on function public.coordinator_set_user_ban(uuid, boolean) to authenticated;

create or replace function public.coordinator_delete_user(p_target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not exists (select 1 from public.platform_security_settings where singleton = true and coordinator_user_id = auth.uid()) then
    raise exception 'Accès coordinateur refusé.' using errcode = '42501';
  end if;
  if p_target_user_id is null or p_target_user_id = auth.uid() then
    raise exception 'Le coordinateur principal ne peut pas supprimer son propre compte.' using errcode = '42501';
  end if;
  if exists (select 1 from public.platform_security_settings where singleton = true and coordinator_user_id = p_target_user_id) then
    raise exception 'Le coordinateur principal est protégé.' using errcode = '42501';
  end if;
  delete from auth.users where id = p_target_user_id;
  if not found then raise exception 'Compte introuvable.' using errcode = 'P0002'; end if;
  return jsonb_build_object('message', 'Compte supprimé.');
end;
$$;
revoke all on function public.coordinator_delete_user(uuid) from public;
grant execute on function public.coordinator_delete_user(uuid) to authenticated;

create or replace function public.coordinator_set_maintenance(p_enabled boolean, p_message text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not exists (select 1 from public.platform_security_settings where singleton = true and coordinator_user_id = auth.uid()) then
    raise exception 'Accès coordinateur refusé.' using errcode = '42501';
  end if;
  update public.platform_security_settings
    set maintenance_mode = coalesce(p_enabled, false),
        maintenance_message = left(coalesce(nullif(trim(p_message), ''), 'APPLICATION FERMÉE — maintenance en cours'), 300),
        updated_at = now()
  where singleton = true;
  return jsonb_build_object('message', case when p_enabled then 'Application fermée en mode maintenance.' else 'Application réouverte.' end);
end;
$$;
revoke all on function public.coordinator_set_maintenance(boolean, text) from public;
grant execute on function public.coordinator_set_maintenance(boolean, text) to authenticated;

-- Publications : les membres peuvent publier/supprimer leurs propres posts communautaires.
-- Les actualités restent réservées aux administrateurs et formateurs.
drop policy if exists "Members publish community posts" on public.publications;
create policy "Members publish community posts"
  on public.publications for insert to authenticated
  with check (
    author_id = auth.uid()
    and category = 'community'
    and is_published = true
  );

drop policy if exists "Members delete own community posts" on public.publications;
create policy "Members delete own community posts"
  on public.publications for delete to authenticated
  using (author_id = auth.uid() and category = 'community');

drop policy if exists "Staff publish news posts" on public.publications;
create policy "Staff publish news posts"
  on public.publications for insert to authenticated
  with check (
    category = 'news'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role in ('admin', 'trainer', 'formatrice')
    )
  );

commit;

-- ÉTAPE MANUELLE OBLIGATOIRE POUR ACTIVER LE COORDINATEUR :
-- 1. Créer le compte coordinateur dans Supabase Authentication.
-- 2. Copier son UUID depuis Authentication > Users.
-- 3. Remplacer UUID_DU_COORDINATEUR ci-dessous et exécuter séparément :
-- update public.platform_security_settings
-- set coordinator_user_id = 'UUID_DU_COORDINATEUR'::uuid, updated_at = now()
-- where singleton = true;
-- Ne jamais mettre la clé service_role dans le frontend ni dans GitHub.
