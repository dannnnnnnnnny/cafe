"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { formatPrice, formatWhen } from "@/lib/cart";
import type {
  DeliveryGroup,
  GroupStatus,
  Order,
  OrderStatus,
} from "@/lib/types";

const STATUS_KO: Record<GroupStatus, string> = {
  open: "모집 중",
  closed: "마감",
  done: "완료",
  cancelled: "취소",
};

const badgeClass: Record<GroupStatus, string> = {
  open: "badge-pending",
  closed: "badge-pending",
  done: "badge-done",
  cancelled: "badge-cancelled",
};

export function GroupList({ groups: initial }: { groups: DeliveryGroup[] }) {
  const router = useRouter();
  const [groups, setGroups] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(id: string, status: GroupStatus) {
    setBusy(id);
    const supabase = createBrowserSupabase();
    const { error } = await supabase
      .from("delivery_groups")
      .update({ status })
      .eq("id", id);
    if (error) {
      setBusy(null);
      alert(error.message);
      return;
    }

    // 완료/취소 시 소속 pending 주문 일괄 동기화
    if (status === "done" || status === "cancelled") {
      const orderStatus = status === "done" ? "done" : "cancelled";
      await supabase
        .from("orders")
        .update({ status: orderStatus })
        .eq("delivery_group_id", id)
        .eq("status", "pending");
    }

    setBusy(null);
    setGroups((prev) =>
      prev.map((g): DeliveryGroup => {
        if (g.id !== id) return g;
        let orders = g.orders;
        if (status === "done" || status === "cancelled") {
          const orderStatus: OrderStatus =
            status === "done" ? "done" : "cancelled";
          orders = g.orders?.map((o) =>
            o.status === "pending" ? { ...o, status: orderStatus } : o,
          );
        }
        return { ...g, status, orders };
      }),
    );
    router.refresh();
  }

  if (groups.length === 0) {
    return (
      <div className="card px-6 py-14 text-center">
        <p className="mb-2 text-3xl">🏢</p>
        <p className="font-semibold">합배송 모임이 없습니다</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {groups.map((g) => {
        const orders = (g.orders ?? []) as Order[];
        const total = orders.reduce(
          (s, o) =>
            s +
            (o.order_items?.reduce(
              (ss, i) => ss + i.unit_price * i.quantity,
              0,
            ) ?? 0),
          0,
        );
        const expanded = openId === g.id;

        return (
          <li key={g.id} className="card p-4 space-y-3">
            <button
              type="button"
              className="flex w-full items-start justify-between gap-2 text-left"
              onClick={() => setOpenId(expanded ? null : g.id)}
            >
              <div>
                <p className="text-lg font-bold">{g.company_name}</p>
                <p className="text-sm text-ink-muted">
                  #{g.code} · {orders.length}명 · {formatWhen(g.preferred_at)}
                </p>
                <p className="mt-1 text-sm text-ink-muted">📍 {g.delivery_address}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`badge ${badgeClass[g.status]}`}>
                  {STATUS_KO[g.status]}
                </span>
                <span className="text-sm font-bold text-coffee">
                  {formatPrice(total)}
                </span>
                <span className="text-xs text-ink-muted">
                  {expanded ? "접기" : "펼치기"}
                </span>
              </div>
            </button>

            {expanded && (
              <div className="space-y-3 border-t border-cream-dark pt-3">
                <p className="text-xs text-ink-muted">
                  주최 {g.host_name}
                  {g.host_phone ? ` · ${g.host_phone}` : ""}
                </p>
                {orders.length === 0 ? (
                  <p className="text-sm text-ink-muted">아직 참가 주문 없음</p>
                ) : (
                  <ul className="space-y-2">
                    {orders.map((o) => {
                      const sub =
                        o.order_items?.reduce(
                          (s, i) => s + i.unit_price * i.quantity,
                          0,
                        ) ?? 0;
                      return (
                        <li
                          key={o.id}
                          className="rounded-xl bg-cream px-3 py-2 text-sm"
                        >
                          <div className="flex justify-between font-semibold">
                            <span>
                              {o.customer_name}{" "}
                              <span className="font-normal text-ink-muted">
                                · {o.customer_phone} · #{o.order_number}
                              </span>
                            </span>
                            <span className="text-coffee">{formatPrice(sub)}</span>
                          </div>
                          <ul className="mt-1 text-ink-muted">
                            {o.order_items?.map((i) => (
                              <li key={i.id}>
                                {i.menu_name_snapshot} × {i.quantity}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-1 text-xs text-ink-muted">
                            {o.want_point_earn ? "포인트" : "포인트X"} ·{" "}
                            {o.want_cash_receipt
                              ? `영수증 ${o.cash_receipt_phone || ""}`
                              : "영수증X"}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="flex flex-wrap gap-2">
                  {g.status === "open" && (
                    <button
                      type="button"
                      className="btn btn-ghost flex-1 text-sm py-2.5"
                      disabled={busy === g.id}
                      onClick={() => setStatus(g.id, "closed")}
                    >
                      마감
                    </button>
                  )}
                  {(g.status === "open" || g.status === "closed") && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary flex-1 text-sm py-2.5"
                        disabled={busy === g.id}
                        onClick={() => setStatus(g.id, "done")}
                      >
                        완료
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger flex-1 text-sm py-2.5"
                        disabled={busy === g.id}
                        onClick={() => setStatus(g.id, "cancelled")}
                      >
                        취소
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
