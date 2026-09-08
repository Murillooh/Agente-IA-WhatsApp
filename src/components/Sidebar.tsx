"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  FileText,
  Plug,
  Target,
  LogOut,
  UserCircle,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: Users },
    { href: "/meetings", label: "Reuniões", icon: CalendarClock },
    { href: "/scripts", label: "Scripts", icon: FileText },
    { href: "/settings/integrations", label: "Integrações", icon: Plug },
    { href: "/settings/profile", label: "Perfil", icon: UserCircle },
    ...(isAdmin ? [{ href: "/settings/admin", label: "Administração", icon: ShieldCheck }] : []),
  ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0b1220]">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
          <Target size={18} strokeWidth={2.25} />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            MeetCloser
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fechar reuniões, no automático
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              <Icon
                size={17}
                className={active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
        >
          <LogOut size={17} className="text-slate-400 dark:text-slate-500" />
          Sair
        </button>
      </div>
      <div className="border-t border-slate-200 p-4 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
        Objetivo geral:{" "}
        <span className="font-medium text-slate-600 dark:text-slate-300">fechar reuniões</span>
      </div>
    </aside>
  );
}
