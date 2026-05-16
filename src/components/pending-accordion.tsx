"use client";

import { Fragment, useState } from "react";
import { QuestionReviewFlow } from "@/components/question-review-flow";
import type { PendingTree } from "@/types/database";

type PendingQuestionRow = {
  id: string;
  subject: string;
  topic: string;
  testNo: number;
  source: string;
  questionNo: number;
  questionId: string;
};

export function PendingAccordion({ tree }: { tree: PendingTree }) {
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);

  const rows: PendingQuestionRow[] = tree.subjects.flatMap((subjectNode) =>
    subjectNode.topics.flatMap((topicNode) =>
      topicNode.tests.flatMap((testNode) =>
        testNode.questions.map((question) => ({
          id: `${question.id}-${subjectNode.subject}-${topicNode.topic}`,
          subject: subjectNode.subject,
          topic: topicNode.topic,
          testNo: testNode.test.test_no,
          source: `${testNode.test.source} · Test ${testNode.test.test_no}`,
          questionNo: question.question_no,
          questionId: question.id,
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
            <th className="px-4 py-3 font-semibold">Güncelle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-950">
          {rows.map((row) => (
            <Fragment key={row.id}>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900">
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
                <td className="px-4 py-4 text-slate-800 dark:text-slate-100">
                  {row.questionNo}
                </td>
                <td className="px-4 py-4 text-slate-800 dark:text-slate-100">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => setOpenQuestionId(openQuestionId === row.questionId ? null : row.questionId)}
                  >
                    Güncelle
                  </button>
                </td>
              </tr>
              {openQuestionId === row.questionId && (
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <td colSpan={5} className="px-4 py-4">
                    <QuestionReviewFlow questionId={row.questionId} questionNo={row.questionNo} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
