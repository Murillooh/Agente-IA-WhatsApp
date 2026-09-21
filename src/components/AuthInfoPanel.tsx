"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Zap, CalendarCheck, Sparkles, Check, CheckCheck } from "lucide-react";

const chatMessages = [
  { id: 1, text: "Olá, queria saber como funciona a plataforma.", isBot: false },
  { id: 2, text: "Olá! A nossa IA automatiza suas vendas no WhatsApp 24h por dia.", isBot: true },
  { id: 3, text: "Isso parece ótimo. Posso ver uma demo?", isBot: false },
  { id: 4, text: "Claro! Acabei de reservar um horário para você amanhã. 🚀", isBot: true }
];

export function AuthInfoPanel() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

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
        
        {/* Floating iPhone Mockup */}
        <motion.div
          className="relative w-[280px] h-[580px] mb-12"
          animate={{
            y: ["-8px", "8px", "-8px"],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Subtle glow behind the phone */}
          <motion.div 
            className="absolute inset-4 rounded-[50px] bg-green-500/20 blur-[40px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* iPhone Hardware Buttons */}
          <div className="absolute -left-[3px] top-[110px] w-[3px] h-[26px] bg-[#3a3a3c] rounded-l-md border border-r-0 border-[#5a5a5c]" /> {/* Mute Switch */}
          <div className="absolute -left-[3px] top-[160px] w-[3px] h-[50px] bg-[#3a3a3c] rounded-l-md border border-r-0 border-[#5a5a5c]" /> {/* Volume Up */}
          <div className="absolute -left-[3px] top-[225px] w-[3px] h-[50px] bg-[#3a3a3c] rounded-l-md border border-r-0 border-[#5a5a5c]" /> {/* Volume Down */}
          <div className="absolute -right-[3px] top-[180px] w-[3px] h-[75px] bg-[#3a3a3c] rounded-r-md border border-l-0 border-[#5a5a5c]" /> {/* Power Button */}

          {/* iPhone Shell */}
          <div className="absolute inset-0 rounded-[50px] border-[8px] border-[#1c1c1e] bg-[#000000] overflow-hidden shadow-[inset_0_0_2px_rgba(255,255,255,0.4),0_20px_50px_rgba(0,0,0,0.5)] flex flex-col ring-1 ring-white/10">
             
             {/* Status Bar & Dynamic Island */}
             <div className="absolute top-0 left-0 right-0 h-12 z-30 flex justify-between items-center px-6 pointer-events-none">
                <span className="text-white text-[11px] font-semibold mt-1">9:41</span>
                {/* Dynamic Island */}
                <div className="absolute left-1/2 -translate-x-1/2 top-2 w-[90px] h-[28px] bg-black rounded-full flex items-center justify-end px-2">
                  {/* Camera lens reflection */}
                  <div className="w-[10px] h-[10px] rounded-full bg-[#111] border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-[1px]"></div>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-1">
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                </div>
             </div>

             {/* Phone Header (iMessage style) */}
             <div className="bg-[#1c1c1e]/80 backdrop-blur-md px-4 pt-12 pb-2 flex flex-col items-center z-10 relative border-b border-white/10">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mb-1">
                  <Sparkles className="w-5 h-5 text-white" />
               </div>
               <div className="flex items-center gap-1">
                 <span className="text-white text-[13px] font-semibold">Assistente IA</span>
                 <svg viewBox="0 0 24 24" className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
               </div>
             </div>

             {/* Phone Chat Background (iMessage dark mode) */}
             <div className="flex-1 bg-black p-3 flex flex-col gap-3 overflow-hidden relative pt-6">
                {/* Chat Messages */}
                <AnimatePresence>
                  {chatMessages.map((msg) => {
                    const isLeft = msg.isBot;
                    return visibleMessages.includes(msg.id) && (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className={`max-w-[75%] px-4 py-2.5 text-[14px] leading-relaxed relative ${
                          isLeft 
                            ? "bg-[#262628] text-white self-start rounded-2xl rounded-bl-sm" 
                            : "bg-[#0a84ff] text-white self-end rounded-2xl rounded-br-sm"
                        }`}
                      >
                        {msg.text}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
             </div>
             
             {/* Chat Input area (iMessage style) */}
             <div className="bg-black px-3 py-3 flex gap-3 items-end pb-8">
                <div className="text-[#0a84ff] pb-1.5 shrink-0">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <div className="flex-1 bg-[#1c1c1e] rounded-full min-h-[36px] px-4 py-1.5 flex items-center justify-between border border-white/10">
                  <span className="text-[14px] text-gray-500">iMessage</span>
                  <div className="w-7 h-7 bg-[#0a84ff] rounded-full flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                  </div>
                </div>
             </div>
             
             {/* iPhone Home Indicator */}
             <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/50 rounded-full z-20"></div>

          </div>

        </motion.div>
      </div>
    </div>
  );
}
