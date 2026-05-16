import { AppShell } from "@/components/app-shell";
import { TestEntryForm } from "@/components/test-entry-form";
import { requireRole } from "@/lib/auth";

export default async function NewTestPage() {
  const profile = await requireRole("student");

  return (
    <AppShell role="student" title="Yeni Test" userName={profile.name}>
      <p className="mb-6 text-slate-600 dark:text-slate-400">
        Test bilgilerini girin ve yanlış yaptığınız soru numaralarını ekleyin.
      </p>
      <TestEntryForm />
    </AppShell>
  );
}
