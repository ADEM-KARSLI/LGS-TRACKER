"use client";

import { signIn, signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useState, useTransition } from "react";

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          LGS Tracker
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {mode === "login"
            ? "Hesabınıza giriş yapın"
            : "Öğrenci veya veli hesabı oluşturun"}
        </p>
      </div>

      <div className="mb-4 flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        <TabButton active={mode === "login"} onClick={() => setMode("login")}>
          Giriş
        </TabButton>
        <TabButton active={mode === "signup"} onClick={() => setMode("signup")}>
          Kayıt
        </TabButton>
      </div>

      {message && (
        <p
          className={`mb-4 rounded-lg px-3 py-2 text-sm ${
            isError
              ? "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
              : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
          }`}
        >
          {message}
        </p>
      )}

      <form
        action={(formData) => {
          setMessage(null);
          startTransition(async () => {
            if (mode === "login") {
              const result = await signIn(formData);
              if (result?.error) {
                setIsError(true);
                setMessage(result.error);
              }
            } else {
              const result = await signUp(formData);
              if (result?.error) {
                setIsError(true);
                setMessage(result.error);
              }
              if (result?.success) {
                setIsError(false);
                setMessage(result.success);
              }
            }
          });
        }}
        className="space-y-4"
      >
        {mode === "signup" && (
          <>
            <Input name="name" label="Ad Soyad" required autoComplete="name" />
            <Select
              name="role"
              label="Rol"
              defaultValue="student"
              options={[
                { value: "student", label: "Öğrenci" },
                { value: "parent", label: "Veli" },
              ]}
            />
          </>
        )}
        <Input
          name="email"
          label="E-posta"
          type="email"
          required
          autoComplete="email"
        />
        <Input
          name="password"
          label="Şifre"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Bekleyin…" : mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
        </Button>
      </form>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
        active
          ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white"
          : "text-slate-600 dark:text-slate-400"
      }`}
    >
      {children}
    </button>
  );
}
