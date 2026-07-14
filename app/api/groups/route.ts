import { NextResponse } from "next/server";
import { groupCreateSchema } from "@/lib/order-schema";
import { createServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

function groupCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "서버에 Supabase가 설정되지 않았습니다." },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  const parsed = groupCreateSchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const data = parsed.data;
  const preferred = new Date(data.preferredAt);
  if (Number.isNaN(preferred.getTime())) {
    return NextResponse.json({ error: "희망 시간이 올바르지 않습니다" }, { status: 400 });
  }

  const supabase = createServiceSupabase();
  let code = groupCode();

  for (let i = 0; i < 5; i++) {
    const { data: group, error } = await supabase
      .from("delivery_groups")
      .insert({
        code,
        company_name: data.companyName,
        delivery_address: data.deliveryAddress,
        preferred_at: preferred.toISOString(),
        host_name: data.hostName,
        host_phone: data.hostPhone || null,
        status: "open",
      })
      .select("code")
      .single();

    if (error) {
      if (error.code === "23505") {
        code = groupCode();
        continue;
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ code: group.code });
  }

  return NextResponse.json({ error: "코드 생성에 실패했습니다" }, { status: 500 });
}
