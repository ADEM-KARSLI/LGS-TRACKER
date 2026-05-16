import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";
import { StudyAdviceChat } from "@/components/study-advice-chat";

export default async function ChatPage() {
  const profile = await requireRole("student");

  return (
    <AppShell role="student" title="Chat" userName={profile.name}>
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Çalışma Önerisi AI Aracı</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Bu sayfa, `generate_study_advice` aracını kullanarak ders ve yanlış sayısına göre kısa bir öneri üretir.
          </p>
        </section>

        <StudyAdviceChat />
      </div>
    </AppShell>
  );
}
