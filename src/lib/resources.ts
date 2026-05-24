import { createClient } from "@/lib/supabase/server";
import { getParentStudents } from "@/lib/students";
import type { StudyResource, User } from "@/types/database";

export async function getStudentResources(
  studentId: string
): Promise<StudyResource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("test_templates")
    .select(
      "id, parent_id, student_id, grade, subject, topic, source, test_no, page_no, total_questions, created_at"
    )
    .eq("student_id", studentId)
    .order("source", { ascending: true })
    .order("page_no", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as StudyResource[];
}

export async function getParentResources(parentId: string) {
  const supabase = await createClient();
  const students = await getParentStudents(parentId);
  const studentIds = students.map((student) => student.id);
  if (studentIds.length === 0) {
    return { students: [] as User[], resources: [] as StudyResource[] };
  }

  const { data: resources, error: resourceError } = await supabase
    .from("test_templates")
    .select(
      "id, parent_id, student_id, grade, subject, topic, source, test_no, page_no, total_questions, created_at"
    )
    .in("student_id", studentIds)
    .order("source", { ascending: true })
    .order("page_no", { ascending: true });

  if (resourceError) throw new Error(resourceError.message);

  return {
    students,
    resources: (resources ?? []) as StudyResource[],
  };
}

export async function deleteStudyResource(parentId: string, resourceId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("test_templates")
    .delete()
    .eq("id", resourceId)
    .eq("parent_id", parentId);

  if (error) throw new Error(error.message);
}
