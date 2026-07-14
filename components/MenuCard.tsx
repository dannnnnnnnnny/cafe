"use client";

import { useState } from "react";
import type { Menu } from "@/lib/types";
import { formatPrice, useCart } from "@/lib/cart";

export function MenuCard({ menu }: { menu: Menu }) {
  const { add } = useCart();
  const [pop, setPop] = useState(false);

  function handleAdd() {
    if (!menu.is_available) return;
    add(menu);
    setPop(true);
    setTimeout(() => setPop(false), 500);
  }

  return (
    <article
      className={`flex items-center gap-3 rounded-2xl bg-foam px-3 py-3 shadow-sm shadow-ink/[0.04] ${
        !menu.is_available ? "opacity-60" : ""
      }`}
    >
      {/* 썸네일 */}
      <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-[#ebe4f5]">
        {menu.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={menu.image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl opacity-35">
            ☕
          </div>
        )}
        {!menu.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
            <span className="text-[10px] font-bold text-white">품절</span>
          </div>
        )}
      </div>

      {/* 텍스트 */}
      <div className="min-w-0 flex-1 py-0.5">
        <h3 className="truncate text-[15px] font-bold leading-snug text-ink">
          {menu.name}
        </h3>
        {menu.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">
            {menu.description}
          </p>
        ) : null}
        <p className="mt-1.5 text-[15px] font-bold tracking-tight text-[#3d5a3d]">
          ₩{menu.price.toLocaleString("ko-KR")}
        </p>
      </div>

      {/* + 버튼 */}
      <button
        type="button"
        disabled={!menu.is_available}
        onClick={handleAdd}
        aria-label={`${menu.name} 담기`}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-light text-white transition active:scale-95 disabled:opacity-40 ${
          pop ? "scale-90 bg-[#2f4a2f]" : "bg-[#4a6741]"
        }`}
      >
        {pop ? "✓" : "+"}
      </button>
    </article>
  );
}
