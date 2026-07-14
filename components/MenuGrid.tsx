"use client";

import { useMemo, useState } from "react";
import type { Menu } from "@/lib/types";
import { MenuCard } from "./MenuCard";

export function MenuGrid({ menus }: { menus: Menu[] }) {
  const categories = useMemo(() => {
    const set = new Set(menus.map((m) => m.category));
    return ["전체", ...Array.from(set)];
  }, [menus]);

  const [active, setActive] = useState("전체");

  const filtered =
    active === "전체" ? menus : menus.filter((m) => m.category === active);

  return (
    <div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${active === c ? "chip-active" : "chip-idle"}`}
            onClick={() => setActive(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <p className="text-3xl mb-3">🍵</p>
          <p className="font-semibold text-ink">메뉴가 아직 없어요</p>
          <p className="mt-1 text-sm text-ink-muted">잠시 후 다시 확인해 주세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((m) => (
            <MenuCard key={m.id} menu={m} />
          ))}
        </div>
      )}
    </div>
  );
}
