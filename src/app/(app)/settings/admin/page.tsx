import { redirect } from "next/navigation";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { isUserAdmin, listUsers } from "@/lib/repo/users";
import { listAuditLog } from "@/lib/repo/audit";
import { UserTable } from "@/components/admin/UserTable";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  "lead.status_change": "Status do lead",
  "lead.delete": "Lead excluído",
  "user.password_change": "Troca de senha",
};

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await isUserAdmin(session.userId))) redirect("/");

  const users = await listUsers();
  const auditLog = await listAuditLog(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Administração
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Contas do sistema e log de mutação sensível — visível só pra admin.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
          Usuários
        </h2>
        
        <UserTable 
          initialUsers={users.map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            isAdmin: u.isAdmin,
            isApproved: u.isApproved,
            createdAt: u.createdAt,
          }))} 
          currentUserId={session.userId} 
        />
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
          Log de auditoria
        </h2>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Últimas {auditLog.length} mutações sensíveis (status de lead, exclusão, troca de senha).
        </p>
        <div className="mt-4 max-h-[28rem] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 border-b border-slate-100 bg-white text-xs font-medium uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-[#111a2e] dark:text-slate-500">
              <tr>
                <th className="py-2 pr-3">Quando</th>
                <th className="py-2 pr-3">Quem</th>
                <th className="py-2 pr-3">Ação</th>
                <th className="py-2">Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-sm text-slate-400 dark:text-slate-500">
                    Nenhuma mutação registrada ainda.
                  </td>
                </tr>
              )}
              {auditLog.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-slate-50 last:border-0 dark:border-slate-800/60"
                >
                  <td className="py-2.5 pr-3 whitespace-nowrap text-slate-400 dark:text-slate-500">
                    {new Date(e.createdAt).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-700 dark:text-slate-300">
                    {e.userName ?? "—"}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-500 dark:text-slate-400">
                    {ACTION_LABELS[e.action] ?? e.action}
                  </td>
                  <td className="py-2.5 text-slate-500 dark:text-slate-400">{e.detail ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
