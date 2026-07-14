import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createSessionSupabase } from "@/lib/supabase-server";
import { signOut } from "./actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-semibold">Supabase 환경 변수가 필요합니다</p>
        <p className="mt-2 text-sm text-ink-muted">
          `.env.local`에 URL / ANON KEY를 설정해 주세요.
        </p>
        <Link href="/" className="btn btn-ghost mt-6 inline-flex">
          홈으로
        </Link>
      </div>
    );
  }

  const supabase = await createSessionSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 페이지 등: 세션 없으면 크롬 없이 children만
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto min-h-full max-w-lg px-4 pb-10">
      <header className="flex items-center justify-between pt-6 pb-4">
        <div>
          <p className="text-xs font-bold tracking-wide text-coffee">ADMIN</p>
          <h1 className="text-lg font-bold">카페 관리</h1>
        </div>
        <nav className="flex items-center gap-1 rounded-full bg-foam p-1 shadow-sm">
          <Link
            href="/admin"
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink hover:bg-cream"
          >
            주문
          </Link>
          <Link
            href="/admin/menus"
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink hover:bg-cream"
          >
            메뉴
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink-muted hover:bg-cream"
            >
              로그아웃
            </button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  );
}
