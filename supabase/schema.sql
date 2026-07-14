-- Cafe menu + orders schema (run in Supabase SQL editor)

create extension if not exists "pgcrypto";

-- ── menus ──────────────────────────────────────────────
create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null check (price >= 0),
  category text not null default '기타',
  image_url text,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ── delivery_groups (합배송) ────────────────────────────
create table if not exists public.delivery_groups (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  company_name text not null,
  delivery_address text not null,
  preferred_at timestamptz not null,
  host_name text not null,
  host_phone text,
  status text not null default 'open'
    check (status in ('open', 'closed', 'done', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists delivery_groups_status_idx on public.delivery_groups (status);
create index if not exists delivery_groups_created_at_idx on public.delivery_groups (created_at desc);

-- ── orders ─────────────────────────────────────────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  fulfillment_type text not null check (fulfillment_type in ('pickup', 'delivery')),
  preferred_at timestamptz not null,
  delivery_address text,
  want_point_earn boolean not null default false,
  want_cash_receipt boolean not null default false,
  cash_receipt_phone text,
  status text not null default 'pending'
    check (status in ('pending', 'done', 'cancelled')),
  delivery_group_id uuid references public.delivery_groups (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_delivery_group_id_idx on public.orders (delivery_group_id);

-- ── order_items ────────────────────────────────────────
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_id uuid references public.menus (id) on delete set null,
  menu_name_snapshot text not null,
  unit_price integer not null,
  quantity integer not null check (quantity > 0)
);

-- ── storage (menu images) ──────────────────────────────
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

-- ── RLS ────────────────────────────────────────────────
alter table public.menus enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.delivery_groups enable row level security;

-- menus: public read
drop policy if exists "menus_public_read" on public.menus;
create policy "menus_public_read" on public.menus
  for select using (true);

-- menus: authenticated write
drop policy if exists "menus_admin_all" on public.menus;
create policy "menus_admin_all" on public.menus
  for all to authenticated
  using (true) with check (true);

-- orders: public insert (guest checkout) — service role preferred in API
drop policy if exists "orders_public_insert" on public.orders;
create policy "orders_public_insert" on public.orders
  for insert to anon, authenticated
  with check (true);

drop policy if exists "orders_admin_select" on public.orders;
create policy "orders_admin_select" on public.orders
  for select to authenticated
  using (true);

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update to authenticated
  using (true) with check (true);

-- order_items
drop policy if exists "order_items_public_insert" on public.order_items;
create policy "order_items_public_insert" on public.order_items
  for insert to anon, authenticated
  with check (true);

drop policy if exists "order_items_admin_select" on public.order_items;
create policy "order_items_admin_select" on public.order_items
  for select to authenticated
  using (true);

-- delivery_groups
drop policy if exists "groups_public_read" on public.delivery_groups;
create policy "groups_public_read" on public.delivery_groups
  for select using (true);

drop policy if exists "groups_public_insert" on public.delivery_groups;
create policy "groups_public_insert" on public.delivery_groups
  for insert to anon, authenticated
  with check (true);

drop policy if exists "groups_admin_update" on public.delivery_groups;
create policy "groups_admin_update" on public.delivery_groups
  for update to authenticated
  using (true) with check (true);

-- storage policies for menu images
drop policy if exists "menu_images_public_read" on storage.objects;
create policy "menu_images_public_read" on storage.objects
  for select using (bucket_id = 'menu-images');

drop policy if exists "menu_images_admin_write" on storage.objects;
create policy "menu_images_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'menu-images')
  with check (bucket_id = 'menu-images');

-- ── seed ───────────────────────────────────────────────
insert into public.menus (name, description, price, category, is_available, sort_order)
select * from (values
  ('아메리카노', '깊고 깔끔한 에스프레소', 4500, '커피', true, 1),
  ('카페 라떼', '부드러운 우유 거품', 5000, '커피', true, 2),
  ('바닐라 라떼', '달콤한 바닐라 시럽', 5500, '커피', true, 3),
  ('말차 라떼', '진한 말차 + 우유', 5800, '논커피', true, 4),
  ('자몽 에이드', '상큼한 자몽', 5500, '논커피', true, 5),
  ('티라미수', '마스카포네 크림', 6500, '디저트', true, 6),
  ('초코 쿠키', '갓 구운 쿠키', 3500, '디저트', false, 7)
) as v(name, description, price, category, is_available, sort_order)
where not exists (select 1 from public.menus limit 1);
