"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatPrice, useCart } from "@/lib/cart";

export function FloatingCart() {
  const pathname = usePathname();
  const { items, totalCount, totalPrice, groupCode, setQty, remove } = useCart();
  const [open, setOpen] = useState(true);
  const [pulse, setPulse] = useState(false);
  const prevCount = useRef(0);

  const hidden =
    !pathname ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/done") ||
    pathname.startsWith("/group/new");

  // 담을 때마다 패널 열고 살짝 강조
  useEffect(() => {
    if (totalCount > prevCount.current && totalCount > 0) {
      setOpen(true);
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 500);
      prevCount.current = totalCount;
      return () => clearTimeout(t);
    }
    prevCount.current = totalCount;
  }, [totalCount]);

  if (hidden || totalCount === 0) return null;

  const cta = groupCode ? "내 메뉴 등록" : "주문하기";

  return (
    <div
      className={`fixed z-50 flex flex-col items-end gap-2 transition-transform ${
        // 모바일: 우측 하단 / 여백
        "right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:right-5 sm:bottom-6"
      }`}
    >
      {/* 펼친 장바구니 */}
      {open && (
        <div
          className={`w-[min(17.5rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-cream-dark bg-foam shadow-xl shadow-ink/10 ${
            pulse ? "ring-2 ring-coffee/40" : ""
          }`}
        >
          <div className="flex items-center justify-between border-b border-cream-dark px-3 py-2.5">
            <p className="text-xs font-bold tracking-wide text-coffee">
              장바구니 · {totalCount}개
            </p>
            <button
              type="button"
              className="text-xs font-semibold text-ink-muted"
              onClick={() => setOpen(false)}
              aria-label="접기"
            >
              접기
            </button>
          </div>

          <ul className="max-h-52 overflow-y-auto overscroll-contain px-2 py-1">
            {items.map((item) => (
              <li
                key={item.menuId}
                className="flex items-start gap-2 border-b border-cream-dark/60 py-2 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold leading-snug text-ink">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-cream-dark text-xs font-bold"
                    onClick={() => setQty(item.menuId, item.quantity - 1)}
                    aria-label="수량 감소"
                  >
                    −
                  </button>
                  <span className="w-4 text-center text-xs font-bold tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-cream-dark text-xs font-bold"
                    onClick={() => setQty(item.menuId, item.quantity + 1)}
                    aria-label="수량 증가"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="shrink-0 pt-0.5 text-[10px] text-ink-muted underline"
                  onClick={() => remove(item.menuId)}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-cream-dark px-3 py-2.5">
            <div className="flex justify-between text-xs font-bold">
              <span>합계</span>
              <span className="text-coffee">{formatPrice(totalPrice)}</span>
            </div>
            <Link
              href="/checkout"
              className="btn btn-primary flex w-full py-2.5 text-sm"
            >
              {cta}
            </Link>
          </div>
        </div>
      )}

      {/* 접힌 상태: 작은 동그라미 */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`flex h-14 w-14 flex-col items-center justify-center rounded-full bg-coffee text-white shadow-lg shadow-coffee/30 ${
            pulse ? "scale-110" : ""
          } transition-transform`}
          aria-label={`장바구니 ${totalCount}개`}
        >
          <span className="text-lg leading-none">🛒</span>
          <span className="mt-0.5 text-[10px] font-bold tabular-nums">
            {totalCount}
          </span>
        </button>
      )}
    </div>
  );
}
