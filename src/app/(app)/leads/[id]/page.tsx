import { notFound } from "next/navigation";
import { getLead } from "@/lib/repo/leads";
import { listEventsForLead } from "@/lib/repo/events";
import { getMeetingForLead } from "@/lib/repo/meetings";
import { LeadDetailClient } from "./LeadDetailClient";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = getLead(id);
  if (!lead) notFound();

  const events = listEventsForLead(id);
  const meeting = getMeetingForLead(id);

  return <LeadDetailClient lead={lead} events={events} meeting={meeting} />;
}
