-- ED B-CENTER : actions des réservations et notifications d'administration.
-- À exécuter dans Supabase SQL Editor après sauvegarde de la base.
-- Cette migration ne crée aucun paiement automatique : elle enregistre uniquement la vérification manuelle par un administrateur.

create or replace function public.admin_update_workshop_reservation(
  p_reservation_id uuid,
  p_new_status text,
  p_payment_reference text default null,
  p_note text default null
) returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_reservation public.workshop_reservations%rowtype;
  v_admin boolean;
  v_title text;
  v_body text;
begin
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  ) into v_admin;
  if not v_admin then
    raise exception 'Accès réservé à un administrateur.' using errcode = '42501';
  end if;

  if p_new_status not in ('confirmed', 'cancelled', 'refunded') then
    raise exception 'Statut invalide.' using errcode = '22023';
  end if;
  if p_new_status = 'confirmed' and length(trim(coalesce(p_payment_reference, ''))) < 4 then
    raise exception 'Une référence de paiement vérifiée est obligatoire.' using errcode = '22023';
  end if;
  if p_new_status = 'refunded' and length(trim(coalesce(p_note, ''))) < 3 then
    raise exception 'Une note attestant le remboursement est obligatoire.' using errcode = '22023';
  end if;

  select * into v_reservation
  from public.workshop_reservations
  where id = p_reservation_id
  for update;
  if not found then
    raise exception 'Réservation introuvable.' using errcode = 'P0002';
  end if;
  if v_reservation.status = 'refunded' then
    raise exception 'Cette réservation est déjà remboursée.' using errcode = '22023';
  end if;
  if v_reservation.status = 'cancelled' and p_new_status <> 'cancelled' then
    raise exception 'Une réservation annulée ne peut pas être réactivée par cette action.' using errcode = '22023';
  end if;
  if p_new_status = 'confirmed' and v_reservation.status <> 'pending' then
    raise exception 'Seules les réservations en attente peuvent être confirmées.' using errcode = '22023';
  end if;
  if p_new_status = 'refunded' and v_reservation.status <> 'confirmed' then
    raise exception 'Seule une réservation confirmée peut être marquée remboursée.' using errcode = '22023';
  end if;

  update public.workshop_reservations
  set status = p_new_status,
      payment_reference = case when p_new_status = 'confirmed' then trim(p_payment_reference) else payment_reference end,
      payment_verified_at = case when p_new_status = 'confirmed' then now() else payment_verified_at end,
      updated_at = now()
  where id = p_reservation_id;

  v_title := case p_new_status
    when 'confirmed' then 'Ticket atelier confirmé'
    when 'cancelled' then 'Réservation annulée'
    else 'Remboursement enregistré'
  end;
  v_body := case p_new_status
    when 'confirmed' then 'Ton paiement a été vérifié par ED BUSINESS CENTER. Ta réservation est confirmée.'
    when 'cancelled' then 'Ta réservation a été annulée.'
    else 'Le remboursement a été enregistré par l’équipe. Note : ' || trim(p_note)
  end;

  -- Les notifications client sont envoyées par le trigger après le changement de statut.
  -- On conserve ici une notification aux autres administrateurs pour la traçabilité.
  insert into public.notifications (user_id, title, body, link, created_at)
  select ur.user_id, 'Réservation mise à jour',
         'Réservation ' || p_reservation_id::text || ' : ' || p_new_status || coalesce(' — ' || nullif(trim(p_note), ''), ''),
         'reservations', now()
  from (
    select user_id from public.user_roles where role = 'admin'
    union select coordinator_user_id as user_id from public.platform_security_settings where coordinator_user_id is not null
  ) ur
  where ur.user_id <> auth.uid();

  return true;
end;
$$;
revoke all on function public.admin_update_workshop_reservation(uuid, text, text, text) from public, anon;
grant execute on function public.admin_update_workshop_reservation(uuid, text, text, text) to authenticated;

-- Notifications pour les nouvelles réservations et changements de statut.
create or replace function public.notify_workshop_reservation_change()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_admin record;
  v_title text;
  v_body text;
