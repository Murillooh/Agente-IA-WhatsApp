"use client";

import { useState } from "react";
import { ShieldCheck, ShieldOff, Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  username: string;
  isAdmin: boolean;
  isApproved: boolean;
  createdAt: Date | string;
};

export function UserTable({ initialUsers, currentUserId }: { initialUsers: User[], currentUserId: string }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateUser = async (id: string, data: { isApproved?: boolean; isAdmin?: boolean }) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Ocorreu um erro ao atualizar.");
        return;
      }

      const updatedUser = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updatedUser } : u)));
      router.refresh();
    } catch (err) {
      alert("Falha na comunicação com o servidor.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
          <tr>
            <th className="py-2 pr-3">Nome</th>
            <th className="py-2 pr-3">Usuário</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-3">Acesso</th>
            <th className="py-2 pr-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isLoading = loadingId === u.id;
            const isSelf = u.id === currentUserId;

            return (
              <tr
                key={u.id}
                className="border-b border-slate-50 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-white">
                  {u.name}
                  {isSelf && <span className="ml-2 text-xs font-normal text-slate-400">(você)</span>}
                </td>
                <td className="py-2.5 pr-3 text-slate-500 dark:text-slate-400">{u.username}</td>
                <td className="py-2.5 pr-3">
                  {u.isApproved ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <Check size={12} /> Aprovado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                      <X size={12} /> Pendente
                    </span>
                  )}
                </td>
                <td className="py-2.5 pr-3">
                  {u.isAdmin ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <ShieldCheck size={12} /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <ShieldOff size={12} /> Padrão
                    </span>
                  )}
                </td>
                <td className="py-2.5 pr-3">
                  <div className="flex gap-2">
                    {!u.isApproved && (
                      <button
                        onClick={() => updateUser(u.id, { isApproved: true })}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : "Aprovar"}
                      </button>
                    )}
                    
                    {!isSelf && (
                      <button
                        onClick={() => updateUser(u.id, { isAdmin: !u.isAdmin })}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        {isLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : u.isAdmin ? (
                          "Remover Admin"
                        ) : (
                          "Tornar Admin"
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
