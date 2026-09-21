import type { Metadata } from "next";
import { AnimatedAuth } from "@/components/AnimatedAuth";

export const metadata: Metadata = {
  title: "Entrar — MeetCloser",
};

export default function LoginPage() {
  return <AnimatedAuth initialMode="login" />;
}
