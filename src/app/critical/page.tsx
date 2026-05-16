import { AppShell } from "@/components/app-shell";
import { CriticalAccordion } from "@/components/critical-accordion";
import { requireRole } from "@/lib/auth";
import { getCriticalTree } from "@/lib/questions";

export default async function CriticalPage() {
  const profile = await requireRole("student");
  const tree = await getCriticalTree(profile.id);

  return (
    <AppShell role="student" title="Kritik Sorular" userName={profile.name}>
      <p className="mb-4 text-slate-600 dark:text-slate-400">
        Kritik sorular Excel benzeri tabloya dönüştürüldü. Her satırda ders, konu, kaynak/test, soru ve öncelik bilgisi yer alır.
      </p>

      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded border border-amber-400 bg-amber-100" />
          🟡 Hafif kritik (Emin değilim)
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded border border-red-400 bg-red-100" />
          🔴 Kritik (Anlamadım)
        </span>
      </div>

      {tree.total === 0 ? (
        <div className="rounded-xl border border-dashed border-red-300 bg-red-50 px-6 py-10 text-center dark:border-red-900 dark:bg-red-950/30">
          <p className="font-medium text-red-900 dark:text-red-100">Kritik soru yok</p>
        </div>
      ) : (
        <CriticalAccordion tree={tree} />
      )}
    </AppShell>
  );
}
