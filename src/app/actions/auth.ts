"use server";

import { formatAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/database";

export async function signIn(
  formData: FormData
): Promise<{ error?: string } | void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: formatAuthError(error.message) };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    redirect(profile?.role === "parent" ? "/parent" : "/dashboard");
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "student") as UserRole;

  if (!name || !email || !password) {
    return { error: "Tüm alanları doldurun." };
  }

  if (role !== "student" && role !== "parent") {
    return { error: "Geçersiz rol." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: formatAuthError(error.message) };
  }

  if (data.user) {
    await supabase.from("users").upsert({
      id: data.user.id,
      name,
      email,
      role,
    });
  }

  if (data.session) {
    redirect(role === "parent" ? "/parent" : "/dashboard");
  }

  return {
    success:
      "Kayıt başarılı. E-posta doğrulaması açıksa gelen kutunuzu kontrol edin, ardından giriş yapın.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
