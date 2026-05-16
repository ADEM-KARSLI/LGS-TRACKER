"use client";

import type { PendingTree, WeakQuestion } from "@/types/database";

type CriticalQuestionRow = {
  id: string;
  subject: string;
  topic: string;
  testNo: number;
  source: string;
  questionNo: number;
  status: WeakQuestion["status"];
};

export function CriticalAccordion({ tree }: { tree: PendingTree }) {
  const rows: CriticalQuestionRow[] = tree.subjects.flatMap((subjectNode) =>
    subjectNode.topics.flatMap((topicNode) =>
      topicNode.tests.flatMap((testNode) =>
        testNode.questions.map((question) => ({
          id: question.id,
          subject: subjectNode.subject,
          topic: topicNode.topic,
          testNo: testNode.test.test_no,
          source: `${testNode.test.source} · Test ${testNode.test.test_no}`,
          questionNo: question.question_no,
          status: question.status,
        }))
      )
    )
  );

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <tr>
            <th className="px-4 py-3 font-semibold">Ders (Kaynak)</th>
            <th className="px-4 py-3 font-semibold">Konu (Test No)</th>
            <th className="px-4 py-3 font-semibold">Soru No</th>
            <th className="px-4 py-3 font-semibold">Kritik</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-950">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
              <td className="px-4 py-4 text-slate-800 dark:text-slate-100">
                <div className="font-medium">{row.subject}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {row.source}
                </div>
              </td>
              <td className="px-4 py-4 text-slate-800 dark:text-slate-100">
                <div className="font-medium">{row.topic}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Test {row.testNo}
                </div>
              </td>
              <td className="px-4 py-4 text-slate-800 dark:text-slate-100">{row.questionNo}</td>
              <td className="px-4 py-4 text-slate-800 dark:text-slate-100">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    row.status === "unsure"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                      : "bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-200"
                  }`}
                >
                  {row.status === "unsure" ? "Hafif kritik" : "Kritik"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

