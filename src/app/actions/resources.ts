"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/database";

export type ResourceFormState = {
  error?: string;
  success?: string;
};

export async function createResource(formData: FormData) {
  const profile = await requireRole("parent");
  const studentId = String(formData.get("student_id") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();

  if (!studentId || !subject || !topic || !source) {
    throw new Error("Lütfen öğrenci, ders, konu ve kaynak alanlarını doldurun.");
  }

  const supabase = await createClient();
  const { data: link, error: linkError } = await supabase
    .from("parent_student_relations")
    .select("student_id")
    .eq("parent_id", profile.id)
    .eq("student_id", studentId)
    .single();

  if (linkError || !link) {
    throw new Error("Geçersiz öğrenci seçimi.");
  }

  const { error: insertError } = await supabase.from("study_resources").insert({
    parent_id: profile.id,
    student_id: studentId,
    subject,
    topic,
    source,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  redirect("/parent/resources");
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

  redirect("/parent/resources");
}
