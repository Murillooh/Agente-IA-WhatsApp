import type { Metadata } from "next";
import Script from "next/script";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeetCloser — Automação de prospecção",
  description: "Prospecção automatizada por WhatsApp, Instagram e ligação para fechar reuniões.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Script de anti-flash: roda de forma síncrona antes de qualquer paint.
            Lê o localStorage e aplica a classe 'dark' imediatamente. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || (!stored && prefersDark);
    var root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Guarda o valor para que o React não precise ler o localStorage de novo
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  } catch (e) {}
})();
`,
          }}
        />
      </head>
      <body className="min-h-full antialiased h-full">
        {children}
        <div className="fixed right-5 top-5 z-40">
          <ThemeToggle />
        </div>
      </body>
    </html>
  );
}
