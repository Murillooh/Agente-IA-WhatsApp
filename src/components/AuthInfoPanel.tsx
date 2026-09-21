"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const phrases = [
  "A próxima geração",
  "de automação",
  "para fechar reuniões",
];

export function AuthInfoPanel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative hidden overflow-hidden bg-[#ff4d00] lg:flex lg:flex-col lg:justify-center lg:items-center lg:px-14 lg:py-12">
      {/* Vibrant Gradient Background inspired by the video */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff7a00] via-[#ff4d00] to-[#e62e00]" />
      
      {/* Noise texture overlay for premium feel */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Massive floating glass shape */}
      <motion.div
        className="absolute w-[120%] h-[120%] rounded-[120px] bg-white/20 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] border border-white/30"
        initial={{ y: "100%", x: "-50%", rotate: 20 }}
        animate={{
          y: ["60%", "10%", "60%"],
          x: ["-30%", "-10%", "-30%"],
          rotate: [25, 10, 25],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          transformOrigin: "center center",
          left: 0,
          bottom: 0,
        }}
      />

      <div className="relative z-10 flex items-center justify-center text-center h-40">
        <AnimatePresence mode="wait">
          <motion.h2
            key={index}
            initial={{ opacity: 0, y: 40, filter: "blur(12px)", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, y: -40, filter: "blur(12px)", scale: 1.05 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute text-5xl font-semibold tracking-tight text-white drop-shadow-sm"
          >
            {phrases[index]}
          </motion.h2>
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
