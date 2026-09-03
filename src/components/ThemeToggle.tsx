"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

// Cores translúcidas dos "pingos" — mesma paleta indigo/violeta da marca
// (logo da sidebar), só que com alpha, pra dar o efeito de vidro.
const DROP_COLORS = [
  "rgba(99, 102, 241, 0.55)", // indigo-500
  "rgba(139, 92, 246, 0.5)", // violet-500
  "rgba(129, 140, 248, 0.45)", // indigo-400
  "rgba(196, 181, 253, 0.4)", // violet-300
];

const CELL = 110; // px por célula da grade — controla quantos pingos nascem
const DROP_DURATION = 900; // ms, animação de cada pingo individual
const SPEED = 0.6; // ms de atraso por pixel de distância até o clique (onda)

/**
 * Espalha vários "pingos" translúcidos a partir de (originX, originY) até
 * cobrirem a tela inteira, em onda (mais longe do clique = aparece mais
 * tarde). Puro DOM/WAAPI — não usa React pra isso, é só um efeito visual
 * de curta duração que se remove sozinho no final.
 */
function spawnDrops(originX: number, originY: number) {
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:9999;pointer-events:none;overflow:hidden;";
  document.body.appendChild(overlay);

  const cols = Math.ceil(window.innerWidth / CELL) + 1;
  const rows = Math.ceil(window.innerHeight / CELL) + 1;
  const diameter = CELL * 1.9; // maior que a célula: garante sobreposição, sem buraco

  const fragment = document.createDocumentFragment();
  let maxDelay = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const jitterX = (Math.random() - 0.5) * CELL * 0.6;
      const jitterY = (Math.random() - 0.5) * CELL * 0.6;
      const x = col * CELL + CELL / 2 + jitterX;
      const y = row * CELL + CELL / 2 + jitterY;
      const delay = Math.hypot(x - originX, y - originY) * SPEED;
      maxDelay = Math.max(maxDelay, delay);

      const drop = document.createElement("div");
      const color = DROP_COLORS[Math.floor(Math.random() * DROP_COLORS.length)];
      drop.style.cssText = `position:absolute;left:${x - diameter / 2}px;top:${
        y - diameter / 2
      }px;width:${diameter}px;height:${diameter}px;border-radius:9999px;background:${color};backdrop-filter:blur(2px);transform:scale(0);opacity:0;`;
      fragment.appendChild(drop);

      drop.animate(
        [
          { transform: "scale(0)", opacity: 0 },
          { transform: "scale(1)", opacity: 0.85, offset: 0.35 },
          { transform: "scale(1.05)", opacity: 0.85, offset: 0.7 },
          { transform: "scale(1.05)", opacity: 0, offset: 1 },
        ],
        { duration: DROP_DURATION, delay, easing: "ease-out", fill: "forwards" }
      );
    }
  }

  overlay.appendChild(fragment);
  window.setTimeout(() => overlay.remove(), maxDelay + DROP_DURATION + 100);
}

export function ThemeToggle() {
  // Sempre começa "false" — igual nos dois lados (servidor não sabe o tema).
  // O script anti-flash em layout.tsx já deixou a <html> com a classe certa
  // antes do paint; aqui só sincronizamos o ícone/aria-label do botão com
  // ela logo depois do mount, sem gerar mismatch de hidratação.
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com uma classe do DOM que um script fora do React já aplicou; não dá pra saber isso no primeiro render (server não tem document).
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next = !document.documentElement.classList.contains("dark");

    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage indisponível (modo privado etc.) — só não persiste.
    }
    setIsDark(next);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion) {
      spawnDrops(e.clientX, e.clientY);
    }
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
