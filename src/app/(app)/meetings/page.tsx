import { redirect } from "next/navigation";
import { listMeetings } from "@/lib/repo/meetings";
import { getSession } from "@/lib/auth/session";
import { MeetingsClient } from "./MeetingsClient";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const meetings = listMeetings(session.userId);
  return <MeetingsClient meetings={meetings} />;
}
