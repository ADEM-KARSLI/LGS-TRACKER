"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/types/database";

type NavItem = { href: string; label: string; icon: string };

const studentNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/test/new", label: "Test Ekle", icon: "➕" },
  { href: "/pending", label: "Bekleyen", icon: "🟡" },
  { href: "/critical", label: "Kritik", icon: "🔴" },
  { href: "/analytics", label: "Analiz", icon: "📊" },
  { href: "/chat", label: "Chat", icon: "🤖" },
];

const parentNav: NavItem[] = [
  { href: "/parent", label: "Veli Paneli", icon: "🏠" },
  { href: "/parent/resources", label: "Kaynak Yönetimi", icon: "📚" },
  { href: "/parent/critical", label: "Kritik Sorular", icon: "🔴" },
];

export function AppNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const nav = role === "student" ? studentNav : parentNav;

  return (
    <nav className="mx-auto flex max-w-5xl flex-wrap gap-1 px-4 pb-3">
      {nav.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" &&
            item.href !== "/parent" &&
            pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <span className="mr-1">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
