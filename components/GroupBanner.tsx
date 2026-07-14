"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function GroupBanner() {
  const { groupCode, setGroupCode } = useCart();
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
            메뉴를 담고 체크아웃하면 이 배달에 합류해요.
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
    </div>
  );
}
