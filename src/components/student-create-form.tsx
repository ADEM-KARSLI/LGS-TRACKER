"use client";

import { createStudent, type StudentFormState } from "@/app/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";

const initialState: StudentFormState = {};

export function StudentCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createStudent,
    initialState
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Öğrenci Ekle
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Öğrenci kullanıcı adıyla giriş yapar; sistem Supabase Auth için fake
          emaili otomatik üretir.
        </p>
      </div>

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

      <form action={formAction} className="grid gap-4 sm:grid-cols-2">
        <Input name="name" label="Öğrenci adı" required autoComplete="off" />
        <Input name="grade" label="Sınıf" required placeholder="Örn: 8" />
        <Input
          name="username"
          label="Kullanıcı adı"
          required
          autoCapitalize="none"
          autoComplete="username"
          placeholder="elif123"
        />
        <Input
          name="password"
          label="Şifre"
          type="password"
          minLength={6}
          required
          autoComplete="new-password"
        />
        <div className="sm:col-span-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Oluşturuluyor..." : "Öğrenciyi Kaydet"}
          </Button>
        </div>
      </form>
    </section>
  );
}
