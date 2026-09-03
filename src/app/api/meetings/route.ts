import { NextResponse } from "next/server";
import { listMeetings } from "@/lib/repo/meetings";

export async function GET() {
  return NextResponse.json(listMeetings());
}
