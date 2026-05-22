import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { StudentCreateForm } from "@/components/student-create-form";
import { requireRole } from "@/lib/auth";
import { getCriticalQuestionsForParent } from "@/lib/questions";
import { getParentStudents } from "@/lib/students";
import Link from "next/link";

export default async function ParentPage() {
  const profile = await requireRole("parent");
  const students = await getParentStudents(profile.id);

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

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/parent/resources">
          <Button>📚 Kaynak Yönetimi</Button>
        </Link>
        <Link href="/parent/analytics">
          <Button variant="secondary">📊 Analiz</Button>
        </Link>
        <Link href="/parent/critical">
          <Button variant="secondary">🔴 Kritik Soruları Yönet</Button>
        </Link>
      </div>

      <div className="mb-8">
        <StudentCreateForm />
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
          <p className="font-medium text-slate-800 dark:text-slate-100">
            Henüz öğrenci bağlantısı yok
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Yukarıdaki formdan ilk öğrenci hesabını oluşturabilirsiniz.
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
              <p className="text-sm text-slate-500">
                {student.username ? `@${student.username}` : student.email}
                {student.grade ? ` · ${student.grade}. sınıf` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
