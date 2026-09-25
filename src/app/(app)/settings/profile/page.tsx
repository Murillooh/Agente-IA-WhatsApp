import { redirect } from "next/navigation";
import { getUserById } from "@/lib/repo/users";
import { getSession } from "@/lib/auth/session";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { CheckCircle2, CircleDashed, User as UserIcon, Shield, CalendarDays, BellRing, Globe, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await getUserById(session.userId);
  if (!user) redirect("/login");

  const isGoogleConnected = Boolean(user.googleRefreshToken);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header Mais Limpo */}
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6 dark:border-white/10">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Perfil e Configurações
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Gerencie sua conta, integrações de agenda e credenciais de segurança.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 xl:grid-cols-3 max-w-7xl">
        
        {/* Conta */}
        <div className="relative flex h-fit flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/[0.06] dark:bg-[#0c121e]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
              Sua Conta
            </h2>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-500">
              <UserIcon size={16} />
            </div>
          </div>
          
          <dl className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.02] border border-transparent dark:border-white/5">
              <dt className="font-semibold text-slate-500 dark:text-slate-400">Nome</dt>
              <dd className="font-bold text-slate-900 dark:text-white">{user.name}</dd>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.02] border border-transparent dark:border-white/5">
              <dt className="font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap mr-4">E-mail</dt>
              <dd className="font-bold text-slate-900 dark:text-white truncate text-right">{user.username}</dd>
            </div>
          </dl>
        </div>

        {/* Google Agenda */}
        <div className="relative flex h-fit flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/[0.06] dark:bg-[#0c121e]">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                Google Agenda
              </h2>
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400 pr-4">
                Conecte para agendamento automático de reuniões via IA.
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-500">
              <CalendarDays size={18} />
            </div>
          </div>
          
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex items-center gap-4">
              {isGoogleConnected ? (
                <>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Conectado</p>
                    <p className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Sincronização ativa</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <CircleDashed size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Não conectado</p>
                    <p className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Integração pendente</p>
                  </div>
                </>
              )}
            </div>

            {isGoogleConnected ? (
              <a
                href="/api/auth/google/disconnect"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                Desconectar
              </a>
            ) : (
              <a
                href="/api/auth/google/login"
                className="inline-flex w-full items-center justify-center rounded-xl border border-transparent bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Conectar Agora
              </a>
            )}
          </div>
        </div>

        {/* Segurança (Formulário) */}
        <div className="relative flex h-fit flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/[0.06] dark:bg-[#0c121e]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
              Segurança
            </h2>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-500">
              <Shield size={16} />
            </div>
          </div>
          
          <div className="rounded-2xl border border-slate-100 p-6 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">Trocar Senha</h3>
            <ChangePasswordForm />
          </div>
        </div>
          
        {/* Assinatura */}
        <div className="relative flex h-fit flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/[0.06] dark:bg-[#0c121e]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
              Assinatura
            </h2>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-500">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">Plano Pro</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Ativo • Renovação: 10/11/2026</p>
            <button className="w-full rounded-xl bg-slate-200/50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition-colors">
              Gerenciar Assinatura
            </button>
          </div>
        </div>

        {/* Preferências */}
        <div className="relative flex h-fit flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/[0.06] dark:bg-[#0c121e]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
              Preferências
            </h2>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-500">
              <Globe size={16} />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.02] border border-transparent dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3">
                <BellRing size={16} className="text-slate-400" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Notificações</p>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Push e Email</p>
                </div>
              </div>
              <div className="h-5 w-9 rounded-full bg-indigo-500 relative flex items-center px-0.5 shadow-inner">
                <div className="h-4 w-4 rounded-full bg-white ml-auto shadow-sm" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.02] border border-transparent dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-slate-400" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Fuso Horário</p>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">América/SP</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
