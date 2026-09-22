"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <aside
      className={clsx(
        "flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-[#0b1220]",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={clsx("flex items-center px-5 py-5 relative", isCollapsed ? "justify-center" : "gap-2.5")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
          <Target size={18} strokeWidth={2.25} />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              MeetCloser
            </p>
            <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">
              Fechar reuniões, no automático
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 mt-2 overflow-hidden">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={isCollapsed ? label : undefined}
              className={clsx(
                "flex items-center rounded-lg py-2 font-medium transition-colors",
                isCollapsed ? "justify-center px-0" : "gap-3 px-3 text-sm",
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              <Icon
                size={17}
                className={clsx(
                  "shrink-0",
                  active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                )}
              />
              {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          onClick={logout}
          title={isCollapsed ? "Sair" : undefined}
          className={clsx(
            "flex w-full items-center rounded-lg py-2 font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400",
            isCollapsed ? "justify-center px-0" : "gap-3 px-3 text-sm"
          )}
        >
          <LogOut size={17} className="shrink-0 text-slate-400 dark:text-slate-500" />
          {!isCollapsed && <span className="whitespace-nowrap">Sair</span>}
        </button>
      </div>
      
      {/* Toggle button */}
      <div className="border-t border-slate-200 p-3 flex justify-center dark:border-slate-800">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-8 w-full items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          title={isCollapsed ? "Expandir" : "Recolher"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