begin
  if tg_op = 'INSERT' then
    v_title := 'Nouvelle réservation d’atelier';
    v_body := coalesce(new.full_name, 'Un client') || ' a réservé un ticket de ' || coalesce(new.amount_xaf::text, '0') || ' FCFA. Vérifie le paiement avant confirmation.';
    for v_admin in (select user_id from public.user_roles where role = 'admin' union select coordinator_user_id as user_id from public.platform_security_settings where coordinator_user_id is not null) loop
      insert into public.notifications (user_id, title, body, link, created_at)
      values (v_admin.user_id, v_title, v_body, 'reservations', now());
    end loop;
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status then
    v_title := 'Mise à jour de ta réservation';
    v_body := case new.status
      when 'confirmed' then 'Ton ticket d’atelier est confirmé après vérification du paiement.'
      when 'cancelled' then 'Ta réservation d’atelier a été annulée.'
      when 'refunded' then 'Le statut de ta réservation a été mis à jour en remboursée.'
      else 'Le statut de ta réservation a changé : ' || new.status
    end;
    insert into public.notifications (user_id, title, body, link, created_at)
    values (new.user_id, v_title, v_body, 'ateliers', now());
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists workshop_reservation_notifications on public.workshop_reservations;
create trigger workshop_reservation_notifications
after insert or update of status on public.workshop_reservations
for each row execute function public.notify_workshop_reservation_change();

-- Notifications d'administration pour les nouvelles publications et interactions communautaires,
-- si ces tables existent dans ce projet. La fonction ignore les tables absentes.
create or replace function public.notify_admin_activity()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_admin record;
  v_actor uuid;
  v_title text;
  v_body text;
  v_json jsonb;
begin
  v_json := to_jsonb(new);
  begin v_actor := nullif(v_json->>'user_id','')::uuid; exception when others then v_actor := null; end;
  if v_actor is null then
    begin v_actor := nullif(v_json->>'author_id','')::uuid; exception when others then v_actor := null; end;
  end if;
  v_title := case tg_table_name
    when 'publications' then 'Nouvelle publication'
    when 'publication_interactions' then 'Nouvelle interaction communautaire'
    when 'workshops' then 'Nouvel atelier créé'
    when 'session_enrollments' then 'Nouvelle demande de formation'
    when 'training_submissions' then 'Nouveau travail envoyé'
    when 'profiles' then 'Profil créé ou mis à jour'
    else 'Nouvelle activité dans l’application'
  end;
  v_body := v_title || ' — ouvre l’administration pour consulter les détails.';
  for v_admin in (select user_id from public.user_roles where role = 'admin' and user_id is distinct from v_actor union select coordinator_user_id as user_id from public.platform_security_settings where coordinator_user_id is not null and coordinator_user_id is distinct from v_actor) loop
    insert into public.notifications (user_id, title, body, link, created_at)
    values (v_admin.user_id, v_title, v_body, case when tg_table_name = 'workshops' then 'ateliers' when tg_table_name in ('session_enrollments','training_submissions') then 'admin' else 'community' end, now());
  end loop;
  return new;
end;
$$;

do $$
begin
  if to_regclass('public.publications') is not null then
    execute 'drop trigger if exists notify_admin_publications on public.publications';
    execute 'create trigger notify_admin_publications after insert on public.publications for each row execute function public.notify_admin_activity()';
  end if;
  if to_regclass('public.publication_interactions') is not null then
    execute 'drop trigger if exists notify_admin_publication_interactions on public.publication_interactions';
    execute 'create trigger notify_admin_publication_interactions after insert on public.publication_interactions for each row execute function public.notify_admin_activity()';
  end if;
  if to_regclass('public.workshops') is not null then
    execute 'drop trigger if exists notify_admin_workshops on public.workshops';
    execute 'create trigger notify_admin_workshops after insert on public.workshops for each row execute function public.notify_admin_activity()';
  end if;
  if to_regclass('public.session_enrollments') is not null then
    execute 'drop trigger if exists notify_admin_session_enrollments on public.session_enrollments';
    execute 'create trigger notify_admin_session_enrollments after insert on public.session_enrollments for each row execute function public.notify_admin_activity()';
  end if;
  if to_regclass('public.training_submissions') is not null then
    execute 'drop trigger if exists notify_admin_training_submissions on public.training_submissions';
    execute 'create trigger notify_admin_training_submissions after insert on public.training_submissions for each row execute function public.notify_admin_activity()';
  end if;
end $$;


-- Notification d'administration à la création d'un compte Auth.
create or replace function public.notify_admin_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare v_admin record;
begin
  for v_admin in (select user_id from public.user_roles where role = 'admin' union select coordinator_user_id as user_id from public.platform_security_settings where coordinator_user_id is not null) loop
    insert into public.notifications (user_id, title, body, link, created_at)
    values (v_admin.user_id, 'Nouvel utilisateur inscrit',
            'Un nouveau compte vient d’être créé. Consulte la gestion des utilisateurs.', 'admin', now());
  end loop;
  return new;
end;
$$;
drop trigger if exists notify_admin_new_auth_user on auth.users;
create trigger notify_admin_new_auth_user after insert on auth.users
for each row execute function public.notify_admin_new_auth_user();

