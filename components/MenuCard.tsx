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
    setTimeout(() => setPop(false), 600);
  }

  return (
    <article className="card overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] bg-cream-dark">
        {menu.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={menu.image_url}
            alt={menu.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl opacity-40">
            ☕
          </div>
        )}
        {!menu.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/45">
            <span className="rounded-full bg-foam/95 px-3 py-1 text-sm font-bold text-ink">
              품절
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-snug text-ink">{menu.name}</h3>
          <p className="shrink-0 text-sm font-bold text-coffee">
            {formatPrice(menu.price)}
          </p>
        </div>
        {menu.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">
            {menu.description}
          </p>
        )}
        <button
          type="button"
          className={`btn mt-auto w-full text-sm ${
            menu.is_available ? "btn-primary" : "btn-ghost"
          } ${pop ? "scale-95" : ""}`}
          disabled={!menu.is_available}
          onClick={handleAdd}
        >
          {menu.is_available ? (pop ? "담았어요 ✓" : "담기") : "품절"}
        </button>
      </div>
    </article>
  );
}
