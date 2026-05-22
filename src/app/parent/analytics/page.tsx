import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";
import { getQuestionStats } from "@/lib/questions";
import { getParentStudents } from "@/lib/students";

export default async function ParentAnalyticsPage() {
  const profile = await requireRole("parent");
  const students = await getParentStudents(profile.id);
  const rows = await Promise.all(
    students.map(async (student) => ({
      student,
      stats: await getQuestionStats(student.id),
    }))
  );

  return (
    <AppShell role="parent" title="Öğrenci Analizi" userName={profile.name}>
      <p className="mb-6 text-slate-600 dark:text-slate-400">
        Bağlı öğrencilerin test ve soru durumlarını özet olarak takip edin.
      </p>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          Analiz için önce öğrenci hesabı oluşturun.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map(({ student, stats }) => (
            <article
              key={student.id}
              className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    {student.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {student.username ? `@${student.username}` : student.email}
                    {student.grade ? ` · ${student.grade}. sınıf` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
                  {stats.totalTests} test
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <Stat label="Bekleyen" value={stats.pending} tone="amber" />
                <Stat label="Emin değil" value={stats.unsure} tone="amber" />
                <Stat label="Kritik" value={stats.critical} tone="red" />
                <Stat label="Anlaşılan" value={stats.understood} tone="emerald" />
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "red" | "emerald";
}) {
  const colors = {
    amber: "text-amber-700 dark:text-amber-300",
    red: "text-red-700 dark:text-red-300",
    emerald: "text-emerald-700 dark:text-emerald-300",
  };

  return (
    <div className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colors[tone]}`}>{value}</p>
    </div>
  );
}
