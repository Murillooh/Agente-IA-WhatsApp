import { NextResponse } from "next/server";
import { listLeads } from "@/lib/repo/leads";
import { getSession } from "@/lib/auth/session";

// Espelha o import (mesmas colunas), só que pra fora.
function toCsvField(value: string | null | undefined): string {
  const v = value ?? "";
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const leads = listLeads(session.userId);
  const header = ["name", "phone", "whatsapp", "instagram", "source", "mode", "status"];
  const lines = [header.join(",")];
  for (const l of leads) {
    lines.push(
      [l.name, l.phone, l.whatsapp, l.instagram, l.source, l.mode, l.status]
        .map(toCsvField)
        .join(",")
    );
  }
  // ﻿: BOM pra Excel abrir os acentos certo sem precisar escolher encoding.
  const csv = "﻿" + lines.join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
