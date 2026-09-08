import { NextRequest, NextResponse } from "next/server";
import { findLeadsAwaitingFollowUp } from "@/lib/repo/followup";
import { runFollowUpForLead } from "@/lib/automation";

// Chamado pelo Vercel Cron (veja vercel.json) — nunca pelo navegador. Em
// produção o Vercel manda "Authorization: Bearer $CRON_SECRET" sozinho; sem
// CRON_SECRET configurado a rota recusa tudo (falha fechada, não aberta).
//
// Teste manual local (simula exatamente o que o cron real faz):
//   curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/follow-up
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET não configurado." }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const days = Number(process.env.FOLLOWUP_DAYS) || 3;
  const candidates = findLeadsAwaitingFollowUp(days);

  const results = [];
  for (const c of candidates) {
    try {
      const r = await runFollowUpForLead(c.leadId, c.userId);
      results.push({ leadId: c.leadId, ok: true, steps: r.steps });
    } catch (e) {
      results.push({ leadId: c.leadId, ok: false, error: (e as Error).message });
    }
  }

  return NextResponse.json({ days, checked: candidates.length, results });
}
