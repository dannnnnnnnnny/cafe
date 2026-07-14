import { redirect } from "next/navigation";
import { MenuManager } from "@/components/admin/MenuForm";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createSessionSupabase } from "@/lib/supabase-server";
import type { Menu } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminMenusPage() {
  if (!isSupabaseConfigured()) redirect("/admin/login");

  const supabase = await createSessionSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="card p-6 text-sm text-danger">
        메뉴를 불러오지 못했습니다: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">메뉴 관리</h2>
        <p className="text-sm text-ink-muted">등록 · 수정 · 품절 처리</p>
      </div>
      <MenuManager menus={(data ?? []) as Menu[]} />
    </div>
  );
}
