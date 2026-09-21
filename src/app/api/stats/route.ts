import { NextRequest, NextResponse } from "next/server";
import {
  averageDaysToClose,
  conversionBySource,
  countLeadsByMode,
  countLeadsByStatus,
  listLeads,
  type DateRange,
} from "@/lib/repo/leads";
import { countUpcomingMeetings, listMeetings } from "@/lib/repo/meetings";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const userId = session.userId;

  // ?from=AAAA-MM-DD&to=AAAA-MM-DD (data local do usuário) — mesma
  // convenção do dashboard, viram começo/fim do dia em ISO.
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const range: DateRange = {
    from: from ? `${from}T00:00:00.000Z` : undefined,
    to: to ? `${to}T23:59:59.999Z` : undefined,
  };

  const byStatus = await countLeadsByStatus(userId, range);
  const byMode = await countLeadsByMode(userId, range);
  const totalLeads = (await listLeads(userId, range)).length;
  const upcomingMeetings = await countUpcomingMeetings(userId);
  const meetings = (await listMeetings(userId))
    .filter((m) => m.status === "AGENDADA")
    .slice(0, 5);
  const avgDaysToClose = await averageDaysToClose(userId, range);
  const bySource = await conversionBySource(userId, range);

  return NextResponse.json({
    totalLeads,
    byStatus,
    byMode,
    upcomingMeetings,
    nextMeetings: meetings,
    avgDaysToClose,
    bySource,
  });
}
