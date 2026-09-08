"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";

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
    <form onSubmit={submit} className="mt-3 space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
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
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
          Nova senha
        </span>
        <PasswordInput
          required
          value={newPassword}
          onChange={(v) => {
            setNewPassword(v);
            setSuccess(false);
          }}
          placeholder="Pelo menos 8 caracteres"
          autoComplete="new-password"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
          Confirmar nova senha
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
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      {success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">Senha atualizada.</p>
      )}
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  );
}
