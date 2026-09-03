import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeetCloser — Automação de prospecção",
  description: "Prospecção automatizada por WhatsApp, Instagram e ligação para fechar reuniões.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          // Aplica a classe .dark antes do primeiro paint, senão a página
          // pisca clara e troca pra escura depois de hidratar.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-screen-2xl px-8 py-8 2xl:px-12">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
