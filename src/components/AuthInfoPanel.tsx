"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Zap, CalendarCheck } from "lucide-react";
import Image from "next/image";

const phrases = [
  { text: "Prospecção inteligente", icon: <Zap className="w-6 h-6 text-indigo-300" /> },
  { text: "Atendimento 24 horas", icon: <MessageCircle className="w-6 h-6 text-indigo-300" /> },
  { text: "Mais reuniões fechadas", icon: <CalendarCheck className="w-6 h-6 text-indigo-300" /> },
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

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-lg">
        
        {/* Floating AI Mascot Hologram */}
        <motion.div
          className="relative w-48 h-48 mb-8"
          animate={{
            y: ["-10px", "10px", "-10px"],
            rotate: [-2, 2, -2],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Outer glowing ring */}
          <motion.div 
            className="absolute inset-0 rounded-full border border-indigo-400/30 bg-indigo-500/10 backdrop-blur-sm"
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* The Mascot Image (using mix-blend-screen to remove dark background if any and make it look like a hologram) */}
          <div className="absolute inset-2 rounded-full overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(99,102,241,0.5)] bg-indigo-900/50">
             <Image 
               src="/mascot.jpg" 
               alt="AI Mascot" 
               fill 
               className="object-cover mix-blend-screen opacity-90"
             />
          </div>

          {/* Sparkles around mascot */}
          <motion.div 
            key={index} // Triggers when text changes
            className="absolute -right-4 top-0"
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
             {phrases[index].icon}
          </motion.div>
        </motion.div>

        {/* Text Container */}
        <div className="relative h-32 w-full flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)", scale: 0.95 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, y: -30, filter: "blur(8px)", scale: 1.05 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute flex flex-col items-center w-full"
            >
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
