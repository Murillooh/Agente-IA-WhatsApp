import { listScripts, scriptStats } from "@/lib/repo/scripts";
import { ScriptsClient } from "./ScriptsClient";

export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth/session";
import { isUserAdmin } from "@/lib/repo/users";
import { redirect } from "next/navigation";

export default async function ScriptsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const isAdmin = await isUserAdmin(session.userId);
  if (!isAdmin) redirect("/");
  const scripts = await listScripts();
  const statsEntries = await Promise.all(
    scripts.filter((s) => s.isActive).map(async (s) => [s.id, await scriptStats(s.id)])
  );
  const stats = Object.fromEntries(statsEntries);
  return <ScriptsClient scripts={scripts} stats={stats} />;
}
