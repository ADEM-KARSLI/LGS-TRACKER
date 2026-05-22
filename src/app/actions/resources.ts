"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export type ResourceFormState = {
  error?: string;
  success?: string;
};

export async function createResource(formData: FormData) {
  const profile = await requireRole("parent");
  const studentId = String(formData.get("student_id") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();

  if (!studentId || !source) {
    throw new Error("Lütfen öğrenci ve kaynak adını girin.");
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
    throw new Error("Geçersiz öğrenci seçimi.");
  }

  const { error: insertError } = await supabase.from("study_resources").insert({
    parent_id: profile.id,
    student_id: studentId,
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
