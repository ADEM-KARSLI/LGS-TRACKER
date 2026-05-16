import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { getStudentDashboardData } from "@/lib/dashboard";
import Link from "next/link";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const profile = await requireRole("student");
  const { saved } = await searchParams;
  const {
    recentTests,
    totalTests,
    pendingCount,
    criticalCount,
    understoodCount,
    weeklyTests,
    weeklyQuestions,
    weeklyDistribution,
  } = await getStudentDashboardData(profile.id);

  return (
    <AppShell role="student" title="Dashboard" userName={profile.name}>
      {saved === "1" && (
        <p className="mb-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          Test kaydedildi. Çözülemeyen sorular bekleyen listesine eklendi.
        </p>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam Test" value={totalTests} href="/analytics" />
        <StatCard label="🟡 Bekleyen" value={pendingCount} href="/pending" accent="amber" />
        <StatCard label="🔴 Kritik" value={criticalCount} href="/critical" accent="red" />
        <StatCard label="🟢 Anlaşılan" value={understoodCount} accent="emerald" />
      </div>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Bu Hafta</p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Çözülen Testler ve Sorular
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <p className="text-slate-500">Test</p>
              <p className="mt-1 text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                {weeklyTests}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <p className="text-slate-500">Soru</p>
              <p className="mt-1 text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                {weeklyQuestions}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {weeklyDistribution.map((item) => {
            const maxValue = Math.max(
              ...weeklyDistribution.map((row) => Math.max(row.tests, row.questions)),
              1
            );
            const testWidth = Math.round((item.tests / maxValue) * 100);
            const questionWidth = Math.round((item.questions / maxValue) * 100);
            return (
              <div key={item.day} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.day}</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div>
                    <p className="text-slate-500">Test</p>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-indigo-600"
                        style={{ width: `${testWidth}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{item.tests}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Soru</p>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${questionWidth}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{item.questions}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link href="/test/new">
          <Button>➕ Test Ekle</Button>
        </Link>
        <Link href="/pending">
          <Button variant="secondary">🟡 Bekleyen Sorular</Button>
        </Link>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Son Testler
        </h2>
        {recentTests.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500 dark:border-slate-600">
            Henüz test yok. Soru matrisi ile ilk testinizi ekleyin.
          </p>
        ) : (
          <ul className="space-y-3">
            {recentTests.map((test) => {
              const wrong = test.total_questions - test.correct_count;
              const net = test.correct_count - wrong * 0.25;
              return (
                <li
                  key={test.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {test.subject} — {test.topic}
                      </p>
                      <p className="text-sm text-slate-500">
                        {test.source} · Test #{test.test_no}
                      </p>
                    </div>
                    <time className="text-xs text-slate-400">
                      {formatDate(test.created_at)}
                    </time>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {test.correct_count}/{test.total_questions} doğru · {wrong} çözülemeyen
                    · Net: {net.toFixed(2)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href?: string;
  accent?: "amber" | "red" | "emerald";
}) {
  const colors = {
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
  };

  const inner = (
    <>
      <p className="text-sm text-slate-500">{label}</p>
      <p
        className={`mt-1 text-3xl font-bold ${
          accent ? colors[accent] : "text-indigo-600 dark:text-indigo-400"
        }`}
      >
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-slate-200 bg-white p-6 transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      {inner}
    </div>
  );
}
