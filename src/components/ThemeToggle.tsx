"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

// Cor das bolinhas = a cor de fundo do tema pra onde tá indo (mesmos tons
// de --background em globals.css) — a tela "enche" até ficar tudo
// preto (dark) ou tudo claro (light), não uma cor de marca por cima.
const FILL_COLOR = {
  dark: [11, 18, 32], // #0b1220
  light: [248, 250, 252], // #f8fafc
};

const CELL = 145; // px por célula da grade — controla quantas bolinhas nascem
const DROP_DURATION = 1000; // ms, animação de cada bolinha individual
const SPEED = 1; // ms de atraso por pixel de distância até o centro (onda)
const HOLD_BEFORE_REMOVE = 150; // ms segurando a tela já coberta antes de tirar a camada

/**
 * Enche a tela toda de bolinhas na cor do tema de destino, nascendo do
 * centro da tela e se espalhando em onda (mais longe do centro = aparece
 * mais tarde) até cobrir tudo — por cima do tema ATUAL, que ainda não
 * mudou. Só quando a última bolinha termina de crescer é que `onFilled`
 * é chamado pra trocar o tema de verdade (escondido atrás da camada, que
 * já é exatamente essa cor) — daí a camada some sem se notar.
 */
function spawnDrops(goingDark: boolean, onFilled: () => void) {
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:9999;pointer-events:none;overflow:hidden;";
  document.body.appendChild(overlay);

  const originX = window.innerWidth / 2;
  const originY = window.innerHeight / 2;
  const [r, g, b] = FILL_COLOR[goingDark ? "dark" : "light"];

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

      // opacidade final varia um pouco por bolinha — dá profundidade
      // (efeito translúcido) sem deixar buraco quando sobrepõem.
      const peakOpacity = 0.85 + Math.random() * 0.13;

      const drop = document.createElement("div");
      // will-change avisa o navegador com antecedência pra já promover a
      // bolinha a uma layer própria, em vez de fazer isso no meio da
      // animação (uma das causas da travadinha no final).
      drop.style.cssText = `position:absolute;left:${x - diameter / 2}px;top:${
        y - diameter / 2
      }px;width:${diameter}px;height:${diameter}px;border-radius:9999px;background:rgb(${r} ${g} ${b});transform:scale(0);opacity:0;will-change:transform,opacity;contain:strict;`;
      fragment.appendChild(drop);

      drop.animate(
        [
          { transform: "scale(0)", opacity: 0 },
          { transform: "scale(1.08)", opacity: peakOpacity, offset: 0.65 },
          { transform: "scale(1)", opacity: peakOpacity, offset: 1 },
        ],
        { duration: DROP_DURATION, delay, easing: "ease-out", fill: "forwards" }
      );
    }
  }

  overlay.appendChild(fragment);

  window.setTimeout(() => {
    // Trocar o tema de verdade recalcula o CSS de boa parte da página de
    // uma vez só (todo elemento com classe dark:...) — se isso e a
    // remoção de ~100 bolinhas acontecerem no mesmo instante, o navegador
    // acumula tudo num frame só e trava visivelmente. Por isso: troca o
    // tema agora (escondido atrás da camada, que já é essa cor exata),
    // deixa o navegador pintar esse resultado em frames próprios
    // (2x requestAnimationFrame), e SÓ DEPOIS remove as bolinhas.
    onFilled();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(() => overlay.remove(), HOLD_BEFORE_REMOVE);
      });
    });
  }, maxDelay + DROP_DURATION);
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
    setIsDark(next); // feedback imediato no ícone do botão

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      applyRealTheme(next);
      return;
    }

    // A tela só troca de verdade quando as bolinhas terminarem de cobrir
    // tudo — enquanto isso o resto da página continua no tema atual por
    // baixo, é isso que dá a sensação de "estar enchendo".
    spawnDrops(next, () => applyRealTheme(next));
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
