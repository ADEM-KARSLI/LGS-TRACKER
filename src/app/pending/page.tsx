import { AppShell } from "@/components/app-shell";
import { PendingAccordion } from "@/components/pending-accordion";
import { requireRole } from "@/lib/auth";
import { getPendingTree } from "@/lib/questions";
import Link from "next/link";

export default async function PendingPage() {
  const profile = await requireRole("student");
  const tree = await getPendingTree(profile.id);

  return (
    <AppShell role="student" title="Bekleyen Sorular" userName={profile.name}>
      <p className="mb-6 text-slate-600 dark:text-slate-400">
        Her satırda 4 kolon bulunur: ders ve kaynak, konu ve test numarası, soru
        numarası ve güncelleme alanı.
      </p>

      {tree.total === 0 ? (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-6 py-10 text-center dark:border-amber-800 dark:bg-amber-950/30">
          <p className="font-medium text-amber-900 dark:text-amber-100">
            Bekleyen soru yok
          </p>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
            Yeni test ekleyerek çözemediğin soruları işaretleyebilirsin.
          </p>
          <Link
            href="/test/new"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            Test Ekle
          </Link>
        </div>
      ) : (
        <PendingAccordion tree={tree} />
      )}
    </AppShell>
  );
}
