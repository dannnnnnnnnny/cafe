"use server";

import { redirect } from "next/navigation";
import { createSessionSupabase } from "@/lib/supabase-server";

export async function signOut() {
  const supabase = await createSessionSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
