-- Olayinka Boja Enterprise — database setup
-- Run this once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- Safe to re-run; every statement guards against already existing.

-- ---------------------------------------------------------------------------
-- Product codes. Each fabric gets a short human code like OBE-0042 so she can
-- match a WhatsApp message back to the exact roll on her shelf.
-- ---------------------------------------------------------------------------
create sequence if not exists product_code_seq start 1;

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null
                default 'OBE-' || lpad(nextval('product_code_seq')::text, 4, '0'),
  name        text not null,
  price       numeric(12, 2),
  category    text,
  image_path  text not null,
  in_stock    boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists products_created_at_idx
  on public.products (created_at desc);
create index if not exists products_category_idx
  on public.products (category);

-- ---------------------------------------------------------------------------
-- Row level security.
-- Anyone may read the catalogue. Only a signed in user may change it, and
-- accounts are created by hand in the dashboard, so there is no public signup.
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;

drop policy if exists "Catalogue is public" on public.products;
create policy "Catalogue is public"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "Owner can add products" on public.products;
create policy "Owner can add products"
  on public.products for insert
  to authenticated
  with check (true);

drop policy if exists "Owner can edit products" on public.products;
create policy "Owner can edit products"
  on public.products for update
  to authenticated
  using (true) with check (true);

drop policy if exists "Owner can remove products" on public.products;
create policy "Owner can remove products"
  on public.products for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Image storage. Public read so WhatsApp can fetch the preview thumbnail;
-- writes restricted to signed in users.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

drop policy if exists "Fabric photos are public" on storage.objects;
create policy "Fabric photos are public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'products');

drop policy if exists "Owner can upload photos" on storage.objects;
create policy "Owner can upload photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products');

drop policy if exists "Owner can replace photos" on storage.objects;
create policy "Owner can replace photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'products') with check (bucket_id = 'products');

drop policy if exists "Owner can delete photos" on storage.objects;
create policy "Owner can delete photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products');
