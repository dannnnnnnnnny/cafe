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
              ? "아래 「내 메뉴 등록」으로 목록에 올리면 돼요. (아직 매장 미전달)"
              : "메뉴를 담은 뒤 「내 메뉴 등록」하세요. 매장 전송은 주최자가 합니다."}
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
          <span>내 메뉴 등록 ({totalCount}개)</span>
          <span className="tabular-nums">{formatPrice(totalPrice)}</span>
        </Link>
      )}
    </div>
  );
}
