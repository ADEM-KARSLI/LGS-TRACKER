import { createClient } from "@/lib/supabase/server";
import type { TestRecord } from "@/types/database";
import { getQuestionStats } from "@/lib/questions";

export async function getStudentDashboardData(studentId: string) {
  const supabase = await createClient();

  const { data: tests, error: testsError } = await supabase
    .from("test_records")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (testsError) throw new Error(testsError.message);

  const stats = await getQuestionStats(studentId);

  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const { data: weeklyTests, error: weeklyError } = await supabase
    .from("test_records")
    .select("id, total_questions, created_at")
    .eq("student_id", studentId)
    .gte("created_at", weekStart.toISOString())
    .lt("created_at", weekEnd.toISOString());

  if (weeklyError) throw new Error(weeklyError.message);

  const weekRows = (weeklyTests ?? []) as Array<{
    id: string;
    total_questions: number;
    created_at: string;
  }>;

  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const weeklyDistribution = dayNames.map((label, index) => ({
    day: label,
    tests: 0,
    questions: 0,
  }));

  for (const test of weekRows) {
    const testDate = new Date(test.created_at);
    const diff = Math.floor((testDate.getTime() - weekStart.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) {
      weeklyDistribution[diff].tests += 1;
      weeklyDistribution[diff].questions += test.total_questions;
    }
  }

  return {
    recentTests: (tests ?? []) as TestRecord[],
    totalTests: stats.totalTests,
    pendingCount: stats.pending,
    criticalCount: stats.critical,
    unsureCount: stats.unsure,
    parentReviewCount: stats.parentReview,
    understoodCount: stats.understood,
    weeklyTests: weekRows.length,
    weeklyQuestions: weekRows.reduce((sum, test) => sum + (test.total_questions ?? 0), 0),
    weeklyDistribution,
  };
}
