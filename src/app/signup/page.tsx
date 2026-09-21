import type { Metadata } from "next";
import { AnimatedAuth } from "@/components/AnimatedAuth";

export const metadata: Metadata = {
  title: "Criar conta — MeetCloser",
};

export default function SignupPage() {
  return <AnimatedAuth initialMode="signup" />;
}
