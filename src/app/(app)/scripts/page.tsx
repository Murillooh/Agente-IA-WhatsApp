import { listScripts, scriptStats } from "@/lib/repo/scripts";
import { ScriptsClient } from "./ScriptsClient";

export const dynamic = "force-dynamic";

export default async function ScriptsPage() {
  const scripts = await listScripts();
  const statsEntries = await Promise.all(
    scripts.filter((s) => s.isActive).map(async (s) => [s.id, await scriptStats(s.id)])
  );
  const stats = Object.fromEntries(statsEntries);
  return <ScriptsClient scripts={scripts} stats={stats} />;
}
