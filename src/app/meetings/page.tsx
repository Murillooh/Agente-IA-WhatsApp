import { listMeetings } from "@/lib/repo/meetings";
import { MeetingsClient } from "./MeetingsClient";

export const dynamic = "force-dynamic";

export default function MeetingsPage() {
  const meetings = listMeetings();
  return <MeetingsClient meetings={meetings} />;
}
