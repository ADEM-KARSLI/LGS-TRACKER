"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ResourceFormState = {
  error?: string;
  success?: string;
};

function resourceErrorMessage(message: string, code?: string) {
  if (message.includes("duplicate key") || message.includes("unique")) {
    return "Bu kaynak bu öğrenci için zaten eklenmiş.";
  }

  if (message.includes("row-level security")) {
    return `Kaynak ekleme yetkisi Supabase policy tarafından reddedildi${code ? ` (${code})` : ""}. Veritabanı kaynak policy migration'ını çalıştırın.`;
  }

  if (message.includes("parent_id")) {
    return "study_resources tablosunda parent_id kolonu veya ilişkili policy eksik görünüyor.";
  }

  if (message.includes("subject") || message.includes("topic")) {
    return "Kaynak tablosu eski kolonları bekliyor. subject/topic bağımlılığı temizlenmeli.";
  }

  return code ? `${message} (${code})` : message;
}

export async function createResource(
  _prev: ResourceFormState,
  formData: FormData
): Promise<ResourceFormState> {
  const profile = await requireRole("parent");
  const studentId = String(formData.get("student_id") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();

  if (!studentId || !source) {
    return { error: "Lütfen öğrenci ve kaynak adını girin." };
  }

  const supabase = await createClient();
  const { data: link, error: linkError } = await supabase
    .from("parent_student_relations")
    .select("student_id")
    .eq("parent_id", profile.id)
    .eq("student_id", studentId)
    .single();

  const { data: student } = await supabase
    .from("users")
    .select("id")
    .eq("id", studentId)
    .eq("parent_id", profile.id)
    .maybeSingle();

  if ((linkError || !link) && !student) {
    return { error: "Geçersiz öğrenci seçimi." };
  }

  const { error: insertError } = await supabase.from("study_resources").insert({
    parent_id: profile.id,
    student_id: studentId,
    source,
  });

  if (insertError) {
    return {
      error: resourceErrorMessage(insertError.message, insertError.code),
    };
  }

  revalidatePath("/parent/resources");
  revalidatePath("/test/new");

  return { success: "Kaynak eklendi." };
}

export async function deleteResource(formData: FormData) {
  const profile = await requireRole("parent");
  const resourceId = String(formData.get("resource_id") ?? "").trim();

  if (!resourceId) {
    throw new Error("Silinecek kaynak bulunamadı.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("study_resources")
    .delete()
    .eq("id", resourceId)
    .eq("parent_id", profile.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/parent/resources");
  revalidatePath("/test/new");
}
