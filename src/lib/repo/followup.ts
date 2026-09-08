import { db } from "@/lib/db";

export interface FollowUpCandidate {
  leadId: string;
  userId: string;
  lastOutboundAt: string;
}

/**
 * Acha leads travados: status CONTATADO, cujo último envio (WhatsApp ou
 * Instagram) foi há `days` dias ou mais e não teve nenhuma resposta
 * (evento ENTRADA) depois disso. Cruza todas as contas — quem decide isso
 * é o cron, não uma tela por usuário — só o próprio cron (rota protegida
 * por CRON_SECRET) chama isto.
 */
export function findLeadsAwaitingFollowUp(days: number): FollowUpCandidate[] {
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const rows = db
    .prepare(
      `SELECT leads.id as lead_id, leads.user_id as user_id, out_evt.last_out as last_out
       FROM leads
       JOIN (
         SELECT lead_id, MAX(created_at) as last_out
         FROM conversation_events
         WHERE direction = 'SAIDA' AND channel IN ('WHATSAPP','INSTAGRAM')
         GROUP BY lead_id
       ) out_evt ON out_evt.lead_id = leads.id
       LEFT JOIN (
         SELECT lead_id, MAX(created_at) as last_in
         FROM conversation_events
         WHERE direction = 'ENTRADA'
         GROUP BY lead_id
       ) in_evt ON in_evt.lead_id = leads.id
       WHERE leads.status = 'CONTATADO'
         AND out_evt.last_out <= ?
         AND (in_evt.last_in IS NULL OR in_evt.last_in < out_evt.last_out)`
    )
    .all(cutoff) as { lead_id: string; user_id: string; last_out: string }[];
  return rows.map((r) => ({ leadId: r.lead_id, userId: r.user_id, lastOutboundAt: r.last_out }));
}
