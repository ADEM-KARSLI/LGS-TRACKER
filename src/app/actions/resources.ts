"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import {
  getSubjectsForGrade,
  getTopicsForSubject,
  normalizeGradeValue,
} from "@/lib/lgs-curriculum";
import { revalidatePath } from "next/cache";

export type ResourceFormState = {
  error?: string;
  success?: string;
};

function resourceErrorMessage(message: string, code?: string) {
  if (message.includes("duplicate key") || message.includes("unique")) {
    return "Bu kaynak ve sayfa numarası bu öğrenci için zaten eklenmiş.";
  }

  if (message.includes("row-level security")) {
    return `Test şablonu ekleme yetkisi Supabase policy tarafından reddedildi${code ? ` (${code})` : ""}. Veritabanı migration'ını çalıştırın.`;
  }

  if (message.includes("test_templates")) {
    return "test_templates tablosu eksik görünüyor. 010 migration'ını çalıştırın.";
  }

  return code ? `${message} (${code})` : message;
}

export async function createResource(
  _prev: ResourceFormState,
  formData: FormData
): Promise<ResourceFormState> {
  const profile = await requireRole("parent");
  const studentId = String(formData.get("student_id") ?? "").trim();
  const grade = normalizeGradeValue(String(formData.get("grade") ?? ""));
  const subject = String(formData.get("subject") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();
  const testNo = parseInt(String(formData.get("test_no") ?? ""), 10);
  const pageNo = parseInt(String(formData.get("page_no") ?? ""), 10);
  const totalQuestions = parseInt(
    String(formData.get("total_questions") ?? ""),
    10
  );

  if (!studentId || !grade || !subject || !topic || !source) {
    return {
      error:
        "Lütfen öğrenci, sınıf, kaynak adı, ders, konu, test no, sayfa no ve toplam soru sayısını girin.",
    };
  }

  if (!getSubjectsForGrade(grade).includes(subject)) {
    return { error: "Seçilen sınıf için geçersiz ders seçimi." };
  }

  if (!getTopicsForSubject(grade, subject).includes(topic)) {
    return { error: "Seçilen sınıf ve ders için geçersiz konu seçimi." };
  }

  if (
    Number.isNaN(testNo) ||
    Number.isNaN(pageNo) ||
    Number.isNaN(totalQuestions) ||
    testNo < 1 ||
    pageNo < 1 ||
    totalQuestions < 1
  ) {
    return { error: "Test no, sayfa no ve toplam soru sayısını kontrol edin." };
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

  const { error: insertError } = await supabase.from("test_templates").insert({
    parent_id: profile.id,
    student_id: studentId,
    grade,
    subject,
    topic,
    source,
    test_no: testNo,
    page_no: pageNo,
    total_questions: totalQuestions,
  });

  if (insertError) {
    return {
      error: resourceErrorMessage(insertError.message, insertError.code),
    };
  }

  revalidatePath("/parent/resources");
  revalidatePath("/test/new");

  return { success: "Test şablonu eklendi." };
}

export async function deleteResource(formData: FormData) {
  const profile = await requireRole("parent");
  const resourceId = String(formData.get("resource_id") ?? "").trim();

  if (!resourceId) {
    throw new Error("Silinecek kayıt bulunamadı.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("test_templates")
    .delete()
    .eq("id", resourceId)
    .eq("parent_id", profile.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/parent/resources");
  revalidatePath("/test/new");
}
