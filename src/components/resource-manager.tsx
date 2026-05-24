"use client";

import { useActionState, useState } from "react";
import {
  createResource,
  deleteResource,
  type ResourceFormState,
} from "@/app/actions/resources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SUBJECT_LABELS } from "@/lib/lgs-curriculum";

type Student = {
  id: string;
  name: string;
  email: string;
};

type ResourceRow = {
  id: string;
  parent_id: string;
  student_id: string;
  subject: string;
  topic: string;
  source: string;
  test_no: number;
  page_no: number;
  total_questions: number;
  created_at: string;
};

const initialState: ResourceFormState = {};

export function ResourceManager({
  students,
  resources,
}: {
  students: Student[];
  resources: ResourceRow[];
}) {
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id ?? "");
  const [selectedSubject, setSelectedSubject] = useState(
    Object.keys(SUBJECT_LABELS)[0] ?? ""
  );
  const [state, formAction, isPending] = useActionState(
    createResource,
    initialState
  );

  const subjectOptions = Object.keys(SUBJECT_LABELS).map((subject) => ({
    value: subject,
    label: SUBJECT_LABELS[subject] ?? subject,
  }));

  if (students.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        Bu veli hesabına bağlı öğrenci bulunamadı. Öğrenci hesaplarını
        `parent_student_relations` tablosuna ekledikten sonra test şablonu
        ekleyebilirsiniz.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
          Yeni Test Şablonu Ekle
        </h2>
        {state.error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            {state.success}
          </p>
        )}

        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Select
              name="student_id"
              label="Öğrenci"
              value={selectedStudent}
              onChange={(event) => setSelectedStudent(event.target.value)}
              options={students.map((student) => ({
                value: student.id,
                label: `${student.name} (${student.email})`,
              }))}
            />
            <Input
              name="source"
              label="Kaynak Adı"
              required
              placeholder="Örn: Karekök Matematik"
            />
            <Select
              name="subject"
              label="Ders"
              value={selectedSubject}
              onChange={(event) => setSelectedSubject(event.target.value)}
              options={subjectOptions}
            />
            <Input
              name="topic"
              label="Konu"
              required
              placeholder="Örn: Rasyonel Sayılar"
            />
            <Input name="test_no" label="Test No" type="number" min={1} required />
            <Input name="page_no" label="Sayfa No" type="number" min={1} required />
            <Input
              name="total_questions"
              label="Toplam Soru"
              type="number"
              min={1}
              required
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Ekleniyor..." : "Şablonu Kaydet"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
          Kayıtlı Test Şablonları
        </h2>
        {resources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Henüz kayıtlı test şablonu yok.
          </div>
        ) : (
          <div className="space-y-6">
            {students.map((student) => {
              const studentResources = resources.filter(
                (resource) => resource.student_id === student.id
              );
              if (studentResources.length === 0) return null;

              return (
                <div
                  key={student.id}
                  className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {student.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {student.email}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {studentResources.length} şablon
                    </span>
                  </div>
                  <div className="space-y-3">
                    {studentResources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                      >
                        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Kaynak
                            </p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {resource.source}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Ders
                            </p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {SUBJECT_LABELS[resource.subject] ?? resource.subject}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Konu
                            </p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {resource.topic}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Test No
                            </p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {resource.test_no}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Sayfa No
                            </p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {resource.page_no}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Toplam Soru
                            </p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {resource.total_questions}
                            </p>
                          </div>
                        </div>
                        <form action={deleteResource} className="text-right">
                          <input type="hidden" name="resource_id" value={resource.id} />
                          <Button type="submit" variant="secondary">
                            Sil
                          </Button>
                        </form>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Not
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Öğrenci test ekranında kaynak adı ve sayfa numarası seçer. Ders, konu,
          test no ve toplam soru bilgileri bu şablondan otomatik gelir.
        </p>
      </section>
    </div>
  );
}
