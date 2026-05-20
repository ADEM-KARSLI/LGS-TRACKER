import { createClient } from "@/lib/supabase/server";
import type { StudyResource, User } from "@/types/database";

export async function getStudentResources(studentId: string): Promise<StudyResource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_resources")
    .select("id, parent_id, student_id, subject, topic, source, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as StudyResource[];
}

export async function getParentResources(parentId: string) {
  const supabase = await createClient();

  const { data: links, error: linkError } = await supabase
    .from("parent_student_relations")
    .select("student_id")
    .eq("parent_id", parentId);

  if (linkError) throw new Error(linkError.message);
  const studentIds = (links ?? []).map((row) => row.student_id);
  if (studentIds.length === 0) {
    return { students: [] as User[], resources: [] as StudyResource[] };
  }

  const { data: students, error: studentError } = await supabase
    .from("users")
    .select("id, name, email")
    .in("id", studentIds);

  if (studentError) throw new Error(studentError.message);

  const { data: resources, error: resourceError } = await supabase
    .from("study_resources")
    .select("id, parent_id, student_id, subject, topic, source, created_at")
    .in("student_id", studentIds)
    .order("created_at", { ascending: false });

  if (resourceError) throw new Error(resourceError.message);

  return {
    students: (students ?? []) as User[],
    resources: (resources ?? []) as StudyResource[],
  };
}

export async function createStudyResource(
  parentId: string,
  studentId: string,
  subject: string,
  topic: string,
  source: string
) {
  const supabase = await createClient();

  const { data: link, error: linkError } = await supabase
    .from("parent_student_relations")
    .select("student_id")
    .eq("parent_id", parentId)
    .eq("student_id", studentId)
    .single();

  if (linkError || !link) {
    throw new Error("Geçersiz öğrenci seçimi.");
  }

  const { error } = await supabase.from("study_resources").insert({
    parent_id: parentId,
    student_id: studentId,
    subject,
    topic,
    source,
  });

  if (error) throw new Error(error.message);
}

export async function deleteStudyResource(parentId: string, resourceId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("study_resources")
    .delete()
    .eq("id", resourceId)
    .eq("parent_id", parentId);

  if (error) throw new Error(error.message);
}
