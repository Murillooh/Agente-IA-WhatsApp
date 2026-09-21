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
    <div className="relative hidden overflow-hidden bg-[#020617] lg:flex lg:flex-col lg:justify-center lg:items-center lg:px-14 lg:py-12">
      {/* Animated Deep Brand Gradient Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#020617] to-black"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />
      
      {/* Noise texture overlay for premium feel */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient glowing orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.2, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-lg">
        
        {/* Floating iPhone Mockup */}
        <motion.div
          className="relative w-[340px] h-[700px] mb-12"
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

             {/* Phone Header (WhatsApp iOS style) */}
             <div className="bg-[#111111] px-4 pt-12 pb-2 flex items-center justify-between z-10 relative border-b border-white/5">
               <div className="flex items-center gap-2">
                 <div className="flex items-center text-[#0a84ff]">
                   <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                   <span className="text-[17px] font-medium -ml-1">81</span>
                 </div>
                 <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 ml-1">
                    <Sparkles className="w-4 h-4 text-white" />
                 </div>
                 <span className="text-white text-[16px] font-semibold ml-1">Assistente IA</span>
               </div>
               <div className="flex items-center gap-4 text-[#0a84ff]">
                 <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.6 11.6L22 7v10l-6.4-4.6v-1.8zM2 9c0-1.1.9-2 2-2h9c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V9z"/></svg>
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
               </div>
             </div>

             {/* Phone Chat Background (WhatsApp iOS dark mode) */}
             <div 
                className="flex-1 bg-[#0b141a] p-3 flex flex-col gap-1.5 overflow-hidden relative"
                style={{
                  backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.02\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
                }}
             >
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
                        className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-[15px] shadow-[0_1px_1px_rgba(0,0,0,0.1)] relative ${
                          isLeft 
                            ? "bg-[#202427] text-[#e9edef] self-start rounded-tl-sm" 
                            : "bg-[#005c8a] text-white self-end rounded-tr-sm"
                        }`}
                      >
                        {/* iOS style tails */}
                        {isLeft ? (
                           <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -left-[7px] text-[#202427] fill-current"><path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path></svg>
                        ) : (
                           <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -right-[7px] text-[#005c8a] fill-current"><path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path></svg>
                        )}
                        
                        <div className="flex flex-col">
                          <span className="leading-snug">{msg.text}</span>
                          <div className="text-[11px] text-white/60 flex justify-end items-center gap-1 -mt-1 float-right self-end translate-y-1">
                            14:0{msg.id}
                            {!isLeft && <CheckCheck className="w-4 h-4 text-[#34B7F1]" />}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
             </div>
             
             {/* Chat Input area (WhatsApp iOS style) */}
             <div className="bg-[#111111] px-2 py-2 flex items-end gap-3 pb-8">
                <button className="text-[#0a84ff] p-1.5 shrink-0">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                </button>
                <div className="flex-1 bg-[#1c1c1e] rounded-full min-h-[36px] border border-white/10 px-3 py-1 flex items-center justify-between">
                  <span className="text-[16px] text-gray-500 whitespace-nowrap overflow-hidden"></span>
                  <div className="shrink-0 text-gray-400">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-[#0a84ff] p-1.5 pb-2">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
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
