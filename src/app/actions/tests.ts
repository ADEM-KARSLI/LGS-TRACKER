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
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => parseInt(s, 10));

  if (numbers.some((n) => Number.isNaN(n) || n < 1 || n > totalQuestions)) {
    throw new Error(
      `Soru numaraları 1 ile ${totalQuestions} arasında olmalıdır.`
    );
  }

  return [...new Set(numbers)].sort((a, b) => a - b);
}

export async function createTest(
  _prev: TestFormState,
  formData: FormData
): Promise<TestFormState> {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const subject = String(formData.get("subject") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();
  const testNo = parseInt(String(formData.get("test_no") ?? ""), 10);
  const totalQuestions = parseInt(String(formData.get("total_questions") ?? ""), 10);
  const wrongRaw = String(formData.get("wrong_questions") ?? "").trim();

  if (!subject || !topic || !source) {
    return { error: "Ders, konu ve kaynak zorunludur." };
  }

  if (Number.isNaN(testNo) || Number.isNaN(totalQuestions) || testNo < 1 || totalQuestions < 1) {
    return { error: "Test no ve toplam soru sayısını kontrol edin." };
  }

  let wrongQuestions: number[];
  try {
    wrongQuestions = parseWrongQuestions(wrongRaw, totalQuestions);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Soru matrisi geçersiz." };
  }

  const correctCount = totalQuestions - wrongQuestions.length;

  const { data: testRecord, error: testError } = await supabase
    .from("test_records")
    .insert({
      student_id: profile.id,
      subject,
      topic,
      source,
      test_no: testNo,
      total_questions: totalQuestions,
      correct_count: correctCount,
    })
    .select("id")
    .single();

  if (testError || !testRecord) {
    return { error: testError?.message ?? "Test kaydedilemedi." };
  }

  if (wrongQuestions.length > 0) {
    const { error: weakError } = await supabase.from("weak_questions").insert(
      wrongQuestions.map((question_no) => ({
        test_id: testRecord.id,
        question_no,
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
