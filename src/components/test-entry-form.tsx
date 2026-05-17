"use client";

import { createTest, type TestFormState } from "@/app/actions/tests";
import { QuestionMatrix, QuestionMatrixSummary } from "@/components/question-matrix";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getTopicsForSubject, LGS_SUBJECTS } from "@/lib/lgs-curriculum";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

const initialState: TestFormState = {};
const defaultSubject = LGS_SUBJECTS[0];
const defaultTopics = getTopicsForSubject(defaultSubject);
const CUSTOM_SOURCE_VALUE = "__custom__";

export function TestEntryForm({
  existingSources,
}: {
  existingSources: string[];
}) {
  const [state, formAction, isPending] = useActionState(createTest, initialState);
  const [subject, setSubject] = useState(defaultSubject);
  const [topic, setTopic] = useState(defaultTopics[0] ?? "");
  const [totalQuestions, setTotalQuestions] = useState(15);
  const [wrongSet, setWrongSet] = useState<Set<number>>(new Set());
  const [selectedSource, setSelectedSource] = useState(
    existingSources[0] ?? CUSTOM_SOURCE_VALUE
  );
  const [customSource, setCustomSource] = useState("");

  const topics = useMemo(() => getTopicsForSubject(subject), [subject]);
  const sourceOptions = useMemo(
    () => [
      ...existingSources.map((source) => ({ value: source, label: source })),
      { value: CUSTOM_SOURCE_VALUE, label: "Yeni kaynak ekle" },
    ],
    [existingSources]
  );
  const isCustomSource = selectedSource === CUSTOM_SOURCE_VALUE;

  function handleSubjectChange(nextSubject: string) {
    setSubject(nextSubject);
    const nextTopics = getTopicsForSubject(nextSubject);
    setTopic(nextTopics[0] ?? "");
  }

  function handleTotalChange(value: number) {
    const total = Math.max(1, value);
    setTotalQuestions(total);
    setWrongSet((prev) => {
      const next = new Set<number>();
      prev.forEach((n) => {
        if (n <= total) next.add(n);
      });
      return next;
    });
  }

  const wrongQuestionsValue = [...wrongSet].sort((a, b) => a - b).join(", ");

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="wrong_questions" value={wrongQuestionsValue} />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          name="subject"
          label="Ders"
          required
          value={subject}
          onChange={(e) => handleSubjectChange(e.target.value)}
          options={LGS_SUBJECTS.map((s) => ({ value: s, label: s }))}
        />
        <Select
          name="topic"
          label="Konu"
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          options={topics.map((t) => ({ value: t, label: t }))}
        />
        <Select
          name="source"
          label="Kaynak"
          required
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          options={sourceOptions}
        />
        {isCustomSource && (
          <Input
            name="custom_source"
            label="Yeni Kaynak"
            required
            value={customSource}
            onChange={(e) => setCustomSource(e.target.value)}
            placeholder="Örn: Karekök 8. Sınıf"
          />
        )}
        <Input name="test_no" label="Test No" type="number" min={1} required />
        <Input
          name="total_questions"
          label="Toplam Soru Sayısı"
          type="number"
          min={1}
          max={50}
          required
          value={totalQuestions}
          onChange={(e) => handleTotalChange(parseInt(e.target.value, 10) || 1)}
        />
      </div>

      <QuestionMatrixSummary
        totalQuestions={totalQuestions}
        wrongCount={wrongSet.size}
      />

      <QuestionMatrix
        totalQuestions={totalQuestions}
        value={wrongSet}
        onChange={setWrongSet}
      />

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Kaydediliyor..." : "Testi Kaydet"}
        </Button>
        <Link href="/dashboard">
          <Button type="button" variant="secondary">
            İptal
          </Button>
        </Link>
      </div>
    </form>
  );
}
