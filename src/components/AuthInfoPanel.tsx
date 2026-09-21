"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Zap, CalendarCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import phoneMascotImg from "../../public/phone_mascot.jpg";

const phrases = [
  { 
    title: "Prospecção Automática", 
    subtitle: "Deixe a IA prospectar e qualificar seus leads 24 horas por dia.",
    icon: <Zap className="w-8 h-8 text-yellow-400" /> 
  },
  { 
    title: "Sempre Disponível", 
    subtitle: "Sua equipe de vendas que nunca dorme, respondendo em segundos.",
    icon: <MessageCircle className="w-8 h-8 text-green-400" /> 
  },
  { 
    title: "Mais Reuniões", 
    subtitle: "Transformamos leads frios em reuniões agendadas no seu calendário.",
    icon: <CalendarCheck className="w-8 h-8 text-blue-400" /> 
  },
];

export function AuthInfoPanel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 4500); // Increased time for reading
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative hidden overflow-hidden bg-[#0f0c29] lg:flex lg:flex-col lg:justify-center lg:items-center lg:px-14 lg:py-12">
      {/* Animated Deep Brand Gradient Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-[#302b63] via-[#24243e] to-[#0f0c29]"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />
      
      {/* Noise texture overlay for premium feel */}
      <div 
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient glowing orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.2, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-lg">
        
        {/* Floating Phone Mascot */}
        <motion.div
          className="relative w-64 h-64 mb-8"
          animate={{
            y: ["-10px", "10px", "-10px"],
            rotate: [-2, 2, -2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Subtle glow behind the phone */}
          <motion.div 
            className="absolute inset-4 rounded-[40px] bg-green-500/20 blur-[40px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* The Phone Image */}
          <motion.div 
            className="absolute inset-0 rounded-[40px] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
             <Image 
               src={phoneMascotImg} 
               alt="AI Automation Phone" 
               fill
               className="object-cover scale-[1.02]"
               priority
             />
          </motion.div>

          {/* Sparkles around mascot that change per phrase */}
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={index}
              className="absolute -right-6 top-4 bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-xl"
              initial={{ scale: 0, opacity: 0, y: 20, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 10 }}
              exit={{ scale: 0, opacity: 0, y: -20, rotate: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
               {phrases[index].icon}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Text Container */}
        <div className="relative h-40 w-full flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 1.1 }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="absolute flex flex-col items-center w-full"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span className="text-indigo-300 font-semibold uppercase tracking-widest text-xs">MeetCloser AI</span>
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg mb-4">
                {phrases[index].title}
              </h2>
              <p className="text-indigo-100 text-lg font-medium leading-relaxed max-w-md opacity-90">
                {phrases[index].subtitle}
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
