import { NextResponse } from "next/server";
import { countLeadsByMode, countLeadsByStatus, listLeads } from "@/lib/repo/leads";
import { countUpcomingMeetings, listMeetings } from "@/lib/repo/meetings";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const userId = session.userId;

  const byStatus = countLeadsByStatus(userId);
  const byMode = countLeadsByMode(userId);
  const totalLeads = listLeads(userId).length;
  const upcomingMeetings = countUpcomingMeetings(userId);
  const meetings = listMeetings(userId)
    .filter((m) => m.status === "AGENDADA")
    .slice(0, 5);

  return NextResponse.json({
    totalLeads,
    byStatus,
    byMode,
    upcomingMeetings,
    nextMeetings: meetings,
  });
}
