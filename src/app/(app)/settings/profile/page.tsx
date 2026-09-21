import { redirect } from "next/navigation";
import { getUserById } from "@/lib/repo/users";
import { getSession } from "@/lib/auth/session";
import { ChangePasswordForm } from "./ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await getUserById(session.userId);
  if (!user) redirect("/login");

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
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            Trocar senha
          </h2>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
