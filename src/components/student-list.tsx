"use client";

import {
  deleteStudent,
  updateStudent,
  type StudentFormState,
} from "@/app/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/types/database";
import { useActionState } from "react";

const initialState: StudentFormState = {};

function studentUsername(student: User) {
  return student.username ?? student.email.split("@")[0] ?? "";
}

function StudentEditForm({ student }: { student: User }) {
  const [state, formAction, isPending] = useActionState(
    updateStudent,
    initialState
  );

  return (
    <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
      <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200">
        Düzenle
      </summary>

      {state.error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          {state.success}
        </p>
      )}

      <form action={formAction} className="mt-4 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="student_id" value={student.id} />
        <Input
          name="name"
          label="Öğrenci adı"
          required
          defaultValue={student.name}
          autoComplete="off"
        />
        <Input
          name="grade"
          label="Sınıf"
          required
          defaultValue={student.grade ?? ""}
          placeholder="Örn: 8"
        />
        <Input
          name="username"
          label="Kullanıcı adı"
          required
          defaultValue={studentUsername(student)}
          autoCapitalize="none"
          autoComplete="username"
        />
        <Input
          name="password"
          label="Yeni şifre"
          type="password"
          minLength={6}
          placeholder="Değişmeyecekse boş bırakın"
          autoComplete="new-password"
        />
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>
    </details>
  );
}

export function StudentList({ students }: { students: User[] }) {
  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
        <p className="font-medium text-slate-800 dark:text-slate-100">
          Henüz öğrenci bağlantısı yok
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Yukarıdaki formdan ilk öğrenci hesabını oluşturabilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {students.map((student) => (
        <li
          key={student.id}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-slate-500">
                @{studentUsername(student)}
                {student.grade ? ` · ${student.grade}. sınıf` : ""}
              </p>
            </div>
            <form action={deleteStudent}>
              <input type="hidden" name="student_id" value={student.id} />
              <Button type="submit" variant="secondary">
                Sil
              </Button>
            </form>
          </div>
          <StudentEditForm student={student} />
        </li>
      ))}
    </ul>
  );
}
