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
  submitted: "주문 접수",
  done: "완료",
  cancelled: "취소",
};

const badgeClass: Record<GroupStatus, string> = {
  open: "badge-pending",
  closed: "badge-pending",
  submitted: "badge-pending",
  done: "badge-done",
  cancelled: "badge-cancelled",
};

export function GroupList({ groups: initial }: { groups: DeliveryGroup[] }) {
  const router = useRouter();
  const [groups, setGroups] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(
    initial.find((g) => g.status === "submitted")?.id ?? null,
  );
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

    if (status === "done" || status === "cancelled") {
      const orderStatus: OrderStatus =
        status === "done" ? "done" : "cancelled";
      await supabase
        .from("orders")
        .update({ status: orderStatus })
        .eq("delivery_group_id", id)
        .in("status", ["pending", "draft"]);
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
            o.status === "pending" || o.status === "draft"
              ? { ...o, status: orderStatus }
              : o,
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

  // 접수된 주문 먼저
  const sorted = [...groups].sort((a, b) => {
    const rank = (s: GroupStatus) =>
      s === "submitted" ? 0 : s === "open" ? 1 : 2;
    return rank(a.status) - rank(b.status);
  });

  return (
    <ul className="space-y-3">
      {sorted.map((g) => {
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
        const isCollecting = g.status === "open" || g.status === "closed";
        const isActionable = g.status === "submitted";

        return (
          <li
            key={g.id}
            className={`card p-4 space-y-3 ${
              isCollecting ? "opacity-80" : ""
            }`}
          >
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
                <p className="mt-1 text-sm text-ink-muted">
                  📍 {g.delivery_address}
                </p>
                {isCollecting && (
                  <p className="mt-1 text-xs font-semibold text-ink-muted">
                    아직 어드민 미전송 · 처리하지 마세요
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`badge ${badgeClass[g.status]}`}>
                  {STATUS_KO[g.status] ?? g.status}
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
                  <p className="text-sm text-ink-muted">아직 등록 없음</p>
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
                                {o.status === "draft" ? " · 모집중" : ""}
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
                        </li>
                      );
                    })}
                  </ul>
                )}

                {isActionable && (
                  <div className="flex flex-wrap gap-2">
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
                  </div>
                )}
                {isCollecting && (
                  <p className="text-xs text-center text-ink-muted">
                    주최자가 「합배송 주문 보내기」를 해야 처리할 수 있습니다.
                  </p>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
