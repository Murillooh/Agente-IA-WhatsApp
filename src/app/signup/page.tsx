import type { Metadata } from "next";
import { Target } from "lucide-react";
import { AuthInfoPanel } from "@/components/AuthInfoPanel";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Criar conta — MeetCloser",
};

export default function SignupPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
              <Target size={18} strokeWidth={2.25} />
            </div>
            <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              MeetCloser
            </p>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Criar conta
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Cadastre-se pra começar a fechar reuniões.
          </p>

          <SignupForm />
        </div>
      </div>

      <AuthInfoPanel />
    </div>
  );
}
