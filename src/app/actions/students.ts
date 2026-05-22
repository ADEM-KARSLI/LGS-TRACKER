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

type AdminClient = ReturnType<typeof createAdminClient>;

type StudentOwnership = {
  id: string;
  email: string;
  username: string | null;
};

function getAdminOrState(): { admin?: AdminClient; state?: StudentFormState } {
  try {
    return { admin: createAdminClient() };
  } catch {
    return {
      state: {
        error:
          "Öğrenci işlemleri için SUPABASE_SERVICE_ROLE_KEY sunucu ortam değişkeni tanımlanmalıdır.",
      },
    };
  }
}

async function getOwnedStudent(
  admin: AdminClient,
  parentId: string,
  studentId: string
): Promise<StudentOwnership | null> {
  const { data: student, error: studentError } = await admin
    .from("users")
    .select("id, email, username, parent_id")
    .eq("id", studentId)
    .eq("role", "student")
    .maybeSingle();

  if (studentError) {
    throw new Error(studentError.message);
  }

  if (!student) return null;

  if (student.parent_id === parentId) {
    return student as StudentOwnership;
  }

  const { data: relation, error: relationError } = await admin
    .from("parent_student_relations")
    .select("student_id")
    .eq("parent_id", parentId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (relationError) {
    throw new Error(relationError.message);
  }

  return relation ? (student as StudentOwnership) : null;
}

function revalidateStudentViews() {
  revalidatePath("/parent");
  revalidatePath("/parent/resources");
  revalidatePath("/parent/analytics");
  revalidatePath("/parent/critical");
}

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
  const { admin, state } = getAdminOrState();
  if (!admin) return state!;

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

  revalidateStudentViews();

  return {
    success: `${name} için öğrenci hesabı oluşturuldu. Kullanıcı adı: ${username}`,
  };
}

export async function updateStudent(
  _prev: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const parent = await requireRole("parent");
  const studentId = String(formData.get("student_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const rawUsername = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const usernameCheck = validateStudentUsername(rawUsername);

  if (!studentId || !name || !grade || !rawUsername) {
    return { error: "Öğrenci adı, sınıf ve kullanıcı adı zorunludur." };
  }

  if (!usernameCheck.valid) {
    return { error: usernameCheck.error ?? "Kullanıcı adı geçersiz." };
  }

  if (password && password.length < 6) {
    return { error: "Yeni şifre en az 6 karakter olmalıdır." };
  }

  const { admin, state } = getAdminOrState();
  if (!admin) return state!;

  let student: StudentOwnership | null;
  try {
    student = await getOwnedStudent(admin, parent.id, studentId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Öğrenci okunamadı." };
  }

  if (!student) {
    return { error: "Bu öğrenci hesabınıza bağlı değil." };
  }

  const username = usernameCheck.username;
  const email = studentEmailFromUsername(username);

  if (username !== student.username) {
    const { data: existingStudent, error: existingError } = await admin
      .from("users")
      .select("id")
      .eq("username", username)
      .neq("id", studentId)
      .maybeSingle();

    if (existingError) return { error: existingError.message };
    if (existingStudent) return { error: "Bu kullanıcı adı zaten kullanılıyor." };
  }

  const authUpdate: {
    email: string;
    password?: string;
    user_metadata: Record<string, string>;
  } = {
    email,
    user_metadata: {
      name,
      role: "student",
      username,
      grade,
      parent_id: parent.id,
    },
  };

  if (password) {
    authUpdate.password = password;
  }

  const { error: authError } = await admin.auth.admin.updateUserById(
    studentId,
    authUpdate
  );

  if (authError) {
    return { error: authError.message };
  }

  const { error: profileError } = await admin
    .from("users")
    .update({
      name,
      email,
      username,
      grade,
      parent_id: parent.id,
    })
    .eq("id", studentId);

  if (profileError) {
    return { error: profileError.message };
  }

  revalidateStudentViews();

  return { success: `${name} bilgileri güncellendi.` };
}

export async function deleteStudent(formData: FormData) {
  const parent = await requireRole("parent");
  const studentId = String(formData.get("student_id") ?? "").trim();

  if (!studentId) {
    throw new Error("Silinecek öğrenci bulunamadı.");
  }

  const { admin } = getAdminOrState();
  if (!admin) {
    throw new Error(
      "Öğrenci silmek için SUPABASE_SERVICE_ROLE_KEY sunucu ortam değişkeni tanımlanmalıdır."
    );
  }

  const student = await getOwnedStudent(admin, parent.id, studentId);
  if (!student) {
    throw new Error("Bu öğrenci hesabınıza bağlı değil.");
  }

  const { error } = await admin.auth.admin.deleteUser(studentId);
  if (error) {
    throw new Error(error.message);
  }

  revalidateStudentViews();
}
