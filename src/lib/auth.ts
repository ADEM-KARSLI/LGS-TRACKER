import { createClient } from "@/lib/supabase/server";
import type { User, UserRole } from "@/types/database";
import { redirect } from "next/navigation";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as User | null;
}

export async function requireRole(role: UserRole): Promise<User> {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");
  if (profile.role !== role) {
    redirect(profile.role === "parent" ? "/parent" : "/dashboard");
  }
  return profile;
}
