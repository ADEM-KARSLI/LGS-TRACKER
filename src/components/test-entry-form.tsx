"use client";

import { createTest, type TestFormState } from "@/app/actions/tests";
import {
  QuestionMatrix,
  QuestionMatrixSummary,
} from "@/components/question-matrix";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SUBJECT_LABELS } from "@/lib/lgs-curriculum";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

const initialState: TestFormState = {};

type TestTemplate = {
  id: string;
  source: string;
  grade: string;
  subject: string;
  topic: string;
  test_no: number;
  page_no: number;
  total_questions: number;
};

export function TestEntryForm({
  templates,
}: {
  templates: TestTemplate[];
}) {
  const [state, formAction, isPending] = useActionState(createTest, initialState);
  const [selectedSource, setSelectedSource] = useState(templates[0]?.source ?? "");
  const [pageNo, setPageNo] = useState("");
  const [wrongSet, setWrongSet] = useState<Set<number>>(new Set());

  const sourceOptions = useMemo(
    () =>
      Array.from(new Set(templates.map((template) => template.source))).map((source) => ({
        value: source,
        label: source,
      })),
    [templates]
  );

  const matchedTemplate = useMemo(
    () =>
      templates.find(
        (template) =>
          template.source === selectedSource &&
          template.page_no === Number.parseInt(pageNo, 10)
      ) ?? null,
    [pageNo, selectedSource, templates]
  );

  const totalQuestions = matchedTemplate?.total_questions ?? 1;
  const hasSelectableSources = sourceOptions.length > 0;
  const hasMatchedTemplate = matchedTemplate !== null;
  const visibleWrongSet = useMemo(() => {
    const next = new Set<number>();
    wrongSet.forEach((questionNumber) => {
      if (questionNumber <= totalQuestions) next.add(questionNumber);
    });
    return next;
  }, [totalQuestions, wrongSet]);

  const wrongQuestionsValue = [...visibleWrongSet].sort((a, b) => a - b).join(", ");

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="source" value={selectedSource} />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      )}

      {!hasSelectableSources && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Bu öğrenci için henüz test şablonu tanımlanmamış. Önce veli
          panelindeki `Kaynak Yönetimi` ekranından kayıt eklenmelidir.
        </p>
      )}

      {hasSelectableSources && !hasMatchedTemplate && pageNo.trim() !== "" && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Seçilen kaynak ve sayfa numarası için kayıtlı bir test bulunamadı.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Select
          label="Kaynak Adı"
          required
          value={selectedSource}
          onChange={(event) => setSelectedSource(event.target.value)}
          options={sourceOptions}
          disabled={!hasSelectableSources}
        />
        <Input
          name="page_no"
          label="Sayfa No"
          type="number"
          min={1}
          required
          value={pageNo}
          onChange={(event) => setPageNo(event.target.value)}
          disabled={!hasSelectableSources}
        />
        <Input
          label="Ders"
          value={
            matchedTemplate
              ? SUBJECT_LABELS[matchedTemplate.subject] ?? matchedTemplate.subject
              : ""
          }
          readOnly
          disabled
        />
        <Input label="Konu" value={matchedTemplate?.topic ?? ""} readOnly disabled />
        <Input
          label="Test No"
          value={matchedTemplate?.test_no.toString() ?? ""}
          readOnly
          disabled
        />
        <Input
          label="Toplam Soru"
          value={matchedTemplate?.total_questions.toString() ?? ""}
          readOnly
          disabled
        />
      </div>

      <QuestionMatrixSummary
        totalQuestions={totalQuestions}
        wrongCount={visibleWrongSet.size}
      />

      <QuestionMatrix
        totalQuestions={totalQuestions}
        value={visibleWrongSet}
        onChange={setWrongSet}
      />

      <input type="hidden" name="wrong_questions" value={wrongQuestionsValue} />

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isPending || !hasSelectableSources || !hasMatchedTemplate}
        >
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
