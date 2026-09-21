import { notFound, redirect } from "next/navigation";
import { getLead } from "@/lib/repo/leads";
import { listEventsForLead } from "@/lib/repo/events";
import { getMeetingForLead } from "@/lib/repo/meetings";
import { listTagsForLead } from "@/lib/repo/tags";
import { getSession } from "@/lib/auth/session";
import { LeadDetailClient } from "./LeadDetailClient";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const lead = await getLead(id, session.userId);
  if (!lead) notFound();

  const events = await listEventsForLead(id, session.userId);
  const meeting = await getMeetingForLead(id, session.userId);
  const tags = await listTagsForLead(id, session.userId);

  return <LeadDetailClient lead={lead} events={events} meeting={meeting} tags={tags} />;
}