-- Messagerie interne liée aux réservations : les clients et l'équipe voient les messages qui les concernent.
create table if not exists public.user_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete set null,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  body text not null,
  related_reservation_id uuid references public.workshop_reservations(id) on delete set null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists user_messages_recipient_created_idx
  on public.user_messages (recipient_id, created_at desc);
create index if not exists user_messages_sender_created_idx
  on public.user_messages (sender_id, created_at desc);
alter table public.user_messages enable row level security;
revoke all on public.user_messages from anon, authenticated;
grant select on public.user_messages to authenticated;
grant update (read_at) on public.user_messages to authenticated;
drop policy if exists "Users read their own messages" on public.user_messages;
create policy "Users read their own messages" on public.user_messages
  for select to authenticated using (sender_id = auth.uid() or recipient_id = auth.uid());
drop policy if exists "Recipients mark messages read" on public.user_messages;
create policy "Recipients mark messages read" on public.user_messages
  for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

-- Le client transmet sa référence. Cela ne confirme JAMAIS le paiement : status reste pending.
create or replace function public.submit_workshop_payment_reference(
  p_reservation_id uuid,
  p_payment_reference text
) returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_reservation public.workshop_reservations%rowtype;
  v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Connexion obligatoire.' using errcode = '28000'; end if;
  if length(trim(coalesce(p_payment_reference, ''))) < 4 or length(trim(coalesce(p_payment_reference, ''))) > 120 then
    raise exception 'Référence de transaction invalide.' using errcode = '22023';
  end if;
  select * into v_reservation from public.workshop_reservations
  where id = p_reservation_id and user_id = v_user for update;
  if not found then raise exception 'Réservation introuvable ou accès refusé.' using errcode = '42501'; end if;
  if v_reservation.status <> 'pending' then raise exception 'Cette réservation n’est plus en attente.' using errcode = '22023'; end if;
  update public.workshop_reservations
  set payment_reference = trim(p_payment_reference), updated_at = now()
  where id = p_reservation_id;
  return true;
end;
$$;
revoke all on function public.submit_workshop_payment_reference(uuid, text) from public, anon;
grant execute on function public.submit_workshop_payment_reference(uuid, text) to authenticated;

-- Notifications et messages détaillés : référence reçue côté admin, confirmation détaillée côté client.
create or replace function public.notify_workshop_reservation_change()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_admin record;
  v_workshop public.workshops%rowtype;
  v_body text;
  v_date text;
  v_time text;
begin
  select * into v_workshop from public.workshops where id = new.workshop_id;
  if tg_op = 'INSERT' then
    v_body := coalesce(new.full_name, 'Un client') || ' a réservé un ticket de ' || coalesce(new.amount_xaf::text, '0') || ' FCFA pour l’atelier « ' || coalesce(v_workshop.title, 'Atelier') || ' ». Vérifie le paiement avant confirmation.';
    for v_admin in (select user_id from public.user_roles where role = 'admin' union select coordinator_user_id as user_id from public.platform_security_settings where coordinator_user_id is not null) loop
      insert into public.notifications (user_id, title, body, link, created_at)
      values (v_admin.user_id, 'Nouvelle réservation d’atelier', v_body, 'reservations', now());
    end loop;
  elsif old.payment_reference is distinct from new.payment_reference and nullif(trim(coalesce(new.payment_reference, '')), '') is not null and old.status = 'pending' and new.status = 'pending' then
    v_body := coalesce(new.full_name, 'Un client') || ' a transmis la référence de dépôt « ' || trim(new.payment_reference) || ' » pour ' || coalesce(new.amount_xaf::text, '0') || ' FCFA — atelier « ' || coalesce(v_workshop.title, 'Atelier') || ' ». Vérifie la transaction avant de confirmer.';
    for v_admin in (select user_id from public.user_roles where role = 'admin' union select coordinator_user_id as user_id from public.platform_security_settings where coordinator_user_id is not null) loop
      insert into public.notifications (user_id, title, body, link, created_at)
      values (v_admin.user_id, 'Référence de dépôt reçue', v_body, 'reservations', now());
      insert into public.user_messages (sender_id, recipient_id, subject, body, related_reservation_id)
      values (new.user_id, v_admin.user_id, 'Référence de dépôt — ' || coalesce(v_workshop.title, 'Atelier'), v_body, new.id);
    end loop;
  elsif old.status is distinct from new.status then
    if new.status = 'confirmed' then
      v_date := case when v_workshop.starts_at is not null then to_char(v_workshop.starts_at at time zone 'Africa/Douala', 'DD/MM/YYYY') else 'date à confirmer' end;
      v_time := case when v_workshop.starts_at is not null then to_char(v_workshop.starts_at at time zone 'Africa/Douala', 'HH24:MI') else 'heure à confirmer' end;
      v_body := 'Nous avons bien reçu votre paiement de ' || coalesce(new.amount_xaf::text, '2500') || ' FCFA chez ED B-CENTER (réf. ' || coalesce(nullif(trim(new.payment_reference), ''), 'non renseignée') || '). Votre participation à l’atelier « ' || coalesce(v_workshop.title, 'Atelier') || ' » du ' || v_date || ' à ' || v_time || ' au nom de ' || coalesce(new.full_name, 'participant') || ' est confirmée. Merci et à bientôt !';
    elsif new.status = 'cancelled' then
      v_body := 'Votre réservation pour l’atelier « ' || coalesce(v_workshop.title, 'Atelier') || ' » a été annulée. Si vous avez déjà payé, contactez ED BUSINESS CENTER.';
    elsif new.status = 'refunded' then
      v_body := 'Le remboursement de votre réservation pour l’atelier « ' || coalesce(v_workshop.title, 'Atelier') || ' » a été enregistré par ED BUSINESS CENTER.';
    else
      v_body := 'Le statut de votre réservation a changé : ' || new.status || '.';
    end if;
    insert into public.notifications (user_id, title, body, link, created_at)
    values (new.user_id,
      case new.status when 'confirmed' then 'Paiement reçu — ticket confirmé' when 'cancelled' then 'Réservation annulée' when 'refunded' then 'Remboursement enregistré' else 'Réservation mise à jour' end,
      v_body, 'ateliers', now());
    insert into public.user_messages (sender_id, recipient_id, subject, body, related_reservation_id)
    values ((select user_id from public.user_roles where role = 'admin' order by user_id limit 1), new.user_id,
      case new.status when 'confirmed' then 'Confirmation de votre ticket atelier' when 'cancelled' then 'Annulation de votre réservation' when 'refunded' then 'Remboursement de votre ticket' else 'Mise à jour de réservation' end,
      v_body, new.id);
  end if;
  return new;
