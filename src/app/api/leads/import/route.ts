import { NextRequest, NextResponse } from "next/server";
import { createLead, findDuplicateLead } from "@/lib/repo/leads";
import { addEvent } from "@/lib/repo/events";
import { getSession } from "@/lib/auth/session";
import type { Mode } from "@/lib/types";

// Importa leads em massa ("puxar leads") a partir de um CSV colado pelo
// usuário. Colunas esperadas (nesta ordem, com cabeçalho):
// name,phone,whatsapp,instagram,source,mode
// mode aceita "MODO_1" ou "MODO_2" (padrão: MODO_1).
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json();
  const csv: string = body?.csv ?? "";
  if (!csv.trim()) {
    return NextResponse.json({ error: "CSV vazio." }, { status: 400 });
  }

  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return NextResponse.json(
      { error: "CSV precisa de cabeçalho + pelo menos uma linha." },
      { status: 400 }
    );
  }

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = header.indexOf("name");
  if (nameIdx === -1) {
    return NextResponse.json(
      { error: "Cabeçalho precisa ter ao menos a coluna 'name'." },
      { status: 400 }
    );
  }
  const phoneIdx = header.indexOf("phone");
  const whatsappIdx = header.indexOf("whatsapp");
  const instagramIdx = header.indexOf("instagram");
  const sourceIdx = header.indexOf("source");
  const modeIdx = header.indexOf("mode");

  let created = 0;
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const name = cols[nameIdx];
    if (!name) {
      errors.push(`Linha ${i + 1}: sem nome, ignorada.`);
      continue;
    }
    const whatsapp = whatsappIdx >= 0 ? cols[whatsappIdx] || null : null;
    const phone = phoneIdx >= 0 ? cols[phoneIdx] || null : null;
    const instagram = instagramIdx >= 0 ? cols[instagramIdx] || null : null;
    if (!whatsapp && !phone && !instagram) {
      errors.push(`Linha ${i + 1}: sem WhatsApp/telefone/Instagram, ignorada.`);
      continue;
    }
    const modeRaw = modeIdx >= 0 ? cols[modeIdx]?.toUpperCase() : "";
    const mode: Mode = modeRaw === "MODO_2" ? "MODO_2" : "MODO_1";

    const dup = findDuplicateLead(session.userId, { whatsapp, phone, instagram });
    if (dup) {
      errors.push(`Linha ${i + 1}: duplicado de "${dup.name}", ignorada.`);
      continue;
    }

    const lead = createLead(session.userId, {
      name,
      phone,
      whatsapp,
      instagram,
      source: sourceIdx >= 0 ? cols[sourceIdx] || "Importação CSV" : "Importação CSV",
      mode,
    });
    addEvent({
      leadId: lead.id,
      channel: "SISTEMA",
      direction: "SAIDA",
      content: "Lead importado via CSV.",
    });
    created++;
  }

  return NextResponse.json({ created, errors });
}
