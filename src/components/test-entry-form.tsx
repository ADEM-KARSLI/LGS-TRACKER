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
  getSubjectsForGrade,
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
};

type SourceOption = {
  value: string;
  label: string;
  source: string;
  grade: string;
};

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

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
  existingSources,
  defaultGrade,
  studentResources,
}: {
  existingSources: string[];
  defaultGrade: string;
  studentResources: ResourceOption[];
}) {
  const [state, formAction, isPending] = useActionState(createTest, initialState);
  const [totalQuestions, setTotalQuestions] = useState(15);
  const [wrongSet, setWrongSet] = useState<Set<number>>(new Set());

  const normalizedDefaultGrade = normalizeGradeValue(defaultGrade);
  const hasResources = studentResources.length > 0;

  const sourceOptions = useMemo<SourceOption[]>(() => {
    if (hasResources) {
      return studentResources.map((resource) => ({
        value: `resource:${resource.id}`,
        label: resource.source,
        source: resource.source,
        grade: normalizeGradeValue(resource.grade),
      }));
    }

    return [
      ...uniqueValues(existingSources).map((source) => ({
        value: source,
        label: source,
        source,
        grade: normalizedDefaultGrade,
      })),
    ];
  }, [existingSources, hasResources, normalizedDefaultGrade, studentResources]);

  const [selectedSource, setSelectedSource] = useState(
    sourceOptions[0]?.value ?? ""
  );

  const selectedSourceOption =
    sourceOptions.find((option) => option.value === selectedSource) ?? sourceOptions[0];
  const selectedGrade = selectedSourceOption?.grade ?? DEFAULT_GRADE;
  const resolvedSource = selectedSourceOption?.source ?? "";
  const hasSelectableSources = sourceOptions.length > 0;

  const subjectOptions = useMemo(
    () =>
      getSubjectsForGrade(selectedGrade).map((subject) => ({
        value: subject,
        label: SUBJECT_LABELS[subject] ?? subject,
      })),
    [selectedGrade]
  );

  const [subject, setSubject] = useState(subjectOptions[0]?.value ?? "");
  const [topic, setTopic] = useState(GENERAL_TOPIC);
  const selectedSubject =
    subjectOptions.find((option) => option.value === subject)?.value ??
    subjectOptions[0]?.value ??
    "";

  const topics = useMemo(
    () => getTopicsForSubject(selectedGrade, selectedSubject),
    [selectedGrade, selectedSubject]
  );

  function handleSourceChange(nextSource: string) {
    setSelectedSource(nextSource);
    const nextOption =
      sourceOptions.find((option) => option.value === nextSource) ?? sourceOptions[0];
    const nextGrade = nextOption?.grade ?? normalizedDefaultGrade;
    const nextSubject = getSubjectsForGrade(nextGrade)[0] ?? "";
    setSubject(nextSubject);
    setTopic(GENERAL_TOPIC);
  }

  function handleSubjectChange(nextSubject: string) {
    setSubject(nextSubject);
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
          name="subject"
          label="Ders"
          required
          value={selectedSubject}
          onChange={(event) => handleSubjectChange(event.target.value)}
          options={subjectOptions}
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
