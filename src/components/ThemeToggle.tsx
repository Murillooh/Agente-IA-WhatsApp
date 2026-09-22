"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Animação de troca de tema que expande um único círculo a partir do
 * ponto onde o usuário clicou.
 */
function revealFromPoint(x: number, y: number, onComplete?: () => void) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  
  // Calcula a distância máxima do clique até o canto mais distante da tela
  const maxRadius = Math.hypot(
    Math.max(x, vw - x),
    Math.max(y, vh - y)
  );

  const animation = document.documentElement.animate(
    [
      { clipPath: `circle(0px at ${x}px ${y}px)` },
      { clipPath: `circle(${maxRadius}px at ${x}px ${y}px)` },
    ],
    {
      duration: 1000,
      easing: "ease-in-out",
      pseudoElement: "::view-transition-new(root)",
    }
  );

  if (onComplete) animation.onfinish = onComplete;
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com uma classe do DOM que um script fora do React já aplicou; não dá pra saber isso no primeiro render (server não tem document).
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function applyRealTheme(next: boolean) {
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage indisponível (modo privado etc.) — só não persiste.
    }
  }

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next = !document.documentElement.classList.contains("dark");
    setIsDark(next);

    const startViewTransition = document.startViewTransition?.bind(document);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!startViewTransition || reducedMotion) {
      applyRealTheme(next);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;

    const transition = startViewTransition(() => applyRealTheme(next));
    transition.ready.then(() => revealFromPoint(x, y));
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
    >
      <Sun
        size={16}
        className={`absolute transition-all duration-300 ${
          isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        size={16}
        className={`absolute transition-all duration-300 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        }`}
      />
    </button>
  );
}
