"use client";

import { createTest, type TestFormState } from "@/app/actions/tests";
import { QuestionMatrix, QuestionMatrixSummary } from "@/components/question-matrix";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  getTopicsForSubject,
  LGS_SUBJECTS,
  SUBJECT_LABELS,
} from "@/lib/lgs-curriculum";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

const initialState: TestFormState = {};
const CUSTOM_SOURCE_VALUE = "__custom__";
const GENERAL_TOPIC = "Genel / Karma Test";

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
  studentResources,
}: {
  existingSources: string[];
  studentResources: { source: string }[];
}) {
  const [state, formAction, isPending] = useActionState(createTest, initialState);
  const [totalQuestions, setTotalQuestions] = useState(15);
  const [wrongSet, setWrongSet] = useState<Set<number>>(new Set());

  const hasResources = studentResources.length > 0;
  const initialSource = hasResources
    ? studentResources[0]?.source ?? ""
    : existingSources[0] ?? CUSTOM_SOURCE_VALUE;
  const initialSubject = LGS_SUBJECTS[0];
  const initialTopic = GENERAL_TOPIC;

  const [selectedSource, setSelectedSource] = useState(initialSource);
  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState(initialTopic);
  const [customSource, setCustomSource] = useState("");

  const allResourceSources = useMemo(
    () => uniqueValues(studentResources.map((resource) => resource.source)),
    [studentResources]
  );

  const sourceOptions = useMemo(() => {
    if (hasResources) {
      return allResourceSources.map((source) => ({ value: source, label: source }));
    }
    return [
      ...existingSources.map((source) => ({ value: source, label: source })),
      { value: CUSTOM_SOURCE_VALUE, label: "Yeni kaynak gir" },
    ];
  }, [allResourceSources, existingSources, hasResources]);

  const topics = useMemo(() => getTopicsForSubject(subject), [subject]);

  const subjectOptions = useMemo(
    () =>
      LGS_SUBJECTS.map((subject) => ({
        value: subject,
        label: SUBJECT_LABELS[subject] ?? subject,
      })),
    []
  );

  const isCustomSource = selectedSource === CUSTOM_SOURCE_VALUE;

  function handleSourceChange(nextSource: string) {
    setSelectedSource(nextSource);
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
          name="source"
          label="Kaynak / Kitap"
          required
          value={selectedSource}
          onChange={(e) => handleSourceChange(e.target.value)}
          options={sourceOptions}
        />
        <Select
          name="subject"
          label="Ders"
          required
          value={subject}
          onChange={(e) => handleSubjectChange(e.target.value)}
          options={subjectOptions}
        />
        <Select
          name="topic"
          label="Konu / Kapsam"
          required
          value={topic}
          onChange={(e) => handleTopicChange(e.target.value)}
          options={topicOptions(topics)}
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
          label="Toplam Soru"
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
