import { AppShell } from "@/components/app-shell";
import { ParentQuestionCard } from "@/components/parent-question-card";
import { requireRole } from "@/lib/auth";
import { getCriticalQuestionsForParent } from "@/lib/questions";

export default async function ParentCriticalPage() {
  const profile = await requireRole("parent");
  const groups = await getCriticalQuestionsForParent(profile.id);

  const high = groups
    .map((g) => ({
      ...g,
      questions: g.questions.filter((q) => q.status === "critical"),
    }))
    .filter((g) => g.questions.length > 0);

  const light = groups
    .map((g) => ({
      ...g,
      questions: g.questions.filter((q) => q.status === "unsure"),
    }))
    .filter((g) => g.questions.length > 0);

  return (
    <AppShell role="parent" title="Kritik Sorular" userName={profile.name}>
      <p className="mb-6 text-slate-600 dark:text-slate-400">
        Öğrencinizin işaretlediği soruları inceleyin ve çözüldüğünde kapatın.
      </p>

      {high.length === 0 && light.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center text-slate-500">
          İncelenecek soru yok veya öğrenci hesabı bağlı değil.
        </div>
      ) : (
        <div className="space-y-8">
          {high.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-red-700">🔴 Yüksek öncelik</h2>
              <ul className="space-y-4">
                {high.map((group) => (
                  <li key={`${group.test.id}-high`}>
                    <ParentQuestionCard group={group} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {light.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-amber-700">🟡 Hafif kritik</h2>
              <ul className="space-y-4">
                {light.map((group) => (
                  <li key={`${group.test.id}-light`}>
                    <ParentQuestionCard group={group} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </AppShell>
  );
}
