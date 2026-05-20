"use client";

import { createTest, type TestFormState } from "@/app/actions/tests";
import { QuestionMatrix, QuestionMatrixSummary } from "@/components/question-matrix";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getTopicsForSubject, LGS_SUBJECTS } from "@/lib/lgs-curriculum";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";

const initialState: TestFormState = {};
const CUSTOM_SOURCE_VALUE = "__custom__";

export function TestEntryForm({
  existingSources,
  studentResources,
}: {
  existingSources: string[];
  studentResources: { subject: string; topic: string; source: string }[];
}) {
  const [state, formAction, isPending] = useActionState(createTest, initialState);
  const [totalQuestions, setTotalQuestions] = useState(15);
  const [wrongSet, setWrongSet] = useState<Set<number>>(new Set());
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [customSource, setCustomSource] = useState("");

  const hasResources = studentResources.length > 0;

  const resourceSubjects = useMemo(
    () => Array.from(new Set(studentResources.map((resource) => resource.subject))),
    [studentResources]
  );

  const resourceTopics = useMemo(
    () =>
      Array.from(
        new Set(
          studentResources
            .filter((resource) => resource.subject === subject)
            .map((resource) => resource.topic)
        )
      ),
    [studentResources, subject]
  );

  const resourceSources = useMemo(
    () =>
      Array.from(
        new Set(
          studentResources
            .filter(
              (resource) =>
                resource.subject === subject && resource.topic === topic
            )
            .map((resource) => resource.source)
        )
      ),
    [studentResources, subject, topic]
  );

  const sourceOptions = useMemo(() => {
    if (hasResources) {
      return resourceSources.map((source) => ({ value: source, label: source }));
    }
    return existingSources.map((source) => ({ value: source, label: source }));
  }, [existingSources, hasResources, resourceSources]);

  const topics = useMemo(
    () => (hasResources ? resourceTopics : getTopicsForSubject(subject)),
    [hasResources, resourceTopics, subject]
  );

  const subjectOptions = useMemo(
    () =>
      hasResources
        ? resourceSubjects.map((subject) => ({ value: subject, label: subject }))
        : LGS_SUBJECTS.map((subject) => ({ value: subject, label: subject })),
    [hasResources, resourceSubjects]
  );

  const isCustomSource = false;

  useEffect(() => {
    if (hasResources) {
      setSubject(resourceSubjects[0] ?? "");
    } else {
      setSubject(LGS_SUBJECTS[0]);
    }
  }, [hasResources, resourceSubjects]);

  useEffect(() => {
    if (hasResources) {
      setTopic(resourceTopics[0] ?? "");
    } else {
      setTopic(getTopicsForSubject(subject)[0] ?? "");
    }
  }, [hasResources, resourceTopics, subject]);

  useEffect(() => {
    if (hasResources) {
      setSelectedSource(resourceSources[0] ?? "");
    } else {
      setSelectedSource(existingSources[0] ?? CUSTOM_SOURCE_VALUE);
    }
  }, [hasResources, existingSources, resourceSources]);

  function handleSubjectChange(nextSubject: string) {
    setSubject(nextSubject);
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
          label="Kaynak"
          required
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
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
          label="Konu"
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          options={topics.map((topic) => ({ value: topic, label: topic }))}
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
