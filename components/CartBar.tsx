"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatPrice, useCart } from "@/lib/cart";

export function CartBar() {
  const pathname = usePathname();
  const { totalCount, totalPrice, groupCode } = useCart();

  // admin / 체크아웃 / 완료 화면에서는 숨김
  if (
    !pathname ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/done") ||
    pathname.startsWith("/group/new")
  ) {
    return null;
  }

  if (totalCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
      <div className="mx-auto max-w-lg">
        <Link
          href="/checkout"
          className="btn btn-primary flex w-full items-center justify-between px-5 py-4 shadow-lg shadow-coffee/25"
        >
          <span className="flex items-center gap-2">
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white/20 px-2 text-sm">
              {totalCount}
            </span>
            <span>
              {groupCode ? "합배송 주문하기" : "주문하기"}
            </span>
          </span>
          <span className="tabular-nums">{formatPrice(totalPrice)}</span>
        </Link>
      </div>
    </div>
  );
}
