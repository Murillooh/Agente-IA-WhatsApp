"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Zap, CalendarCheck, Sparkles, Check, CheckCheck } from "lucide-react";

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

const chatMessages = [
  { id: 1, text: "Olá, queria saber como funciona a plataforma.", isBot: false },
  { id: 2, text: "Olá! A nossa IA automatiza suas vendas no WhatsApp 24h por dia.", isBot: true },
  { id: 3, text: "Isso parece ótimo. Posso ver uma demo?", isBot: false },
  { id: 4, text: "Claro! Acabei de reservar um horário para você amanhã. 🚀", isBot: true }
];

export function AuthInfoPanel() {
  const [index, setIndex] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

  // Rotating phrases
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Animating chat messages inside the phone
  useEffect(() => {
    let currentMessageIndex = 0;
    
    // Clear initial
    setVisibleMessages([]);
    
    const messageInterval = setInterval(() => {
      if (currentMessageIndex < chatMessages.length) {
        const msgId = chatMessages[currentMessageIndex].id;
        setVisibleMessages(prev => {
          if (prev.includes(msgId)) return prev;
          return [...prev, msgId];
        });
        currentMessageIndex++;
      } else {
        // Reset and loop
        setTimeout(() => {
          setVisibleMessages([]);
          currentMessageIndex = 0;
        }, 3000);
      }
    }, 1500); // appear every 1.5s
    
    return () => clearInterval(messageInterval);
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
        
        {/* Floating Phone Mockup */}
        <motion.div
          className="relative w-[280px] h-[520px] mb-12"
          animate={{
            y: ["-8px", "8px", "-8px"],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Subtle glow behind the phone */}
          <motion.div 
            className="absolute inset-4 rounded-[40px] bg-green-500/20 blur-[40px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* The Phone Shell */}
          <div className="absolute inset-0 rounded-[44px] border-[6px] border-gray-900 bg-[#121212] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
             
             {/* Notch / Dynamic Island */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-20 flex justify-center items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
             </div>

             {/* Phone Header (WhatsApp style) */}
             <div className="bg-[#1f2c34] px-4 pt-10 pb-3 flex items-center gap-3 shadow-md z-10">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
               </div>
               <div className="flex flex-col text-left">
                 <span className="text-white text-sm font-semibold">Assistente IA</span>
                 <span className="text-green-400 text-[10px] flex items-center gap-1">
                   ● online
                 </span>
               </div>
             </div>

             {/* Phone Chat Background (dark with subtle pattern) */}
             <div 
                className="flex-1 bg-[#0b141a] p-4 flex flex-col gap-3 overflow-hidden relative"
                style={{
                  backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.02\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
                }}
             >
                {/* Chat Messages */}
                <AnimatePresence>
                  {chatMessages.map((msg) => (
                    visibleMessages.includes(msg.id) && (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-sm relative ${
                          msg.isBot 
                            ? "bg-[#005c4b] text-[#e9edef] self-start rounded-tl-none border border-green-800/30" 
                            : "bg-[#202c33] text-[#e9edef] self-end rounded-tr-none border border-white/5"
                        }`}
                      >
                        {msg.text}
                        <div className="text-[9px] text-white/50 mt-1 flex justify-end items-center gap-1">
                          14:0{msg.id}
                          {msg.isBot && <CheckCheck className="w-3 h-3 text-sky-400" />}
                        </div>
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>
             </div>
             
             {/* Chat Input area */}
             <div className="bg-[#1f2c34] p-3 flex gap-2 items-center">
                <div className="flex-1 bg-[#2a3942] rounded-full h-9 px-4 flex items-center text-xs text-gray-400">
                  Mensagem...
                </div>
                <div className="w-9 h-9 bg-[#00a884] rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="16" height="16" className="fill-white"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
                </div>
             </div>

          </div>

          {/* Sparkles around phone that change per phrase */}
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={index}
              className="absolute -right-8 top-12 bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-xl z-30"
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
