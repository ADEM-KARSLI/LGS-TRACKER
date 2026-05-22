"use server";

import { formatAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/config";
import { isStudentUsername, studentEmailFromUsername } from "@/lib/student-auth";
import { redirect } from "next/navigation";

export async function signIn(
  formData: FormData
): Promise<{ error?: string } | void> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const email = isStudentUsername(identifier)
    ? studentEmailFromUsername(identifier)
    : identifier.toLowerCase();

  if (!identifier || !password) {
    return { error: "E-posta/kullanıcı adı ve şifre zorunludur." };
  }

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
  const role = "parent";

  if (!name || !email || !password) {
    return { error: "Tüm alanları doldurun." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
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
