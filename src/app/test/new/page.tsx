import { AppShell } from "@/components/app-shell";
import { TestEntryForm } from "@/components/test-entry-form";
import { requireRole } from "@/lib/auth";
import { normalizeGradeValue } from "@/lib/lgs-curriculum";
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
    .select("id, source, grade")
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
        defaultGrade={normalizeGradeValue(profile.grade)}
        studentResources={
          (resourceRows ?? []) as { id: string; source: string; grade: string }[]
        }
      />
    </AppShell>
  );
}
