import { AppShell } from "@/components/app-shell";
import { TestEntryForm } from "@/components/test-entry-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function NewTestPage() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: sourceRows } = await supabase
    .from("test_records")
    .select("source")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false });

  const { data: resourceRows } = await supabase
    .from("study_resources")
    .select("subject, topic, source")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false });

  const sources = Array.from(
    new Set((sourceRows ?? []).map((row) => row.source.trim()).filter(Boolean))
  );

  return (
    <AppShell role="student" title="Yeni Test" userName={profile.name}>
      <p className="mb-6 text-slate-600 dark:text-slate-400">
        Test bilgilerini girin ve yanlış yaptığınız soru numaralarını ekleyin.
      </p>
      <TestEntryForm
        existingSources={sources}
        studentResources={(resourceRows ?? []) as { subject: string; topic: string; source: string }[]}
      />
    </AppShell>
  );
}
