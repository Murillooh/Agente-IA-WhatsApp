import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface FollowUpCandidate {
  leadId: string;
  userId: string;
  lastOutboundAt: string;
}

export async function findLeadsAwaitingFollowUp(days: number): Promise<FollowUpCandidate[]> {
  const cutoff = new Date(Date.now() - days * 86400000);
  
  // Usando Raw query porque é um left join com group by complexo
  const rows = (await prisma.$queryRaw`
    SELECT leads.id as lead_id, leads.user_id as user_id, out_evt.last_out as last_out
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
      AND out_evt.last_out <= ${cutoff}
      AND (in_evt.last_in IS NULL OR in_evt.last_in < out_evt.last_out)
  `) as any[];

  return rows.map((r: any) => ({ 
    leadId: r.lead_id, 
    userId: r.user_id, 
    lastOutboundAt: r.last_out.toISOString() 
  }));
}
