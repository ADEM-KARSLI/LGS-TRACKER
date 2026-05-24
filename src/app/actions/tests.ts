"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type TestFormState = {
  error?: string;
  success?: string;
};

function parseWrongQuestions(raw: string, totalQuestions: number): number[] {
  if (!raw.trim()) return [];

  const numbers = raw
    .split(/[,;\s]+/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => parseInt(value, 10));

  if (numbers.some((value) => Number.isNaN(value) || value < 1 || value > totalQuestions)) {
    throw new Error(`Soru numaraları 1 ile ${totalQuestions} arasında olmalıdır.`);
  }

  return [...new Set(numbers)].sort((a, b) => a - b);
}

export async function createTest(
  _prev: TestFormState,
  formData: FormData
): Promise<TestFormState> {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const source = String(formData.get("source") ?? "").trim();
  const pageNo = parseInt(String(formData.get("page_no") ?? ""), 10);
  const wrongRaw = String(formData.get("wrong_questions") ?? "").trim();

  if (!source) {
    return { error: "Kaynak zorunludur." };
  }

  if (Number.isNaN(pageNo) || pageNo < 1) {
    return { error: "Sayfa numarasını kontrol edin." };
  }

  const { data: template, error: templateError } = await supabase
    .from("test_templates")
    .select("subject, topic, test_no, total_questions")
    .eq("student_id", profile.id)
    .eq("source", source)
    .eq("page_no", pageNo)
    .maybeSingle();

  if (templateError) {
    return { error: templateError.message };
  }

  if (!template) {
    return { error: "Seçilen kaynak ve sayfa numarası için kayıtlı test bulunamadı." };
  }

  let wrongQuestions: number[];
  try {
    wrongQuestions = parseWrongQuestions(wrongRaw, template.total_questions);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Soru matrisi geçersiz.",
    };
  }

  const correctCount = template.total_questions - wrongQuestions.length;

  const { data: testRecord, error: testError } = await supabase
    .from("test_records")
    .insert({
      student_id: profile.id,
      subject: template.subject,
      topic: template.topic,
      source,
      test_no: template.test_no,
      page_no: pageNo,
      total_questions: template.total_questions,
      correct_count: correctCount,
    })
    .select("id")
    .single();

  if (testError || !testRecord) {
    return { error: testError?.message ?? "Test kaydedilemedi." };
  }

  if (wrongQuestions.length > 0) {
    const { error: weakError } = await supabase.from("weak_questions").insert(
      wrongQuestions.map((questionNo) => ({
        test_id: testRecord.id,
        question_no: questionNo,
        status: "pending" as const,
      }))
    );

    if (weakError) {
      return { error: weakError.message };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/pending");
  revalidatePath("/analytics");
  redirect("/dashboard?saved=1");
}
