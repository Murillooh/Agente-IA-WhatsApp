"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Zap, CalendarCheck } from "lucide-react";

const phrases = [
  { text: "Prospecção inteligente", icon: <Zap className="w-8 h-8 text-indigo-300 mb-4 mx-auto" /> },
  { text: "Atendimento 24 horas", icon: <MessageCircle className="w-8 h-8 text-indigo-300 mb-4 mx-auto" /> },
  { text: "Mais reuniões fechadas", icon: <CalendarCheck className="w-8 h-8 text-indigo-300 mb-4 mx-auto" /> },
];

export function AuthInfoPanel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative hidden overflow-hidden bg-indigo-950 lg:flex lg:flex-col lg:justify-center lg:items-center lg:px-14 lg:py-12">
      {/* Animated Deep Brand Gradient Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-700 to-indigo-900"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />
      
      {/* Noise texture overlay for premium feel */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Floating Glass Shapes - Modern UI Elements */}
      {/* Shape 1: Top Right */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl"
        animate={{
          y: ["-10%", "10%", "-10%"],
          x: ["10%", "-5%", "10%"],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "-5%", right: "-5%" }}
      />

      {/* Shape 2: Bottom Left - Chat Bubble Style */}
      <motion.div
        className="absolute w-[400px] h-[250px] rounded-[60px] rounded-bl-xl bg-white/10 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] border border-white/20"
        animate={{
          y: ["10%", "-10%", "10%"],
          x: ["-5%", "5%", "-5%"],
          rotate: [-5, 5, -5],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ bottom: "10%", left: "-10%" }}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-64 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30, filter: "blur(8px)", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, y: -30, filter: "blur(8px)", scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute flex flex-col items-center"
          >
            {phrases[index].icon}
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-md">
              {phrases[index].text}
            </h2>
            <p className="mt-4 text-indigo-200 text-sm font-medium tracking-wide">
              MeetCloser IA Agent
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Users;
  title: string;
  desc: string;
}) {
  return (
    <motion.li variants={itemVariants} className="flex gap-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
        <Icon size={17} />
      </span>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-indigo-100/80">{desc}</p>
      </div>
    </motion.li>
  );
}
