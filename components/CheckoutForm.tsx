"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatPrice, useCart } from "@/lib/cart";
import type { FulfillmentType } from "@/lib/types";

export function CheckoutForm() {
  const router = useRouter();
  const { items, totalPrice, setQty, remove, clear } = useCart();
  const [fulfillment, setFulfillment] = useState<FulfillmentType>("pickup");
  const [wantPoint, setWantPoint] = useState(false);
  const [wantReceipt, setWantReceipt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      customerName: String(fd.get("customerName") || ""),
      customerPhone: String(fd.get("customerPhone") || ""),
      fulfillmentType: fulfillment,
      preferredAt: String(fd.get("preferredAt") || ""),
      deliveryAddress: String(fd.get("deliveryAddress") || ""),
      wantPointEarn: wantPoint,
      wantCashReceipt: wantReceipt,
      cashReceiptPhone: String(fd.get("cashReceiptPhone") || ""),
      items: items.map((i) => ({ menuId: i.menuId, quantity: i.quantity })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { orderNumber?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "주문에 실패했습니다");
      clear();
      router.push(`/done?n=${encodeURIComponent(data.orderNumber!)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "주문에 실패했습니다");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="card px-6 py-16 text-center">
        <p className="text-3xl mb-3">🛒</p>
        <p className="font-semibold">장바구니가 비어 있어요</p>
        <a href="/" className="btn btn-primary mt-6 inline-flex">
          메뉴 보러 가기
        </a>
      </div>
    );
  }

  // default preferred: ~30 min from now, local datetime-local format
  const defaultPreferred = (() => {
    const d = new Date(Date.now() + 30 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  })();

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* cart summary */}
      <section className="card p-4 space-y-3">
        <h2 className="text-sm font-bold text-ink-muted uppercase tracking-wide">
          주문 내역
        </h2>
        <ul className="divide-y divide-cream-dark">
          {items.map((item) => (
            <li key={item.menuId} className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{item.name}</p>
                <p className="text-sm text-ink-muted">
                  {formatPrice(item.price)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-8 w-8 rounded-full bg-cream-dark font-bold text-ink"
                  onClick={() => setQty(item.menuId, item.quantity - 1)}
                  aria-label="수량 감소"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold tabular-nums">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  className="h-8 w-8 rounded-full bg-cream-dark font-bold text-ink"
                  onClick={() => setQty(item.menuId, item.quantity + 1)}
                  aria-label="수량 증가"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="text-xs text-ink-muted underline ml-1"
                onClick={() => remove(item.menuId)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
        <div className="flex justify-between pt-1 text-base font-bold">
          <span>합계</span>
          <span className="text-coffee">{formatPrice(totalPrice)}</span>
        </div>
      </section>

      {/* customer */}
      <section className="card p-4 space-y-4">
        <h2 className="text-sm font-bold text-ink-muted uppercase tracking-wide">
          신청 정보
        </h2>
        <div>
          <label htmlFor="customerName">이름</label>
          <input id="customerName" name="customerName" required maxLength={40} placeholder="홍길동" />
        </div>
        <div>
          <label htmlFor="customerPhone">연락처</label>
          <input
            id="customerPhone"
            name="customerPhone"
            type="tel"
            required
            placeholder="010-1234-5678"
          />
        </div>

        <div>
          <span className="block text-sm font-semibold text-ink-muted mb-2">
            수령 방식
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["pickup", "직접 방문"],
                ["delivery", "배달"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  fulfillment === value
                    ? "border-coffee bg-coffee text-white"
                    : "border-cream-dark bg-foam text-ink-muted"
                }`}
                onClick={() => setFulfillment(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {fulfillment === "delivery" && (
          <div>
            <label htmlFor="deliveryAddress">배달 주소</label>
            <input
              id="deliveryAddress"
              name="deliveryAddress"
              required
              placeholder="시/구/동 상세주소"
            />
          </div>
        )}

        <div>
          <label htmlFor="preferredAt">희망 시간</label>
          <input
            id="preferredAt"
            name="preferredAt"
            type="datetime-local"
            required
            defaultValue={defaultPreferred}
          />
        </div>

        <div className="space-y-3 rounded-xl bg-cream px-3 py-3">
          <label className="flex items-center gap-3 cursor-pointer !mb-0">
            <input
              type="checkbox"
              className="h-4 w-4 accent-coffee"
              checked={wantPoint}
              onChange={(e) => setWantPoint(e.target.checked)}
            />
            <span className="text-sm font-semibold text-ink">포인트 적립</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer !mb-0">
            <input
              type="checkbox"
              className="h-4 w-4 accent-coffee"
              checked={wantReceipt}
              onChange={(e) => setWantReceipt(e.target.checked)}
            />
            <span className="text-sm font-semibold text-ink">현금영수증</span>
          </label>
          {wantReceipt && (
            <div className="pt-1">
              <label htmlFor="cashReceiptPhone">현금영수증 번호</label>
              <input
                id="cashReceiptPhone"
                name="cashReceiptPhone"
                type="tel"
                placeholder="휴대폰 또는 사업자번호"
              />
            </div>
          )}
        </div>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full py-4" disabled={loading}>
        {loading ? "신청 중…" : `${formatPrice(totalPrice)} 구매 신청`}
      </button>
      <p className="text-center text-xs text-ink-muted pb-4">
        결제 없이 신청만 접수됩니다. 매장에서 확인해 드릴게요.
      </p>
    </form>
  );
}
