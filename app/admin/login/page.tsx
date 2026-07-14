import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createSessionSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (!isSupabaseConfigured()) {
    return <LoginForm />;
  }

  const supabase = await createSessionSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/admin");

  return <LoginForm />;
}
