import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { getLead } from "@/lib/repo/leads";
import type { LeadTag } from "@/lib/types";

interface TagRow {
  id: string;
  lead_id: string;
  label: string;
  created_at: string;
}

function rowToTag(r: TagRow): LeadTag {
  return { id: r.id, leadId: r.lead_id, label: r.label, createdAt: r.created_at };
}

// Toda função aqui confirma dono do lead via getLead(leadId, userId) antes
// de tocar em lead_tags — mesma isolação por usuário do resto do repo.

export function listTagsForLead(leadId: string, userId: string): LeadTag[] {
  if (!getLead(leadId, userId)) return [];
  const rows = db
    .prepare("SELECT * FROM lead_tags WHERE lead_id = ? ORDER BY created_at ASC")
    .all(leadId) as TagRow[];
  return rows.map(rowToTag);
}

export function addTag(leadId: string, userId: string, label: string): LeadTag | null {
  if (!getLead(leadId, userId)) return null;
  const clean = label.trim();
  if (!clean) return null;

  const id = randomUUID();
  const now = new Date().toISOString();
  try {
    db.prepare(
      "INSERT INTO lead_tags (id, lead_id, label, created_at) VALUES (?, ?, ?, ?)"
    ).run(id, leadId, clean, now);
    return { id, leadId, label: clean, createdAt: now };
  } catch {
    // UNIQUE(lead_id, label) — já existe essa tag nesse lead, devolve a
    // que já tinha em vez de duplicar ou quebrar.
    const existing = db
      .prepare("SELECT * FROM lead_tags WHERE lead_id = ? AND label = ?")
      .get(leadId, clean) as TagRow | undefined;
    return existing ? rowToTag(existing) : null;
  }
}

export function removeTag(tagId: string, leadId: string, userId: string): void {
  if (!getLead(leadId, userId)) return;
  db.prepare("DELETE FROM lead_tags WHERE id = ? AND lead_id = ?").run(tagId, leadId);
}
