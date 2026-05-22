"use server";

import { requireRole } from "@/lib/auth";
import {
  studentEmailFromUsername,
  validateStudentUsername,
} from "@/lib/student-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type StudentFormState = {
  error?: string;
  success?: string;
};

export async function createStudent(
  _prev: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const parent = await requireRole("parent");
  const name = String(formData.get("name") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const rawUsername = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const usernameCheck = validateStudentUsername(rawUsername);

  if (!name || !grade || !rawUsername || !password) {
    return { error: "Öğrenci adı, sınıf, kullanıcı adı ve şifre zorunludur." };
  }

  if (!usernameCheck.valid) {
    return { error: usernameCheck.error ?? "Kullanıcı adı geçersiz." };
  }

  if (password.length < 6) {
    return { error: "Şifre en az 6 karakter olmalıdır." };
  }

  const username = usernameCheck.username;
  const email = studentEmailFromUsername(username);
  let admin: ReturnType<typeof createAdminClient>;

  try {
    admin = createAdminClient();
  } catch {
    return {
      error:
        "Öğrenci oluşturmak için SUPABASE_SERVICE_ROLE_KEY sunucu ortam değişkeni tanımlanmalıdır.",
    };
  }

  const { data: existingStudent, error: existingError } = await admin
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingError) {
    return { error: existingError.message };
  }

  if (existingStudent) {
    return { error: "Bu kullanıcı adı zaten kullanılıyor." };
  }

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role: "student",
      username,
      grade,
      parent_id: parent.id,
    },
  });

  if (authError || !created.user) {
    return { error: authError?.message ?? "Öğrenci hesabı oluşturulamadı." };
  }

  const studentId = created.user.id;

  const { error: profileError } = await admin.from("users").upsert({
    id: studentId,
    name,
    email,
    role: "student",
    username,
    grade,
    parent_id: parent.id,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(studentId);
    return { error: profileError.message };
  }

  const { error: relationError } = await admin
    .from("parent_student_relations")
    .upsert({
      parent_id: parent.id,
      student_id: studentId,
    });

  if (relationError) {
    await admin.auth.admin.deleteUser(studentId);
    return { error: relationError.message };
  }

  revalidatePath("/parent");
  revalidatePath("/parent/resources");
  revalidatePath("/parent/analytics");

  return {
    success: `${name} için öğrenci hesabı oluşturuldu. Kullanıcı adı: ${username}`,
  };
}
