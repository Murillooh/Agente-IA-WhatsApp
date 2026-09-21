import { redirect } from "next/navigation";
import { listLeads } from "@/lib/repo/leads";
import { getSession } from "@/lib/auth/session";
import { LeadsClient } from "./LeadsClient";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const leads = await listLeads(session.userId);
  return <LeadsClient leads={leads} />;
}
