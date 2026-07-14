import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/order-schema";
import { createServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

function orderNumber() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "서버에 Supabase가 설정되지 않았습니다. .env.local을 확인해 주세요.",
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const data = parsed.data;
  const supabase = createServiceSupabase();

  let deliveryGroupId: string | null = null;
  let fulfillmentType = data.fulfillmentType;
  let preferredAt = data.preferredAt;
  let deliveryAddress = data.deliveryAddress;

  if (data.groupCode?.trim()) {
    const code = data.groupCode.trim().toUpperCase();
    const { data: group, error: gErr } = await supabase
      .from("delivery_groups")
      .select("id, status, delivery_address, preferred_at")
      .eq("code", code)
      .maybeSingle();

    if (gErr) {
      return NextResponse.json({ error: gErr.message }, { status: 500 });
    }
    if (!group) {
      return NextResponse.json({ error: "합배송 모임을 찾을 수 없습니다" }, { status: 404 });
    }
    if (group.status !== "open") {
      return NextResponse.json(
        { error: "마감된 합배송 모임입니다. 더 이상 참여할 수 없어요." },
        { status: 400 },
      );
    }

    deliveryGroupId = group.id as string;
    fulfillmentType = "delivery";
    preferredAt = group.preferred_at as string;
    deliveryAddress = group.delivery_address as string;
  }

  const preferred = new Date(preferredAt);
  if (Number.isNaN(preferred.getTime())) {
    return NextResponse.json({ error: "희망 시간이 올바르지 않습니다" }, { status: 400 });
  }

  const menuIds = data.items.map((i) => i.menuId);
  const { data: menus, error: menuErr } = await supabase
    .from("menus")
    .select("id, name, price, is_available")
    .in("id", menuIds);

  if (menuErr) {
    return NextResponse.json({ error: menuErr.message }, { status: 500 });
  }

  const menuMap = new Map((menus ?? []).map((m) => [m.id as string, m]));
  for (const item of data.items) {
    const m = menuMap.get(item.menuId);
    if (!m) {
      return NextResponse.json({ error: "메뉴를 찾을 수 없습니다" }, { status: 400 });
    }
    if (!m.is_available) {
      return NextResponse.json(
        { error: `「${m.name}」은(는) 품절입니다` },
        { status: 400 },
      );
    }
  }

  let number = orderNumber();
  for (let i = 0; i < 5; i++) {
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number: number,
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        fulfillment_type: fulfillmentType,
        preferred_at: preferred.toISOString(),
        delivery_address:
          fulfillmentType === "delivery" ? deliveryAddress || null : null,
        want_point_earn: data.wantPointEarn,
        want_cash_receipt: data.wantCashReceipt,
        cash_receipt_phone: data.wantCashReceipt
          ? data.cashReceiptPhone
          : null,
        // 합배송 모집 중: draft (어드민 미접수). 개인 주문: pending
        status: deliveryGroupId ? "draft" : "pending",
        delivery_group_id: deliveryGroupId,
      })
      .select("id, order_number")
      .single();

    if (orderErr) {
      if (orderErr.code === "23505") {
        number = orderNumber();
        continue;
      }
      return NextResponse.json({ error: orderErr.message }, { status: 500 });
    }

    const rows = data.items.map((item) => {
      const m = menuMap.get(item.menuId)!;
      return {
        order_id: order.id,
        menu_id: m.id,
        menu_name_snapshot: m.name as string,
        unit_price: m.price as number,
        quantity: item.quantity,
      };
    });

    const { error: itemsErr } = await supabase.from("order_items").insert(rows);
    if (itemsErr) {
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    }

    // 개인 주문만 즉시 알림. 합배송은 호스트 전송 시 알림
    if (!deliveryGroupId) {
      // TODO: notify admin
      console.info("[order] new solo order", order.order_number, data.customerName);
    } else {
      console.info(
        "[order] group draft registered",
        order.order_number,
        data.customerName,
        data.groupCode,
      );
    }

    return NextResponse.json({
      orderNumber: order.order_number,
      groupCode: data.groupCode?.trim().toUpperCase() || null,
      isDraft: Boolean(deliveryGroupId),
    });
  }

  return NextResponse.json({ error: "주문 번호 생성에 실패했습니다" }, { status: 500 });
}
