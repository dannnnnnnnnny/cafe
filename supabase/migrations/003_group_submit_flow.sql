-- 합배송: 모집(open) → 어드민 전송(submitted) → 완료/취소
-- 참가 주문은 모집 중 draft, 전송 시 pending

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('draft', 'pending', 'done', 'cancelled'));

alter table public.delivery_groups drop constraint if exists delivery_groups_status_check;
alter table public.delivery_groups add constraint delivery_groups_status_check
  check (status in ('open', 'closed', 'submitted', 'done', 'cancelled'));

update public.delivery_groups set status = 'submitted' where status = 'closed';

update public.orders o
set status = 'draft'
from public.delivery_groups g
where o.delivery_group_id = g.id
  and g.status = 'open'
  and o.status = 'pending';
