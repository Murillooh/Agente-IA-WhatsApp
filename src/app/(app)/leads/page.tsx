import { listLeads } from "@/lib/repo/leads";
import { LeadsClient } from "./LeadsClient";

export const dynamic = "force-dynamic";

export default function LeadsPage() {
  const leads = listLeads();
  return <LeadsClient leads={leads} />;
}
