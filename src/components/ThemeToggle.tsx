"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const CELL = 350; // px por célula da grade — controla quantas bolinhas nascem
const DROP_DURATION = 1300; // ms, animação de cada bolinha individual
const SPEED = 1.6; // ms de atraso por pixel de distância até o centro (onda)
const STEPS = 12; // nº de recomputações da máscara ao longo da animação (steps(), não contínuo)

function easeOutCubic(p: number) {
  return 1 - Math.pow(1 - p, 3);
}

/** Um círculo cheio como subpath SVG (duas semicircunferências). */
function circlePath(cx: number, cy: number, r: number) {
  const radius = Math.max(r, 0.01); // nunca exatamente 0 — mantém a estrutura do path igual em todo keyframe
  return `M${cx + radius} ${cy} a${radius} ${radius} 0 1 0 ${-2 * radius} 0 a${radius} ${radius} 0 1 0 ${2 * radius} 0 Z `;
}

/**
 * Troca de tema revelada por bolinhas nascendo do centro da tela pra
 * fora, em onda: cada bolinha é um "furo" que deixa ver o
 * ::view-transition-new(root) (a foto real da página já no tema novo,
 * tirada pela View Transitions API) por cima do tema atual — não é uma
 * cor sólida por cima, é o conteúdo de verdade aparecendo.
 *
 * Como CSS clip-path só aceita UMA forma por valor, a união de várias
 * bolinhas é feita com um único `path()` (SVG path com várias
 * subcircunferências, fill-rule nonzero = união). Pra dar o efeito de
 * onda com atraso por bolinha dentro de uma única animação, os
 * keyframes são pré-calculados: cada um é uma "foto" do path inteiro
 * num instante, com o raio de cada bolinha já avançado conforme seu
 * próprio atraso.
 */
function revealWithDrops(onComplete?: () => void) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const originX = vw / 2;
  const originY = vh / 2;

  const cols = Math.ceil(vw / CELL) + 1;
  const rows = Math.ceil(vh / CELL) + 1;
  const maxRadius = CELL * 1.1; // maior que a célula: garante sobreposição, sem buraco

  const drops: { x: number; y: number; delay: number }[] = [];
  let maxDelay = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const jitterX = (Math.random() - 0.5) * CELL * 0.6;
      const jitterY = (Math.random() - 0.5) * CELL * 0.6;
      const x = col * CELL + CELL / 2 + jitterX;
      const y = row * CELL + CELL / 2 + jitterY;
      const delay = Math.hypot(x - originX, y - originY) * SPEED;
      maxDelay = Math.max(maxDelay, delay);
      drops.push({ x, y, delay });
    }
  }

  const totalDuration = maxDelay + DROP_DURATION;
  const keyframes: Keyframe[] = [];

  for (let step = 0; step <= STEPS; step++) {
    const t = (step / STEPS) * totalDuration;
    let d = "";
    for (const { x, y, delay } of drops) {
      const progress = Math.min(1, Math.max(0, (t - delay) / DROP_DURATION));
      d += circlePath(x, y, easeOutCubic(progress) * maxRadius);
    }
    keyframes.push({ clipPath: `path(nonzero, "${d.trim()}")`, offset: step / STEPS });
  }

  const animation = document.documentElement.animate(keyframes, {
    duration: totalDuration,
    easing: "linear", // o "ease" já tá embutido no raio de cada keyframe
    pseudoElement: "::view-transition-new(root)",
    fill: "forwards",
  });

  if (onComplete) animation.onfinish = onComplete;
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

  function applyRealTheme(next: boolean) {
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage indisponível (modo privado etc.) — só não persiste.
    }
  }

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    setIsDark(next);

    const startViewTransition = document.startViewTransition?.bind(document);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!startViewTransition || reducedMotion) {
      applyRealTheme(next);
      return;
    }

    const transition = startViewTransition(() => applyRealTheme(next));
    transition.ready.then(() => revealWithDrops());
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
