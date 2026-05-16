"use client";

import { useMemo } from "react";

const COLS = 5;

type QuestionMatrixProps = {
  totalQuestions: number;
  value: Set<number>;
  onChange: (wrong: Set<number>) => void;
};

export function QuestionMatrix({
  totalQuestions,
  value,
  onChange,
}: QuestionMatrixProps) {
  const grid = useMemo(() => {
    const items: number[] = [];
    for (let i = 1; i <= totalQuestions; i++) items.push(i);
    return items;
  }, [totalQuestions]);

  function toggle(n: number) {
    const next = new Set(value);
    if (next.has(n)) next.delete(n);
    else next.add(n);
    onChange(next);
  }

  return (
    <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="space-y-1">
        <h2 className="font-medium text-slate-900 dark:text-white">Soru Matrisi</h2>
        <p className="text-sm text-slate-500">
          Varsayılan 🟢 doğru — dokunarak 🔴 çözülemeyen işaretle, tekrar dokunarak geri al.
        </p>
      </div>

      <div
        className="mt-4 grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.min(COLS, totalQuestions)}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((n) => {
          const isWrong = value.has(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => toggle(n)}
              className={`flex h-11 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                isWrong
                  ? "border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
                  : "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
              }`}
              aria-pressed={isWrong}
              aria-label={`Soru ${n}, ${isWrong ? "çözülemedi" : "doğru"}`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function QuestionMatrixSummary({
  totalQuestions,
  wrongCount,
}: {
  totalQuestions: number;
  wrongCount: number;
}) {
  const correctCount = totalQuestions - wrongCount;
  return (
    <div className="flex flex-wrap gap-4 rounded-lg bg-slate-100 px-4 py-3 text-sm dark:bg-slate-800">
      <span>
        Toplam: <strong>{totalQuestions}</strong>
      </span>
      <span className="text-emerald-700 dark:text-emerald-300">
        🟢 Doğru: <strong>{correctCount}</strong>
      </span>
      <span className="text-red-700 dark:text-red-300">
        🔴 Çözülemeyen: <strong>{wrongCount}</strong>
      </span>
    </div>
  );
}