end;
$$;
drop trigger if exists workshop_reservation_notifications on public.workshop_reservations;
create trigger workshop_reservation_notifications
  after insert or update on public.workshop_reservations
  for each row execute function public.notify_workshop_reservation_change();

-- Demandes de formation : conservation de la demande et notification interne avant ouverture de WhatsApp.
create table if not exists public.training_interest_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  course_title text not null check (length(trim(course_title)) between 2 and 180),
  course_price integer not null default 0 check (course_price >= 0),
  full_name text not null check (length(trim(full_name)) between 2 and 120),
  phone text not null check (length(trim(phone)) between 5 and 30),
  city text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'enrolled', 'cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists training_interest_requests_created_idx
  on public.training_interest_requests (created_at desc);
alter table public.training_interest_requests enable row level security;
revoke all on public.training_interest_requests from anon, authenticated;
grant insert on public.training_interest_requests to anon, authenticated;
grant select, update on public.training_interest_requests to authenticated;
drop policy if exists "Public can submit training interest" on public.training_interest_requests;
create policy "Public can submit training interest" on public.training_interest_requests
  for insert to anon, authenticated with check (user_id is null or user_id = auth.uid());
drop policy if exists "Admins manage training interest requests" on public.training_interest_requests;
create policy "Admins manage training interest requests" on public.training_interest_requests
  for select to authenticated using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));
drop policy if exists "Admins update training interest requests" on public.training_interest_requests;
create policy "Admins update training interest requests" on public.training_interest_requests
  for update to authenticated using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'))
  with check (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

create or replace function public.notify_admin_training_interest_request()
returns trigger language plpgsql security definer set search_path = public, auth as $$
declare v_admin record; v_body text;
begin
  v_body := new.full_name || ' souhaite s’inscrire à « ' || new.course_title || ' » (' || new.course_price::text || ' FCFA). Téléphone : ' || new.phone || coalesce(' — Ville : ' || nullif(new.city, ''), '') || coalesce(' — Précisions : ' || nullif(new.message, ''), '');
  for v_admin in (select user_id from public.user_roles where role = 'admin' union select coordinator_user_id as user_id from public.platform_security_settings where coordinator_user_id is not null) loop
    insert into public.notifications (user_id, title, body, link, created_at)
    values (v_admin.user_id, 'Nouvelle demande de formation', v_body, 'admin', now());
    insert into public.user_messages (sender_id, recipient_id, subject, body)
    values (new.user_id, v_admin.user_id, 'Demande de formation — ' || new.course_title, v_body);
  end loop;
  return new;
end $$;
drop trigger if exists notify_admin_training_interest_request on public.training_interest_requests;
create trigger notify_admin_training_interest_request after insert on public.training_interest_requests
for each row execute function public.notify_admin_training_interest_request();
