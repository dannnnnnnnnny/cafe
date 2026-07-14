"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { formatPrice, formatWhen, useCart } from "@/lib/cart";
import type { DeliveryGroup, FulfillmentType } from "@/lib/types";

export function CheckoutForm() {
  const router = useRouter();
  const { items, totalPrice, setQty, remove, clear, groupCode, setGroupCode } =
    useCart();
  const [fulfillment, setFulfillment] = useState<FulfillmentType>("pickup");
  const [wantPoint, setWantPoint] = useState(false);
  const [wantReceipt, setWantReceipt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState<DeliveryGroup | null>(null);
  const [groupLoading, setGroupLoading] = useState(Boolean(groupCode));

  useEffect(() => {
    if (!groupCode) {
      setGroup(null);
      setGroupLoading(false);
      return;
    }
    let cancelled = false;
    setGroupLoading(true);
    fetch(`/api/groups/${groupCode}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "모임을 불러오지 못했습니다");
        if (!cancelled) {
          setGroup(data.group as DeliveryGroup);
          setFulfillment("delivery");
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setGroup(null);
        }
      })
      .finally(() => {
        if (!cancelled) setGroupLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupCode]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      customerName: String(fd.get("customerName") || ""),
      customerPhone: String(fd.get("customerPhone") || ""),
      fulfillmentType: group ? "delivery" : fulfillment,
      preferredAt: group
        ? group.preferred_at
        : String(fd.get("preferredAt") || ""),
      deliveryAddress: group
        ? group.delivery_address
        : String(fd.get("deliveryAddress") || ""),
      wantPointEarn: wantPoint,
      wantCashReceipt: wantReceipt,
      cashReceiptPhone: String(fd.get("cashReceiptPhone") || ""),
      groupCode: groupCode || undefined,
      items: items.map((i) => ({ menuId: i.menuId, quantity: i.quantity })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        orderNumber?: string;
        groupCode?: string | null;
        isDraft?: boolean;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "주문에 실패했습니다");
      clear();
      const q = new URLSearchParams({ n: data.orderNumber! });
      if (data.groupCode) q.set("g", data.groupCode);
      if (data.isDraft) q.set("draft", "1");
      router.push(`/done?${q.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="card px-6 py-16 text-center">
        <p className="text-3xl mb-3">🛒</p>
        <p className="font-semibold">장바구니가 비어 있어요</p>
        <Link href="/" className="btn btn-primary mt-6 inline-flex">
          메뉴 보러 가기
        </Link>
      </div>
    );
  }

  const defaultPreferred = (() => {
    const d = new Date(Date.now() + 30 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  })();

  const isGroup = Boolean(groupCode);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {isGroup && (
        <section className="card border border-latte/40 p-4">
          {groupLoading ? (
            <p className="text-sm text-ink-muted">합배송 정보 불러오는 중…</p>
          ) : group ? (
            <div className="space-y-1 text-sm">
              <p className="text-xs font-bold tracking-wide text-coffee">
                합배송 참여
              </p>
              <p className="text-lg font-bold">{group.company_name}</p>
              <p className="text-ink-muted">📍 {group.delivery_address}</p>
              <p className="text-ink-muted">
                희망 {formatWhen(group.preferred_at)} · 코드 {group.code}
              </p>
              {group.status !== "open" && (
                <p className="mt-2 text-danger font-semibold">
                  이 모임은 마감되어 주문이 거절될 수 있어요.
                </p>
              )}
              <button
                type="button"
                className="mt-2 text-xs text-ink-muted underline"
                onClick={() => setGroupCode(null)}
              >
                개인 주문으로 전환
              </button>
            </div>
          ) : (
            <p className="text-sm text-danger">합배송 모임을 불러오지 못했습니다.</p>
          )}
        </section>
      )}

      <section className="card p-4 space-y-3">
        <h2 className="text-sm font-bold text-ink-muted uppercase tracking-wide">
          주문 내역
        </h2>
        <ul className="divide-y divide-cream-dark">
          {items.map((item) => (
            <li key={item.menuId} className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{item.name}</p>
                <p className="text-sm text-ink-muted">{formatPrice(item.price)}</p>
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

      <section className="card p-4 space-y-4">
        <h2 className="text-sm font-bold text-ink-muted uppercase tracking-wide">
          신청 정보
        </h2>
        <div>
          <label htmlFor="customerName">이름</label>
          <input
            id="customerName"
            name="customerName"
            required
            maxLength={40}
            placeholder="홍길동"
          />
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

        {!isGroup && (
          <>
            <div>
              <span className="mb-2 block text-sm font-semibold text-ink-muted">
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

            <Link
              href="/group/new"
              className="block rounded-xl border border-dashed border-latte px-3 py-3 text-center text-sm font-semibold text-coffee"
            >
              회사 동료와 합배송 할까요? → 모임 만들기
            </Link>
          </>
        )}

        <div className="space-y-3 rounded-xl bg-cream px-3 py-3">
          <label className="flex cursor-pointer items-center gap-3 !mb-0">
            <input
              type="checkbox"
              className="h-4 w-4 accent-coffee"
              checked={wantPoint}
              onChange={(e) => setWantPoint(e.target.checked)}
            />
            <span className="text-sm font-semibold text-ink">포인트 적립</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 !mb-0">
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

      <button
        type="submit"
        className="btn btn-primary w-full py-4"
        disabled={loading || (isGroup && groupLoading)}
      >
        {loading
          ? "처리 중…"
          : isGroup
            ? `${formatPrice(totalPrice)} 내 메뉴 등록`
            : `${formatPrice(totalPrice)} 구매 신청`}
      </button>
      <p className="pb-4 text-center text-xs text-ink-muted">
        {isGroup
          ? "지금은 합배송 목록에만 등록됩니다. 주최자가 「합배송 주문 보내기」를 눌러야 매장에 전달돼요."
          : "결제 없이 신청만 접수됩니다. 매장에서 확인해 드릴게요."}
      </p>
    </form>
  );
}
