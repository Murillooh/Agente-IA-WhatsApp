import { NextResponse } from "next/server";
import { countLeadsByMode, countLeadsByStatus, listLeads } from "@/lib/repo/leads";
import { countUpcomingMeetings, listMeetings } from "@/lib/repo/meetings";

export async function GET() {
  const byStatus = countLeadsByStatus();
  const byMode = countLeadsByMode();
  const totalLeads = listLeads().length;
  const upcomingMeetings = countUpcomingMeetings();
  const meetings = listMeetings()
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
