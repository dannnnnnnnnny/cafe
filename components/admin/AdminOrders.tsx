"use client";

import { useMemo, useState } from "react";
import { orderDateKey, todayKey, toDateKey } from "@/lib/admin-date";
import type { DeliveryGroup, Order } from "@/lib/types";
import { GroupList } from "./GroupList";
import { MiniCalendar } from "./MiniCalendar";
import { OrderList } from "./OrderList";

export function AdminOrders({
  soloOrders,
  groups,
}: {
  soloOrders: Order[];
  groups: DeliveryGroup[];
}) {
  const [tab, setTab] = useState<"group" | "solo">("group");
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const dateCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of soloOrders) {
      const k = orderDateKey(o);
      if (k) map[k] = (map[k] ?? 0) + 1;
    }
    for (const g of groups) {
      const k = toDateKey(g.preferred_at);
      if (k) map[k] = (map[k] ?? 0) + 1;
    }
    return map;
  }, [soloOrders, groups]);

  const filteredSolo = useMemo(
    () => soloOrders.filter((o) => orderDateKey(o) === selectedDate),
    [soloOrders, selectedDate],
  );

  const filteredGroups = useMemo(
    () => groups.filter((g) => toDateKey(g.preferred_at) === selectedDate),
    [groups, selectedDate],
  );

  const pendingGroups = filteredGroups.filter(
    (g) => g.status === "submitted",
  ).length;
  const pendingSolo = filteredSolo.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">주문</h2>
          <p className="text-sm text-ink-muted">
            선택일 · 합배송 접수 {pendingGroups} · 개인 대기 {pendingSolo}
          </p>
        </div>
      </div>

      <MiniCalendar
        selected={selectedDate}
        onSelect={setSelectedDate}
        counts={dateCounts}
      />

      <div className="flex gap-1 rounded-full bg-foam p-1 shadow-sm">
        <button
          type="button"
          className={`flex-1 rounded-full py-2 text-sm font-semibold ${
            tab === "group" ? "bg-coffee text-white" : "text-ink-muted"
          }`}
          onClick={() => setTab("group")}
        >
          합배송 ({filteredGroups.length})
        </button>
        <button
          type="button"
          className={`flex-1 rounded-full py-2 text-sm font-semibold ${
            tab === "solo" ? "bg-coffee text-white" : "text-ink-muted"
          }`}
          onClick={() => setTab("solo")}
        >
          개인 ({filteredSolo.length})
        </button>
      </div>

      {tab === "group" ? (
        <GroupList groups={filteredGroups} />
      ) : (
        <OrderList orders={filteredSolo} />
      )}
    </div>
  );
}
