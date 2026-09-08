import { listScripts, scriptStats } from "@/lib/repo/scripts";
import { ScriptsClient } from "./ScriptsClient";

export const dynamic = "force-dynamic";

export default function ScriptsPage() {
  const scripts = listScripts();
  const stats = Object.fromEntries(
    scripts.filter((s) => s.isActive).map((s) => [s.id, scriptStats(s.id)])
  );
  return <ScriptsClient scripts={scripts} stats={stats} />;
}
