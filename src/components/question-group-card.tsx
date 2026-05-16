"use client";

import type { QuestionGroup } from "@/types/database";

type QuestionGroupCardProps = {
  group: QuestionGroup;
  mode: "critical";
  priority?: "high" | "light";
};

export function QuestionGroupCard({ group, mode, priority }: QuestionGroupCardProps) {
  const { test, questions } = group;

  const badge =
    priority === "light"
      ? "🟡 Veli incelemesi (hafif kritik)"
      : "🔴 Veli onayı bekleniyor (yüksek öncelik)";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <header className="mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
        <p className="font-semibold text-slate-900 dark:text-white">{test.subject}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">{test.topic}</p>
        <p className="mt-1 text-xs text-slate-500">
          {test.source} · Test #{test.test_no}
        </p>
      </header>

      <ul className="space-y-2">
        {questions.map((q) => (
          <li
            key={q.id}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/50"
          >
            <span className="font-medium">Soru {q.question_no}</span>
            {mode === "critical" && (
              <span className="text-xs text-slate-500">{badge}</span>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}
