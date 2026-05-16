"use client";

import { submitQuestionReview } from "@/app/actions/questions";
import { Button } from "@/components/ui/button";
import type { ReviewOutcome } from "@/types/database";
import { useState, useTransition } from "react";

type QuestionReviewFlowProps = {
  questionId: string;
  questionNo: number;
};

export function QuestionReviewFlow({ questionId, questionNo }: QuestionReviewFlowProps) {
  const [outcome, setOutcome] = useState<ReviewOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function chooseOutcome(selected: ReviewOutcome) {
    setError(null);
    setOutcome(selected);
  }

  function submit() {
    setError(null);
    if (!outcome) {
      setError("Lütfen sonuçlardan birini seçin.");
      return;
    }

    startTransition(async () => {
      const result = await submitQuestionReview(questionId, outcome);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
      <p className="mb-3 font-medium text-slate-900 dark:text-white">Soru {questionNo}</p>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Konuya çalıştım, çözüm videosunu izledim ve sonuç olarak:
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <OutcomeButton
            active={outcome === "understood"}
            disabled={isPending}
            emoji="🟢"
            title="ANLADIM"
            desc="Benzer soru gelse çözebilirim"
            onClick={() => chooseOutcome("understood")}
          />
          <OutcomeButton
            active={outcome === "unsure"}
            disabled={isPending}
            emoji="🟡"
            title="EMİN DEĞİLİM"
            desc="Çözümü anladım ama tek başıma zorlanabilirim"
            onClick={() => chooseOutcome("unsure")}
          />
          <OutcomeButton
            active={outcome === "critical"}
            disabled={isPending}
            emoji="🔴"
            title="ANLAMADIM"
            desc="Hâlâ nasıl çözüldüğünü anlamadım"
            onClick={() => chooseOutcome("critical")}
          />
        </div>

        <Button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="mt-2 w-full"
        >
          Kaydet
        </Button>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}

function OutcomeButton({
  emoji,
  title,
  desc,
  active,
  disabled,
  onClick,
}: {
  emoji: string;
  title: string;
  desc: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-col items-start justify-center gap-1 rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
        active
          ? "border-amber-500 bg-amber-100 text-amber-900 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-200"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
      }`}
    >
      <span className="flex items-center gap-2">
        <span>{emoji}</span>
        {title}
      </span>
      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{desc}</span>
    </button>
  );
}
