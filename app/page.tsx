import { CartBar } from "@/components/CartBar";
import { MenuGrid } from "@/components/MenuGrid";
import { DEMO_MENUS } from "@/lib/demo-menus";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Menu } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getMenus(): Promise<{ menus: Menu[]; demo: boolean }> {
  if (!isSupabaseConfigured()) {
    return { menus: DEMO_MENUS, demo: true };
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[menus]", error.message);
    return { menus: [], demo: false };
  }

  return { menus: (data ?? []) as Menu[], demo: false };
}

export default async function HomePage() {
  const { menus, demo } = await getMenus();

  return (
    <div className="mx-auto min-h-full max-w-lg px-4 pb-28">
      <header className="pt-8 pb-6">
        <p className="text-sm font-semibold tracking-wide text-coffee">
          MENU & ORDER
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
          오늘의 메뉴
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          원하는 메뉴를 담고, 방문 또는 배달로 신청해 주세요.
        </p>
        {demo && (
          <p className="mt-3 rounded-xl bg-cream-dark/80 px-3 py-2 text-xs text-ink-muted">
            데모 메뉴입니다. Supabase를 연결하면 실제 메뉴가 표시됩니다.
          </p>
        )}
      </header>

      <MenuGrid menus={menus} />
      <CartBar />
    </div>
  );
}
