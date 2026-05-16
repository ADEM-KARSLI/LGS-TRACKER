import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { WeakQuestionStatus } from "@/types/database";

interface SubjectStats {
  subject: string;
  tests: number;
  pending: number;
  unsure: number;
  critical: number;
  understood: number;
}

function scoreSubject(stats: SubjectStats) {
  return stats.pending * 1 + stats.unsure * 2 + stats.critical * 3;
}

function composeResponse(subjects: SubjectStats[]) {
  if (subjects.length === 0) {
    return "Henüz test veya zayıf soru verin yok. Önce test ekleyip birkaç soru işaretleyin, sonra hangi derse çalışmanız gerektiğini daha iyi öneririm.";
  }

  const worst = [...subjects].sort((a, b) => {
    const scoreDiff = scoreSubject(b) - scoreSubject(a);
    if (scoreDiff !== 0) return scoreDiff;
    return b.tests - a.tests;
  })[0];

  const best = [...subjects].sort((a, b) => {
    const scoreDiff = scoreSubject(a) - scoreSubject(b);
    if (scoreDiff !== 0) return scoreDiff;
    return b.tests - a.tests;
  })[0];

  const worstScore = scoreSubject(worst);
  const bestScore = scoreSubject(best);

  const worstDetails = [];
  if (worst.pending) worstDetails.push(`${worst.pending} bekleyen`);
  if (worst.unsure) worstDetails.push(`${worst.unsure} emin değilim`);
  if (worst.critical) worstDetails.push(`${worst.critical} kritik`);
  const worstSummary = worstDetails.length > 0 ? `Bu derste ${worstDetails.join(", ")} soru var.` : "Bu derste şu anda belirgin bir zayıflık görünmüyor.";

  const bestDetails = [];
  if (best.tests) bestDetails.push(`${best.tests} test`);
  if (best.understood) bestDetails.push(`${best.understood} anlaşılan soru`);
  const bestSummary = bestDetails.length > 0 ? `Bu derste ${bestDetails.join(", ")} var.` : "Bu derste henüz veri yok ama genel olarak başarılı görünüyorsun.";

  const studyAdvice = worstScore > 0
    ? `Öncelikle çalışma programına ${worst.subject} dersini al. ${worstSummary} Bu derse tekrar ağırlık verip önce kolay, sonra orta zorlukta sorular çöz.`
    : `Şu anda açık bir zayıf ders görünmüyor. Veri arttıkça hangi derse çalışman gerektiğini daha kesin söyleyebilirim.`;

  const positiveAdvice = bestScore === 0
    ? `Tebrikler! ${best.subject} dersinde güçlü görünüyorsun. Bu başarıyı korumak için düzenli tekrar ve zaman zaman yeni soru çözmeye devam et.`
    : `En güçlü olduğun ders ise ${best.subject}. ${bestSummary} Bu dersin üzerinde çalışırken motivasyonunu yüksek tut; doğru yaptığın noktaları pekiştirmek için tekrar et.`;

  return `${studyAdvice} ${positiveAdvice}`;
}

export async function POST(request: Request) {
  const profile = await getCurrentUser();
  if (!profile) {
    return NextResponse.json({ error: "Giriş yapmış bir öğrenci olmanız gerekiyor." }, { status: 401 });
  }

  const body = await request.json();
  const message = String(body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "Lütfen bir soru yazın." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: tests } = await supabase
    .from("test_records")
    .select("id, subject")
    .eq("student_id", profile.id);

  const testIds = (tests ?? []).map((test) => test.id);

  if (testIds.length === 0) {
    return NextResponse.json({ answer: "Henüz test verisi yok. Önce `Test Ekle` bölümünden birkaç test ekleyin." });
  }

  const { data: weakRows, error: weakError } = await supabase
    .from("weak_questions")
    .select("status, test_id, test_records!inner(subject)")
    .in("test_id", testIds);

  if (weakError) {
    return NextResponse.json({ error: weakError.message }, { status: 500 });
  }

  const subjects = new Map<string, SubjectStats>();
  for (const test of tests ?? []) {
    const existing = subjects.get(test.subject);
    subjects.set(test.subject, {
      subject: test.subject,
      tests: (existing?.tests ?? 0) + 1,
      pending: existing?.pending ?? 0,
      unsure: existing?.unsure ?? 0,
      critical: existing?.critical ?? 0,
      understood: existing?.understood ?? 0,
    });
  }

  for (const row of (weakRows ?? []) as unknown as Array<{ status: WeakQuestionStatus; test_records: { subject: string } }>) {
    const subject = row.test_records.subject;
    const existing = subjects.get(subject);
    if (!existing) continue;
    if (row.status === "pending") existing.pending += 1;
    if (row.status === "unsure") existing.unsure += 1;
    if (row.status === "critical") existing.critical += 1;
    if (row.status === "understood") existing.understood += 1;
  }

  const subjectStats = Array.from(subjects.values());
  const answer = composeResponse(subjectStats);
  return NextResponse.json({ answer });
}
