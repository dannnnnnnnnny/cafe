import { redirect } from "next/navigation";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createSessionSupabase } from "@/lib/supabase-server";
import type { DeliveryGroup, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  if (!isSupabaseConfigured()) redirect("/admin/login");

  const supabase = await createSessionSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [ordersRes, groupsRes] = await Promise.all([
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from("delivery_groups")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  if (ordersRes.error) {
    return (
      <div className="card p-6 text-sm text-danger">
        주문을 불러오지 못했습니다: {ordersRes.error.message}
      </div>
    );
  }
  if (groupsRes.error) {
    return (
      <div className="card p-6 text-sm text-danger">
        합배송을 불러오지 못했습니다: {groupsRes.error.message}
      </div>
    );
  }

  const allOrders = (ordersRes.data ?? []) as Order[];
  const soloOrders = allOrders.filter((o) => !o.delivery_group_id);
  const groups = (groupsRes.data ?? []).map((g) => ({
    ...(g as DeliveryGroup),
    orders: allOrders.filter((o) => o.delivery_group_id === g.id),
  }));

  return <AdminOrders soloOrders={soloOrders} groups={groups} />;
}
