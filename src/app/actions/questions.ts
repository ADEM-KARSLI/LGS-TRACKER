"use server";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ReviewOutcome, WeakQuestionStatus } from "@/types/database";
import { revalidatePath } from "next/cache";

function revalidateAll() {
  revalidatePath("/pending");
  revalidatePath("/critical");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/parent");
  revalidatePath("/parent/critical");
}

async function getQuestionForStudent(questionId: string, studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weak_questions")
    .select("id, status, test_id, test_records!inner(student_id)")
    .eq("id", questionId)
    .single();

  if (error || !data) return null;

  const row = data as unknown as {
    id: string;
    status: WeakQuestionStatus;
    test_records: { student_id: string };
  };

  if (row.test_records?.student_id !== studentId) return null;
  return row;
}

const OUTCOME_STATUS: Record<ReviewOutcome, WeakQuestionStatus> = {
  understood: "understood",
  unsure: "unsure",
  critical: "critical",
};

export async function submitQuestionReview(
  questionId: string,
  outcome: ReviewOutcome,
  triedAgain = false,
  watchedVideo = false,
  reviewedTopic = false
) {
  const profile = await requireRole("student");
  const question = await getQuestionForStudent(questionId, profile.id);

  if (!question) return { error: "Soru bulunamadı." };
  if (question.status !== "pending") {
    return { error: "Bu soru artık bekleyen listede değil." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("weak_questions")
    .update({ status: OUTCOME_STATUS[outcome] })
    .eq("id", questionId);

  if (error) return { error: error.message };

  revalidateAll();
  return { success: true };
}

export async function resolveParentQuestion(questionId: string) {
  const profile = await requireRole("parent");
  const supabase = await createClient();

  const { data: question, error: fetchError } = await supabase
    .from("weak_questions")
    .select("id, status, test_records!inner(student_id)")
    .eq("id", questionId)
    .in("status", ["critical", "unsure"])
    .single();

  if (fetchError || !question) {
    return { error: "İncelenecek soru bulunamadı." };
  }

  const studentId = (question as unknown as { test_records: { student_id: string } })
    .test_records.student_id;

  const { data: link } = await supabase
    .from("parent_student_relations")
    .select("parent_id")
    .eq("parent_id", profile.id)
    .eq("student_id", studentId)
    .maybeSingle();

  if (!link) {
    return { error: "Bu öğrenci hesabınıza bağlı değil." };
  }

  const { error } = await supabase
    .from("weak_questions")
    .update({ status: "resolved" })
    .eq("id", questionId);

  if (error) return { error: error.message };

  revalidateAll();
  return { success: true };
}
