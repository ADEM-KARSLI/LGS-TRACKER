"use client";

import { createTest, type TestFormState } from "@/app/actions/tests";
import {
  QuestionMatrix,
  QuestionMatrixSummary,
} from "@/components/question-matrix";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  DEFAULT_GRADE,
  getTopicsForSubject,
  normalizeGradeValue,
  SUBJECT_LABELS,
} from "@/lib/lgs-curriculum";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

const initialState: TestFormState = {};
const GENERAL_TOPIC = "Genel / Karma Test";

type ResourceOption = {
  id: string;
  source: string;
  grade: string;
  subject: string;
};

type SourceOption = {
  value: string;
  label: string;
  source: string;
  grade: string;
  subject: string;
};

function topicOptions(topics: readonly string[]) {
  return [
    { value: GENERAL_TOPIC, label: GENERAL_TOPIC },
    ...topics.map((topic, index) => ({
      value: topic,
      label: `${index + 1}. ${topic}`,
    })),
  ];
}

export function TestEntryForm({
  defaultGrade,
  studentResources,
}: {
  defaultGrade: string;
  studentResources: ResourceOption[];
}) {
  const [state, formAction, isPending] = useActionState(createTest, initialState);
  const [totalQuestions, setTotalQuestions] = useState(15);
  const [wrongSet, setWrongSet] = useState<Set<number>>(new Set());

  const sourceOptions = useMemo<SourceOption[]>(() => {
    return studentResources.map((resource) => ({
      value: `resource:${resource.id}`,
      label: `${resource.source} · ${SUBJECT_LABELS[resource.subject] ?? resource.subject}`,
      source: resource.source,
      grade: normalizeGradeValue(resource.grade),
      subject: resource.subject,
    }));
  }, [studentResources]);

  const [selectedSource, setSelectedSource] = useState(
    sourceOptions[0]?.value ?? ""
  );

  const selectedSourceOption =
    sourceOptions.find((option) => option.value === selectedSource) ?? sourceOptions[0];
  const selectedGrade =
    selectedSourceOption?.grade ?? normalizeGradeValue(defaultGrade) ?? DEFAULT_GRADE;
  const resolvedSource = selectedSourceOption?.source ?? "";
  const resolvedSubject = selectedSourceOption?.subject ?? "";
  const hasSelectableSources = sourceOptions.length > 0;

  const [topic, setTopic] = useState(GENERAL_TOPIC);

  const topics = useMemo(
    () => getTopicsForSubject(selectedGrade, resolvedSubject),
    [selectedGrade, resolvedSubject]
  );

  function handleSourceChange(nextSource: string) {
    setSelectedSource(nextSource);
    setTopic(GENERAL_TOPIC);
  }

  function handleTopicChange(nextTopic: string) {
    setTopic(nextTopic);
  }

  function handleTotalChange(value: number) {
    const total = Math.max(1, value);
    setTotalQuestions(total);
    setWrongSet((prev) => {
      const next = new Set<number>();
      prev.forEach((questionNumber) => {
        if (questionNumber <= total) next.add(questionNumber);
      });
      return next;
    });
  }

  const wrongQuestionsValue = [...wrongSet].sort((a, b) => a - b).join(", ");

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="wrong_questions" value={wrongQuestionsValue} />
      <input type="hidden" name="source" value={resolvedSource} />
      <input type="hidden" name="subject" value={resolvedSubject} />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      )}

      {!hasSelectableSources && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Bu öğrenci için henüz kaynak tanımlanmamış. Önce veli panelindeki
          `Kaynak Yönetimi` ekranından kaynak eklenmelidir.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          name="source_display"
          label="Kaynak / Kitap"
          required
          value={selectedSource}
          onChange={(event) => handleSourceChange(event.target.value)}
          options={sourceOptions.map(({ value, label }) => ({ value, label }))}
          disabled={!hasSelectableSources}
        />
        <Select
          label="Ders"
          value={resolvedSubject}
          options={
            resolvedSubject
              ? [
                  {
                    value: resolvedSubject,
                    label: SUBJECT_LABELS[resolvedSubject] ?? resolvedSubject,
                  },
                ]
              : []
          }
          disabled={!hasSelectableSources}
        />
        <Select
          name="topic"
          label="Konu / Kapsam"
          required
          value={topic}
          onChange={(event) => handleTopicChange(event.target.value)}
          options={topicOptions(topics)}
          disabled={!hasSelectableSources}
        />
        <Input name="test_no" label="Test No" type="number" min={1} required />
        <Input name="page_no" label="Sayfa No" type="number" min={1} required />
        <Input
          name="total_questions"
          label="Toplam Soru"
          type="number"
          min={1}
          max={50}
          required
          value={totalQuestions}
          onChange={(event) =>
            handleTotalChange(parseInt(event.target.value, 10) || 1)
          }
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
        <Button type="submit" disabled={isPending || !hasSelectableSources}>
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
