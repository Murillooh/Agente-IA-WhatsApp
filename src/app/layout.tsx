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
