"use client";

import Link from "next/link";
import { formatPrice, useCart } from "@/lib/cart";

export function CartBar() {
  const { totalCount, totalPrice } = useCart();
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
            <span>장바구니 보기</span>
          </span>
          <span className="tabular-nums">{formatPrice(totalPrice)}</span>
        </Link>
      </div>
    </div>
  );
}
