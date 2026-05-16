import { AppNav } from "@/components/app-nav";
import { SignOutButton } from "@/components/sign-out-button";
import type { UserRole } from "@/types/database";

export function AppShell({
  children,
  role,
  title,
  userName,
}: {
  children: React.ReactNode;
  role: UserRole;
  title: string;
  userName: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
              LGS Hata Takip
            </p>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
            <p className="text-sm text-slate-500">Merhaba, {userName}</p>
          </div>
          <SignOutButton />
        </div>
        <AppNav role={role} />
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
