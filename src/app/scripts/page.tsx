import { listScripts } from "@/lib/repo/scripts";
import { ScriptsClient } from "./ScriptsClient";

export const dynamic = "force-dynamic";

export default function ScriptsPage() {
  const scripts = listScripts();
  return <ScriptsClient scripts={scripts} />;
}
