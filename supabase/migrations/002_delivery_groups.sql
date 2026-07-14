-- 합배송 모임
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

create index if not exists delivery_groups_status_idx
  on public.delivery_groups (status);
create index if not exists delivery_groups_created_at_idx
  on public.delivery_groups (created_at desc);

-- 개인 주문 = null, 합배송 참여 = group id
alter table public.orders
  add column if not exists delivery_group_id uuid
    references public.delivery_groups (id) on delete set null;

create index if not exists orders_delivery_group_id_idx
  on public.orders (delivery_group_id);

-- RLS
alter table public.delivery_groups enable row level security;

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

drop policy if exists "groups_admin_all" on public.delivery_groups;
create policy "groups_admin_all" on public.delivery_groups
  for all to authenticated
  using (true) with check (true);
