import { redirect } from "next/navigation";
import { getUserById } from "@/lib/repo/users";
import { getSession } from "@/lib/auth/session";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { CheckCircle2, CircleDashed } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await getUserById(session.userId);
  if (!user) redirect("/login");

  const isGoogleConnected = Boolean(user.googleRefreshToken);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Perfil
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Sua conta e senha de acesso.
        </p>
      </div>

      <div className="max-w-md space-y-6">
        <div className="card p-6">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            Conta
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400 dark:text-slate-500">Nome</dt>
              <dd className="text-right text-slate-700 dark:text-slate-300">{user.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400 dark:text-slate-500">Usuário</dt>
              <dd className="text-right text-slate-700 dark:text-slate-300">{user.username}</dd>
            </div>
          </dl>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Google Agenda
            </h2>
            {isGoogleConnected ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30">
                <CheckCircle2 size={13} /> Conectado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-600/15 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-400/20">
                <CircleDashed size={13} /> Não conectado
              </span>
            )}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Conecte sua conta do Google para que a IA agende reuniões automaticamente na sua agenda.
          </p>
          <div className="mt-4">
            {isGoogleConnected ? (
              <a
                href="/api/auth/google/disconnect"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Desconectar
              </a>
            ) : (
              <a
                href="/api/auth/google/login"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Conectar com o Google
              </a>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            Trocar senha
          </h2>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
