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
  Menu,
  X,
} from "lucide-react";
import clsx from "clsx";

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: Users },
    { href: "/meetings", label: "ReuniÃµes", icon: CalendarClock },
    { href: "/scripts", label: "Scripts", icon: FileText },
    { href: "/settings/integrations", label: "IntegraÃ§Ãµes", icon: Plug },
    { href: "/settings/profile", label: "Perfil", icon: UserCircle },
    ...(isAdmin ? [{ href: "/settings/admin", label: "AdministraÃ§Ã£o", icon: ShieldCheck }] : []),
  ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center gap-3 bg-white dark:bg-[#0b1220] border-b border-slate-200 dark:border-slate-800 px-4 py-3 shrink-0">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-1 -ml-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 bg-white overflow-hidden p-1">
            <img src="/logo-icon.png" alt="Munago Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white tracking-tight">Munago</span>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-[#0b1220] md:static md:translate-x-0",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full",
          !isMobileOpen && isCollapsed ? "md:w-16" : "md:w-64"
        )}
      >
      <div className={clsx("flex items-center px-5 py-5 relative", isCollapsed ? "justify-center" : "gap-2.5")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
          <Target size={18} strokeWidth={2.25} />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Munago
            </p>
            <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">Automações de prospecção</p>
          </div>
        )}
      </div>

      {/* Toggle button - only desktop */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3 top-7 h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors z-10"
        title={isCollapsed ? "Expandir" : "Recolher"}
      >
        {isCollapsed ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
      </button>

      <nav className="flex-1 space-y-1 px-3 mt-2 overflow-hidden">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed && !isMobileOpen ? label : undefined}
              className={clsx(
                "flex items-center rounded-lg py-2 font-medium transition-colors",
                isCollapsed && !isMobileOpen ? "md:justify-center px-0" : "gap-3 px-3 text-sm",
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
              {(!isCollapsed || isMobileOpen) && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          onClick={logout}
          title={isCollapsed && !isMobileOpen ? "Sair" : undefined}
          className={clsx(
            "flex w-full items-center rounded-lg py-2 font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400",
            isCollapsed && !isMobileOpen ? "md:justify-center px-0" : "gap-3 px-3 text-sm"
          )}
        >
          <LogOut size={17} className="shrink-0 text-slate-400 dark:text-slate-500" />
          {(!isCollapsed || isMobileOpen) && <span className="whitespace-nowrap">Sair</span>}
        </button>
      </div>
    </aside>
    </>
  );
}

