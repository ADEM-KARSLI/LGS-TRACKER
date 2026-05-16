import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";
import { getQuestionStats } from "@/lib/questions";

export default async function AnalyticsPage() {
  const profile = await requireRole("student");
  const stats = await getQuestionStats(profile.id);

  return (
    <AppShell role="student" title="Analiz" userName={profile.name}>
      <p className="mb-6 text-slate-600 dark:text-slate-400">
        Öğrenme takibinin özet görünümü.
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Toplam Test" value={stats.totalTests} />
        <Stat label="🟡 Bekleyen" value={stats.pending} accent="amber" />
        <Stat label="🔴 Kritik" value={stats.critical} accent="red" />
        <Stat label="🟡 Emin değilim" value={stats.unsure} accent="amber" />
        <Stat label="🟢 Anlaşılan" value={stats.understood} accent="emerald" />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Derse Göre Dağılım
        </h2>
        {stats.bySubject.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">
            Henüz veri yok.
          </p>
        ) : (
          <ul className="space-y-3">
            {stats.bySubject.map((row) => (
              <li
                key={row.subject}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="font-medium">{row.subject}</span>
                <span className="text-sm text-slate-500">
                  🟡 {row.pending} bekleyen · 🔴 {row.critical} kritik · 🟡{" "}
                  {row.unsure} emin değilim
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "amber" | "red" | "emerald";
}) {
  const colors = {
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent ? colors[accent] : "text-indigo-600 dark:text-indigo-400"}`}>
        {value}
      </p>
    </div>
  );
}
