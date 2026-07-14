import { redirect } from "next/navigation";
import { OrderList } from "@/components/admin/OrderList";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createSessionSupabase } from "@/lib/supabase-server";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  if (!isSupabaseConfigured()) redirect("/admin/login");

  const supabase = await createSessionSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="card p-6 text-sm text-danger">
        주문을 불러오지 못했습니다: {error.message}
      </div>
    );
  }

  const orders = (data ?? []) as Order[];
  const pending = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold">주문</h2>
          <p className="text-sm text-ink-muted">
            대기 {pending}건 · 최근 50건
          </p>
        </div>
      </div>
      <OrderList orders={orders} />
    </div>
  );
}
