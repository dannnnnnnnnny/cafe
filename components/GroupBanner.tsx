"use client";

import Link from "next/link";
import { formatPrice, useCart } from "@/lib/cart";

export function GroupBanner() {
  const { groupCode, setGroupCode, totalCount, totalPrice } = useCart();
  if (!groupCode) return null;

  return (
    <div className="mb-4 rounded-2xl border border-latte/50 bg-foam px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wide text-coffee">합배송 참여 중</p>
          <p className="mt-0.5 text-sm font-semibold text-ink">
            코드 <span className="tracking-widest">{groupCode}</span>
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {totalCount > 0
              ? "아래 버튼 또는 하단 바로 주문을 완료하세요."
              : "메뉴를 담은 뒤, 하단 「합배송 주문하기」를 누르세요."}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Link
            href={`/group/${groupCode}`}
            className="text-xs font-semibold text-coffee underline"
          >
            모임 보기
          </Link>
          <button
            type="button"
            className="text-xs text-ink-muted underline"
            onClick={() => setGroupCode(null)}
          >
            나가기
          </button>
        </div>
      </div>
      {totalCount > 0 && (
        <Link
          href="/checkout"
          className="btn btn-primary mt-3 flex w-full justify-between py-3 text-sm"
        >
          <span>주문하기 ({totalCount}개)</span>
          <span className="tabular-nums">{formatPrice(totalPrice)}</span>
        </Link>
      )}
    </div>
  );
}
