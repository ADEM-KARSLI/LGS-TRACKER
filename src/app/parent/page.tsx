import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCriticalQuestionsForParent } from "@/lib/questions";
import Link from "next/link";

export default async function ParentPage() {
  const profile = await requireRole("parent");
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("parent_student_relations")
    .select("student_id")
    .eq("parent_id", profile.id);

  const studentIds = (links ?? []).map((l) => l.student_id);
  let students: { id: string; name: string; email: string }[] = [];

  if (studentIds.length > 0) {
    const { data } = await supabase
      .from("users")
      .select("id, name, email")
      .in("id", studentIds);
    students = data ?? [];
  }

  const criticalGroups = await getCriticalQuestionsForParent(profile.id);
  const criticalCount = criticalGroups.reduce(
    (sum, g) => sum + g.questions.length,
    0
  );

  return (
    <AppShell role="parent" title="Veli Paneli" userName={profile.name}>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Bağlı öğrenci</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {students.length}
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-300">🔴 Açık kritik soru</p>
          <p className="mt-1 text-3xl font-bold text-red-700 dark:text-red-300">
            {criticalCount}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <Link href="/parent/critical">
          <Button>🔴 Kritik Soruları Yönet</Button>
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
          <p className="font-medium text-slate-800 dark:text-slate-100">
            Henüz öğrenci bağlantısı yok
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Öğrenci hesabını bu veli hesabına bağlamak için veritabanında{" "}
            <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">
              parent_student_relations
            </code>{" "}
            kaydı eklenmelidir.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {students.map((student) => (
            <li
              key={student.id}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-slate-500">{student.email}</p>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
