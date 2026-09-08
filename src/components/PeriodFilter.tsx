"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import clsx from "clsx";

const PRESETS = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function PeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  // "ativo" é aproximado pelo preset cujo "from" bate com o que tá na URL
  // hoje — não precisa ser exato, é só destaque visual.
  const activeDays = from
    ? PRESETS.find((p) => isoDaysAgo(p.days) === from)?.days
    : undefined;

  function apply(days: number | null) {
    if (days === null) {
      router.push(pathname);
      return;
    }
    const params = new URLSearchParams();
    params.set("from", isoDaysAgo(days));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1.5">
      {PRESETS.map((p) => (
        <button
          key={p.days}
          onClick={() => apply(p.days)}
          className={clsx(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            activeDays === p.days
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          )}
        >
          {p.label}
        </button>
      ))}
      <button
        onClick={() => apply(null)}
        className={clsx(
          "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
          !from
            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        )}
      >
        Tudo
      </button>
    </div>
  );
}
