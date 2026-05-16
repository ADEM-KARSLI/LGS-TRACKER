import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <LoginForm />
    </div>
  );
}
