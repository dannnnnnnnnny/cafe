"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/cart";
import type { Order, OrderStatus } from "@/lib/types";
import { ReceiptBadges } from "./ReceiptBadges";

const STATUS_LABEL: Record<OrderStatus, string> = {
  draft: "임시",
  pending: "대기",
  done: "완료",
  cancelled: "취소",
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function OrderList({ orders: initial }: { orders: Order[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setOrders(initial);
  }, [initial]);

  async function setStatus(id: string, status: OrderStatus) {
    setBusy(id);
    const supabase = createBrowserSupabase();
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    setBusy(null);
    if (error) {
      alert(error.message);
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    router.refresh();
  }

  if (orders.length === 0) {
    return (
      <div className="card px-6 py-14 text-center">
        <p className="mb-2 text-3xl">📭</p>
        <p className="font-semibold">이 날짜의 주문이 없습니다</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => {
        const total =
          order.order_items?.reduce(
            (s, i) => s + i.unit_price * i.quantity,
            0,
          ) ?? 0;

        return (
          <li key={order.id} className="card space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-lg font-bold tracking-wide">
                  #{order.order_number}
                </p>
                <p className="text-sm text-ink-muted">
                  접수 {formatWhen(order.created_at)}
                </p>
              </div>
              <span
                className={`badge ${
                  order.status === "done"
                    ? "badge-done"
                    : order.status === "cancelled"
                      ? "badge-cancelled"
                      : "badge-pending"
                }`}
              >
                {STATUS_LABEL[order.status]}
              </span>
            </div>

            <div className="space-y-1.5 text-sm">
              <p>
                <span className="font-semibold">{order.customer_name}</span>
                <span className="text-ink-muted"> · {order.customer_phone}</span>
              </p>
              <p className="text-ink-muted">
                {order.fulfillment_type === "pickup" ? "직접 방문" : "배달"}
                {" · 희망 "}
                {formatWhen(order.preferred_at)}
              </p>
              {order.fulfillment_type === "delivery" && order.delivery_address && (
                <p className="text-ink-muted">📍 {order.delivery_address}</p>
              )}
              <ReceiptBadges
                wantPoint={order.want_point_earn}
                wantReceipt={order.want_cash_receipt}
                receiptPhone={order.cash_receipt_phone}
              />
            </div>

            <ul className="space-y-1 rounded-xl bg-cream px-3 py-2 text-sm">
              {order.order_items?.map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <span>
                    {item.menu_name_snapshot} × {item.quantity}
                  </span>
                  <span className="tabular-nums text-ink-muted">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </li>
              ))}
              <li className="flex justify-between border-t border-cream-dark pt-1 font-bold">
                <span>합계</span>
                <span className="text-coffee">{formatPrice(total)}</span>
              </li>
            </ul>

            {order.status === "pending" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary flex-1 py-2.5 text-sm"
                  disabled={busy === order.id}
                  onClick={() => setStatus(order.id, "done")}
                >
                  완료 처리
                </button>
                <button
                  type="button"
                  className="btn btn-danger flex-1 py-2.5 text-sm"
                  disabled={busy === order.id}
                  onClick={() => setStatus(order.id, "cancelled")}
                >
                  취소
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
