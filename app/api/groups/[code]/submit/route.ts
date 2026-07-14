import { NextResponse } from "next/server";
import { createServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

/** 호스트: 모집 마감 + 어드민에 합배송 주문 전송 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase 미설정" }, { status: 503 });
  }

  const { code: raw } = await params;
  const code = raw.toUpperCase();
  const supabase = createServiceSupabase();

  const { data: group, error: gErr } = await supabase
    .from("delivery_groups")
    .select("id, status, code, company_name")
    .eq("code", code)
    .maybeSingle();

  if (gErr) {
    return NextResponse.json({ error: gErr.message }, { status: 500 });
  }
  if (!group) {
    return NextResponse.json({ error: "모임을 찾을 수 없습니다" }, { status: 404 });
  }
  if (group.status !== "open") {
    return NextResponse.json(
      { error: "이미 전송되었거나 모집이 끝난 모임입니다." },
      { status: 400 },
    );
  }

  const { count, error: cErr } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("delivery_group_id", group.id)
    .eq("status", "draft");

  if (cErr) {
    return NextResponse.json({ error: cErr.message }, { status: 500 });
  }
  if (!count || count < 1) {
    return NextResponse.json(
      { error: "등록된 메뉴가 없습니다. 먼저 참가자가 메뉴를 등록해 주세요." },
      { status: 400 },
    );
  }

  const { error: orderErr } = await supabase
    .from("orders")
    .update({ status: "pending" })
    .eq("delivery_group_id", group.id)
    .eq("status", "draft");

  if (orderErr) {
    return NextResponse.json({ error: orderErr.message }, { status: 500 });
  }

  const { error: groupErr } = await supabase
    .from("delivery_groups")
    .update({ status: "submitted" })
    .eq("id", group.id);

  if (groupErr) {
    return NextResponse.json({ error: groupErr.message }, { status: 500 });
  }

  // TODO: notify admin (Telegram / Discord / Email)
  console.info(
    "[group] submitted to admin",
    group.code,
    group.company_name,
    `participants=${count}`,
  );

  return NextResponse.json({
    ok: true,
    code: group.code,
    participantCount: count,
  });
}
