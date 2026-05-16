import { buildQuestionTree } from "@/lib/question-tree";
import { createClient } from "@/lib/supabase/server";
import type {
  PendingTree,
  QuestionGroup,
  TestRecord,
  WeakQuestion,
  WeakQuestionStatus,
  WeakQuestionWithTest,
} from "@/types/database";

function groupByTest(
  rows: WeakQuestionWithTest[]
): QuestionGroup[] {
  const map = new Map<string, QuestionGroup>();

  for (const row of rows) {
    const test = row.test_records as TestRecord;
    const existing = map.get(test.id);
    const question: WeakQuestion = {
      id: row.id,
      test_id: row.test_id,
      question_no: row.question_no,
      status: row.status,
      created_at: row.created_at,
    };

    if (existing) {
      existing.questions.push(question);
    } else {
      map.set(test.id, { test, questions: [question] });
    }
  }

  return [...map.values()].map((g) => ({
    ...g,
    questions: g.questions.sort((a, b) => a.question_no - b.question_no),
  }));
}

async function fetchQuestions(
  studentId: string,
  status: WeakQuestionStatus
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weak_questions")
    .select(
      `
      id,
      test_id,
      question_no,
      status,
      created_at,
      test_records!inner (
        id,
        student_id,
        subject,
        topic,
        source,
        test_no,
        total_questions,
        correct_count,
        created_at
      )
    `
    )
    .eq("test_records.student_id", studentId)
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return groupByTest((data ?? []) as unknown as WeakQuestionWithTest[]);
}

const WEAK_SELECT = `
  id,
  test_id,
  question_no,
  status,
  created_at,
  test_records!inner (
    id,
    student_id,
    subject,
    topic,
    source,
    test_no,
    total_questions,
    correct_count,
    created_at
  )
`;

async function fetchWeakRows(studentId: string, statuses: WeakQuestionStatus[]) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weak_questions")
    .select(WEAK_SELECT)
    .eq("test_records.student_id", studentId)
    .in("status", statuses)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as WeakQuestionWithTest[];
}

export async function getPendingTree(studentId: string): Promise<PendingTree> {
  const rows = await fetchWeakRows(studentId, ["pending"]);
  return buildQuestionTree(rows);
}

export async function getCriticalTree(studentId: string): Promise<PendingTree> {
  const rows = await fetchWeakRows(studentId, ["critical", "unsure"]);
  return buildQuestionTree(rows);
}

export async function getPendingQuestions(studentId: string) {
  return fetchQuestions(studentId, "pending");
}

export async function getCriticalQuestions(studentId: string) {
  const rows = await fetchWeakRows(studentId, ["critical", "unsure"]);
  return groupByTest(rows);
}

export async function getCriticalByPriority(studentId: string) {
  const groups = await getCriticalQuestions(studentId);
  return {
    high: groups
      .map((g) => ({
        ...g,
        questions: g.questions.filter((q) => q.status === "critical"),
      }))
      .filter((g) => g.questions.length > 0),
    light: groups
      .map((g) => ({
        ...g,
        questions: g.questions.filter((q) => q.status === "unsure"),
      }))
      .filter((g) => g.questions.length > 0),
  };
}

export async function getCriticalQuestionsForParent(parentId: string) {
  const supabase = await createClient();

  const { data: links, error: linkError } = await supabase
    .from("parent_student_relations")
    .select("student_id")
    .eq("parent_id", parentId);

  if (linkError) throw new Error(linkError.message);
  if (!links?.length) return [];

  const studentIds = links.map((l) => l.student_id);

  const { data: students } = await supabase
    .from("users")
    .select("id, name")
    .in("id", studentIds);

  const nameById = new Map((students ?? []).map((s) => [s.id, s.name]));
  const { data, error } = await supabase
    .from("weak_questions")
    .select(
      `
      id,
      test_id,
      question_no,
      status,
      created_at,
      test_records!inner (
        id,
        student_id,
        subject,
        topic,
        source,
        test_no,
        total_questions,
        correct_count,
        created_at
      )
    `
    )
    .in("test_records.student_id", studentIds)
    .in("status", ["critical", "unsure"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const groups = groupByTest((data ?? []) as unknown as WeakQuestionWithTest[]);

  return groups.map((g) => ({
    ...g,
    studentName: nameById.get(g.test.student_id) ?? "Öğrenci",
  }));
}

export async function getQuestionStats(studentId: string) {
  const supabase = await createClient();

  const { data: tests } = await supabase
    .from("test_records")
    .select("id, subject")
    .eq("student_id", studentId);

  const testIds = (tests ?? []).map((t) => t.id);
  if (testIds.length === 0) {
    return {
      totalTests: 0,
      pending: 0,
      critical: 0,
      unsure: 0,
      understood: 0,
      parentReview: 0,
      bySubject: [] as {
        subject: string;
        pending: number;
        critical: number;
        unsure: number;
      }[],
    };
  }

  const { data: weak } = await supabase
    .from("weak_questions")
    .select("status, test_id, test_records!inner(subject)")
    .in("test_id", testIds);

  const rows = (weak ?? []) as unknown as {
    status: WeakQuestionStatus;
    test_records: { subject: string };
  }[];

  const pending = rows.filter((r) => r.status === "pending").length;
  const critical = rows.filter((r) => r.status === "critical").length;
  const unsure = rows.filter((r) => r.status === "unsure").length;
  const understood = rows.filter((r) => r.status === "understood").length;

  const subjectMap = new Map<
    string,
    { pending: number; critical: number; unsure: number }
  >();
  for (const row of rows) {
    const subject = row.test_records.subject;
    const entry = subjectMap.get(subject) ?? { pending: 0, critical: 0, unsure: 0 };
    if (row.status === "pending") entry.pending++;
    if (row.status === "critical") entry.critical++;
    if (row.status === "unsure") entry.unsure++;
    subjectMap.set(subject, entry);
  }

  return {
    totalTests: tests?.length ?? 0,
    pending,
    critical,
    unsure,
    understood,
    parentReview: critical + unsure,
    bySubject: [...subjectMap.entries()].map(([subject, counts]) => ({
      subject,
      ...counts,
    })),
  };
}
