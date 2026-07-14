"use client";

import { useMemo, useState } from "react";
import { formatDateKey, todayKey } from "@/lib/admin-date";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

type Props = {
  selected: string; // YYYY-MM-DD
  onSelect: (key: string) => void;
  /** 날짜별 건수 — 점 표시용 */
  counts: Record<string, number>;
};

export function MiniCalendar({ selected, onSelect, counts }: Props) {
  const today = todayKey();
  const [cursor, setCursor] = useState(() => {
    const [y, m] = selected.split("-").map(Number);
    return { year: y, month: m }; // 1-12
  });

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month - 1, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(cursor.year, cursor.month, 0).getDate();
    const list: ({ key: string; day: number } | null)[] = [];
    for (let i = 0; i < startPad; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${cursor.year}-${String(cursor.month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      list.push({ key, day: d });
    }
    return list;
  }, [cursor]);

  function prevMonth() {
    setCursor((c) =>
      c.month === 1
        ? { year: c.year - 1, month: 12 }
        : { year: c.year, month: c.month - 1 },
    );
  }

  function nextMonth() {
    setCursor((c) =>
      c.month === 12
        ? { year: c.year + 1, month: 1 }
        : { year: c.year, month: c.month + 1 },
    );
  }

  return (
    <div className="card p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-ink-muted hover:bg-cream"
          onClick={prevMonth}
          aria-label="이전 달"
        >
          ‹
        </button>
        <p className="text-sm font-bold text-ink">
          {cursor.year}.{String(cursor.month).padStart(2, "0")}
        </p>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-ink-muted hover:bg-cream"
          onClick={nextMonth}
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold text-ink-muted">
        {WEEK.map((w) => (
          <div key={w} className="py-0.5">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, i) => {
          if (!cell) {
            return <div key={`e-${i}`} className="aspect-square" />;
          }
          const count = counts[cell.key] ?? 0;
          const isSelected = cell.key === selected;
          const isToday = cell.key === today;
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelect(cell.key)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs font-semibold transition ${
                isSelected
                  ? "bg-coffee text-white"
                  : isToday
                    ? "bg-cream-dark text-ink"
                    : "text-ink hover:bg-cream"
              }`}
            >
              {cell.day}
              {count > 0 && (
                <span
                  className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                    isSelected ? "bg-white" : "bg-coffee"
                  }`}
                  title={`${count}건`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-cream-dark pt-2">
        <p className="text-xs font-semibold text-ink">
          {formatDateKey(selected)}
        </p>
        <button
          type="button"
          className="text-xs font-semibold text-coffee underline"
          onClick={() => {
            const t = todayKey();
            const [y, m] = t.split("-").map(Number);
            setCursor({ year: y, month: m });
            onSelect(t);
          }}
        >
          오늘
        </button>
      </div>
    </div>
  );
}
