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
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark");}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full">
        {children}
        <div className="fixed right-5 top-5 z-40">
          <ThemeToggle />
        </div>
      </body>
    </html>
  );
}
