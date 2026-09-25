"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { Loader2 } from "lucide-react";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("A nova senha e a confirmação não são iguais.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível trocar a senha.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(true);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Senha atual
        </span>
        <PasswordInput
          required
          value={currentPassword}
          onChange={(v) => {
            setCurrentPassword(v);
            setSuccess(false);
          }}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </label>
      
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Nova senha
          </span>
          <PasswordInput
            required
            value={newPassword}
            onChange={(v) => {
              setNewPassword(v);
              setSuccess(false);
            }}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Confirmar senha
          </span>
          <PasswordInput
            required
            value={confirmPassword}
            onChange={(v) => {
              setConfirmPassword(v);
              setSuccess(false);
            }}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </label>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm font-medium">
          {error && <p className="text-rose-600 dark:text-rose-400">{error}</p>}
          {success && <p className="text-emerald-600 dark:text-emerald-400">Senha atualizada com sucesso.</p>}
        </div>
        <button 
          type="submit" 
          disabled={saving} 
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {saving && <Loader2 size={14} className="mr-2 animate-spin" />}
          {saving ? "Salvando..." : "Salvar nova senha"}
        </button>
      </div>
    </form>
  );
}
