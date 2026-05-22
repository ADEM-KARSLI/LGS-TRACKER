import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";

export async function getParentStudents(parentId: string): Promise<User[]> {
  const supabase = await createClient();

  const { data: directStudents, error: directError } = await supabase
    .from("users")
    .select("id, name, email, role, username, grade, parent_id, created_at")
    .eq("role", "student")
    .eq("parent_id", parentId);

  if (directError) throw new Error(directError.message);

  const { data: links, error: linkError } = await supabase
    .from("parent_student_relations")
    .select("student_id")
    .eq("parent_id", parentId);

  if (linkError) throw new Error(linkError.message);

  const linkedIds = (links ?? []).map((link) => link.student_id);
  let linkedStudents: User[] = [];

  if (linkedIds.length > 0) {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, username, grade, parent_id, created_at")
      .in("id", linkedIds);

    if (error) throw new Error(error.message);
    linkedStudents = (data ?? []) as User[];
  }

  const byId = new Map<string, User>();
  for (const student of [...((directStudents ?? []) as User[]), ...linkedStudents]) {
    byId.set(student.id, student);
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "tr"));
}
