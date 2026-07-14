"use client";

import { useState } from "react";
import { GroupList } from "./GroupList";
import { OrderList } from "./OrderList";
import type { DeliveryGroup, Order } from "@/lib/types";

export function AdminOrders({
  soloOrders,
  groups,
}: {
  soloOrders: Order[];
  groups: DeliveryGroup[];
}) {
  const [tab, setTab] = useState<"group" | "solo">("group");
  const pendingGroups = groups.filter(
    (g) => g.status === "open" || g.status === "closed",
  ).length;
  const pendingSolo = soloOrders.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">주문</h2>
          <p className="text-sm text-ink-muted">
            합배송 진행 {pendingGroups} · 개인 대기 {pendingSolo}
          </p>
        </div>
      </div>

      <div className="flex gap-1 rounded-full bg-foam p-1 shadow-sm">
        <button
          type="button"
          className={`flex-1 rounded-full py-2 text-sm font-semibold ${
            tab === "group" ? "bg-coffee text-white" : "text-ink-muted"
          }`}
          onClick={() => setTab("group")}
        >
          합배송 ({groups.length})
        </button>
        <button
          type="button"
          className={`flex-1 rounded-full py-2 text-sm font-semibold ${
            tab === "solo" ? "bg-coffee text-white" : "text-ink-muted"
          }`}
          onClick={() => setTab("solo")}
        >
          개인 ({soloOrders.length})
        </button>
      </div>

      {tab === "group" ? (
        <GroupList groups={groups} />
      ) : (
        <OrderList orders={soloOrders} />
      )}
    </div>
  );
}
