"use client";

import { resolveParentQuestion } from "@/app/actions/questions";
import { Button } from "@/components/ui/button";
import type { QuestionGroup } from "@/types/database";
import { useTransition } from "react";

const PRIORITY_LABEL: Record<string, { label: string; className: string }> = {
  critical: {
    label: "🔴 Yüksek öncelik",
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  },
  unsure: {
    label: "🟡 Hafif kritik",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
};

export function ParentQuestionCard({
  group,
  studentName,
}: {
  group: QuestionGroup & { studentName?: string };
  studentName?: string;
}) {
  const { test, questions } = group;
  const [isPending, startTransition] = useTransition();

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <header className="mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
        <p className="font-semibold text-slate-900 dark:text-white">{test.subject}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">{test.topic}</p>
        <p className="mt-1 text-xs text-slate-500">
          {test.source} · Test #{test.test_no}
          {(studentName ?? group.studentName) ? ` · ${studentName ?? group.studentName}` : ""}
        </p>
      </header>

      <ul className="space-y-3">
        {questions.map((q) => {
          const priority = PRIORITY_LABEL[q.status] ?? PRIORITY_LABEL.critical;
          return (
            <li
              key={q.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-800/50"
            >
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  Soru {q.question_no}
                </span>
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${priority.className}`}
                >
                  {priority.label}
                </span>
              </div>
              <Button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await resolveParentQuestion(q.id);
                  })
                }
              >
                ✓ Kapat (çözüldü)
              </Button>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
