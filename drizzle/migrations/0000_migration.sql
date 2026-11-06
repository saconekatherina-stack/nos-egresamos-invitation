
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid());

-- First two registered accounts become the administrators; nobody else ever does automatically.
create or replace function public.assign_initial_admins()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(424242);
  if (select count(*) from public.user_roles where role = 'admin') < 2 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users
  for each row execute function public.assign_initial_admins();

-- Invitation settings (single row)
create table public.invitation_settings (
  id int primary key default 1 check (id = 1),
  name_one text not null default 'Katherina',
  name_two text not null default 'Naomi',
  headline text not null default '¡Nos egresamos!',
  year text not null default '2026',
  intro_title text not null default 'Están invitados',
  intro_message text not null default 'Después de tantos años compartidos, risas, desafíos y sueños, llegó el momento de celebrar. Nos encantaría que nos acompañen en esta noche tan especial.',
  event_date text,
  event_time text,
  venue_name text,
  venue_address text,
  maps_url text,
  dress_code text,
  rsvp_message text not null default 'Tu presencia es el mejor regalo. Confirmanos tu asistencia con un mensaje.',
  guestbook_intro text not null default 'Dejanos unas palabras. Solo nosotras vamos a poder leerlas.',
  gallery_intro text not null default 'Compartí tus fotos de la noche. Las publicaremos después de revisarlas.',
  farewell_title text not null default 'Gracias',
  farewell_message text not null default 'Gracias por ser parte de nuestra historia. Este logro también es de ustedes.',
  updated_at timestamptz not null default now()
);
grant select on public.invitation_settings to anon, authenticated;
grant update on public.invitation_settings to authenticated;
grant all on public.invitation_settings to service_role;
alter table public.invitation_settings enable row level security;
create policy "Anyone reads settings" on public.invitation_settings for select to anon, authenticated using (true);
create policy "Admins update settings" on public.invitation_settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
insert into public.invitation_settings (id) values (1);

-- Private guestbook
create table public.guest_messages (
  id uuid primary key default gen_random_uuid(),
  author_name text not null check (char_length(btrim(author_name)) between 1 and 80),
  message text not null check (char_length(btrim(message)) between 1 and 1500),
  created_at timestamptz not null default now()
);
grant insert on public.guest_messages to anon, authenticated;
grant select, delete on public.guest_messages to authenticated;
grant all on public.guest_messages to service_role;
alter table public.guest_messages enable row level security;
create policy "Anyone can write a message" on public.guest_messages for insert to anon, authenticated with check (true);
create policy "Admins read messages" on public.guest_messages for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete messages" on public.guest_messages for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Photos
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique check (storage_path ~ '^[0-9a-f-]{36}\.(jpg|png|webp)$'),
  uploader_name text check (uploader_name is null or char_length(uploader_name) <= 80),
  status text not null default 'pending' check (status in ('pending','approved')),
  created_at timestamptz not null default now()
);
grant insert on public.photos to anon, authenticated;
grant select on public.photos to anon;
grant select, update, delete on public.photos to authenticated;
grant all on public.photos to service_role;
alter table public.photos enable row level security;
create policy "Anyone submits pending photo" on public.photos for insert to anon, authenticated with check (status = 'pending');
create policy "Public sees approved photos" on public.photos for select to anon, authenticated
  using (status = 'approved' or public.has_role(auth.uid(), 'admin'));
create policy "Admins update photos" on public.photos for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete photos" on public.photos for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Abuse protection: global rate limits
create or replace function public.rate_limit_guest_messages()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.guest_messages where created_at > now() - interval '1 minute') >= 15 then
    raise exception 'Demasiados mensajes en poco tiempo. Probá de nuevo en un minuto.';
  end if;
  new.created_at := now();
  return new;
end $$;
create trigger guest_messages_rate before insert on public.guest_messages for each row execute function public.rate_limit_guest_messages();

create or replace function public.rate_limit_photos()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.photos where created_at > now() - interval '5 minutes') >= 40 then
    raise exception 'Se están subiendo muchas fotos. Probá de nuevo en unos minutos.';
  end if;
  if (select count(*) from public.photos where status = 'pending') >= 500 then
    raise exception 'La galería está recibiendo demasiadas fotos. Probá más tarde.';
  end if;
  new.status := 'pending';
  new.created_at := now();
  return new;
end $$;
create trigger photos_rate before insert on public.photos for each row execute function public.rate_limit_photos();

-- Storage policies for bucket 'photos' (private bucket; approved served via policy)
create policy "Anyone uploads photo files" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'photos' and name ~ '^[0-9a-f-]{36}\.(jpg|png|webp)$');
create policy "Approved photo files readable" on storage.objects for select to anon, authenticated
  using (bucket_id = 'photos' and (
    exists (select 1 from public.photos p where p.storage_path = name and p.status = 'approved')
    or public.has_role(auth.uid(), 'admin')));
create policy "Admins delete photo files" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.has_role(auth.uid(), 'admin'));
