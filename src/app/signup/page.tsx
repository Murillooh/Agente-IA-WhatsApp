import type { Metadata } from "next";
import { AnimatedAuth } from "@/components/AnimatedAuth";
import { AuthInfoPanel } from "@/components/AuthInfoPanel";

export const metadata: Metadata = {
  title: "Criar conta — Munago",
};

export default function SignupPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <AnimatedAuth initialMode="signup" />
      <AuthInfoPanel />
    </div>
  );
}
