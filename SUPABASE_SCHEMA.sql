-- ============================================================
-- IdeaComida · Esquema de Supabase (idempotente)
-- Ejecuta este archivo completo en: Supabase > SQL Editor
-- Se puede volver a ejecutar sin romper datos existentes.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. Parejas
-- ------------------------------------------------------------
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  name text,
  invite_code text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.couples add column if not exists invite_code text;
alter table public.couples add column if not exists created_by uuid references auth.users (id) on delete set null;

-- Rellena códigos para parejas creadas con versiones anteriores.
update public.couples
set invite_code = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
where invite_code is null;

alter table public.couples alter column invite_code set not null;
alter table public.couples
  alter column invite_code
  set default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

create unique index if not exists couples_invite_code_key on public.couples (invite_code);

-- ------------------------------------------------------------
-- 2. Perfiles
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text,
  couple_id uuid references public.couples (id) on delete set null,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists couple_id uuid references public.couples (id) on delete set null;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

-- ------------------------------------------------------------
-- 3. Comidas
-- ------------------------------------------------------------
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  brand_id text not null,
  item text,
  rating integer check (rating is null or (rating between 1 and 5)),
  notes text,
  eaten_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. Ofertas / cupones
-- ------------------------------------------------------------
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  brand_id text not null,
  title text not null,
  description text not null,
  code text,
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5. Índices
-- ------------------------------------------------------------
create index if not exists idx_meals_couple on public.meals (couple_id, eaten_at desc);
create index if not exists idx_meals_brand on public.meals (brand_id);
create index if not exists idx_deals_brand on public.deals (brand_id, is_active);

-- ------------------------------------------------------------
-- 6. Row Level Security
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.meals enable row level security;
alter table public.deals enable row level security;

-- Elimina políticas de versiones anteriores para poder recrearlas.
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can view own couple" on public.couples;
drop policy if exists "Users can create couple" on public.couples;
drop policy if exists "Couple can view own meals" on public.meals;
drop policy if exists "Couple can insert own meals" on public.meals;
drop policy if exists "Authenticated users can view deals" on public.deals;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "couples_select_member" on public.couples;
drop policy if exists "couples_insert_own" on public.couples;
drop policy if exists "couples_update_owner" on public.couples;
drop policy if exists "meals_select_couple" on public.meals;
drop policy if exists "meals_insert_couple" on public.meals;
drop policy if exists "meals_update_couple" on public.meals;
drop policy if exists "meals_delete_couple" on public.meals;
drop policy if exists "deals_select_authenticated" on public.deals;

-- Perfiles: cada usuario solo ve y edita el suyo.
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- El couple_id solo se cambia mediante las funciones seguras de abajo.
revoke update on public.profiles from anon, authenticated;
grant update (name, avatar_url) on public.profiles to authenticated;

-- Parejas: solo sus miembros pueden verlas.
create policy "couples_select_member" on public.couples
  for select to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.couple_id = couples.id
    )
  );

-- Nota: las parejas se crean/editan solo con las funciones seguras de abajo,
-- por eso no exponemos políticas de INSERT/UPDATE directas en esta tabla.

-- Comidas: solo la pareja dueña puede leer / crear / editar / borrar.
create policy "meals_select_couple" on public.meals
  for select to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.couple_id = meals.couple_id
    )
  );

create policy "meals_insert_couple" on public.meals
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.couple_id = meals.couple_id
    )
  );

create policy "meals_update_couple" on public.meals
  for update to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.couple_id = meals.couple_id
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.couple_id = meals.couple_id
    )
  );

create policy "meals_delete_couple" on public.meals
  for delete to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.couple_id = meals.couple_id
    )
  );

-- Ofertas: lectura pública para usuarios autenticados.
create policy "deals_select_authenticated" on public.deals
  for select to authenticated
  using (true);

-- ------------------------------------------------------------
-- 7. Funciones seguras para gestionar la pareja
-- ------------------------------------------------------------
create or replace function public.create_couple(p_name text default null)
returns table (id uuid, name text, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  if exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.couple_id is not null
  ) then
    raise exception 'Ya perteneces a una pareja';
  end if;

  insert into public.couples (name, created_by)
  values (nullif(trim(coalesce(p_name, '')), ''), auth.uid())
  returning couples.id into v_id;

  update public.profiles
  set couple_id = v_id
  where profiles.id = auth.uid();

  return query
    select c.id, c.name, c.invite_code
    from public.couples c
    where c.id = v_id;
end;
$$;

create or replace function public.join_couple_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  if exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.couple_id is not null
  ) then
    raise exception 'Ya perteneces a una pareja';
  end if;

  select c.id into v_id
  from public.couples c
  where upper(c.invite_code) = upper(trim(p_code));

  if v_id is null then
    raise exception 'Código inválido';
  end if;

  update public.profiles
  set couple_id = v_id
  where profiles.id = auth.uid();

  return v_id;
end;
$$;

create or replace function public.leave_couple()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  update public.profiles
  set couple_id = null
  where profiles.id = auth.uid();
end;
$$;

revoke all on function public.create_couple(text) from public;
revoke all on function public.join_couple_by_code(text) from public;
revoke all on function public.leave_couple() from public;

grant execute on function public.create_couple(text) to authenticated;
grant execute on function public.join_couple_by_code(text) to authenticated;
grant execute on function public.leave_couple() to authenticated;

-- ------------------------------------------------------------
-- 8. Perfil automático al registrar un usuario
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'name')
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(public.profiles.name, excluded.name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 9. Mantener el correo del perfil sincronizado (opcional pero útil)
-- ------------------------------------------------------------
create or replace function public.handle_user_email_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_updated();

-- ------------------------------------------------------------
-- 10. Realtime
-- ------------------------------------------------------------
-- La app escucha los cambios de comidas y ofertas para reflejarlos al
-- instante entre dispositivos. `replica identity full` hace que los eventos
-- DELETE incluyan `couple_id`, necesario para filtrar y aplicar RLS.
alter table public.meals replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'meals'
    ) then
      alter publication supabase_realtime add table public.meals;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'deals'
    ) then
      alter publication supabase_realtime add table public.deals;
    end if;
  end if;
end $$;
