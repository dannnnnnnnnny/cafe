import { NextResponse } from "next/server";
import { createServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase 미설정" }, { status: 503 });
  }

  const { code: raw } = await params;
  const code = raw.toUpperCase();
  const supabase = createServiceSupabase();

  const { data: group, error } = await supabase
    .from("delivery_groups")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!group) {
    return NextResponse.json({ error: "모임을 찾을 수 없습니다" }, { status: 404 });
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, status, created_at, order_items(menu_name_snapshot, quantity, unit_price)")
    .eq("delivery_group_id", group.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    group,
    participants: (orders ?? []).map((o) => ({
      orderNumber: o.order_number,
      customerName: o.customer_name,
      status: o.status,
      itemCount:
        (o.order_items as { quantity: number }[] | null)?.reduce(
          (s, i) => s + i.quantity,
          0,
        ) ?? 0,
      total:
        (o.order_items as { quantity: number; unit_price: number }[] | null)?.reduce(
          (s, i) => s + i.quantity * i.unit_price,
          0,
        ) ?? 0,
    })),
  });
}
