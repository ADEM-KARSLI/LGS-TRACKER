import { AppShell } from "@/components/app-shell";
import { TestEntryForm } from "@/components/test-entry-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function NewTestPage() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: templateRows } = await supabase
    .from("test_templates")
    .select("id, source, grade, subject, topic, test_no, page_no, total_questions")
    .eq("student_id", profile.id)
    .order("source", { ascending: true })
    .order("page_no", { ascending: true });

  return (
    <AppShell role="student" title="Yeni Test" userName={profile.name}>
      <p className="mb-6 text-slate-600 dark:text-slate-400">
        Kaynak adı ve sayfa numarasını seçin. Ders, konu, test no ve toplam soru
        bilgileri otomatik gelecektir.
      </p>
      <TestEntryForm
        templates={
          (templateRows ?? []) as {
            id: string;
            source: string;
            grade: string;
            subject: string;
            topic: string;
            test_no: number;
            page_no: number;
            total_questions: number;
          }[]
        }
      />
    </AppShell>
  );
}
