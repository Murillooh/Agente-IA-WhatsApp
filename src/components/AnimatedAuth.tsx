"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

export function AnimatedAuth({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(initialMode === "login");

  // Form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSwitchMode = (toLogin: boolean) => {
    if (isLogin === toLogin) return;
    setError(null);
    setSuccessMsg(null);
    setIsLogin(toLogin);
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível entrar.");
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  };

  const submitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (password !== confirmPassword) {
      setError("As senhas não são iguais.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível criar a conta.");
      setLoading(false);
      return;
    }

    const data = await res.json().catch(() => null);
    if (data?.message) {
      setSuccessMsg(data.message);
      setLoading(false);
      setName("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="relative w-full h-full min-h-screen lg:min-h-full bg-[#050505] flex items-center justify-center overflow-hidden font-sans">
      {/* Background with abstract dark golden waves/glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#d4af37] rounded-full mix-blend-screen blur-[180px] opacity-15 animate-pulse" />
        <div className="absolute top-1/2 right-[-20%] w-[800px] h-[800px] bg-[#facc15] rounded-full mix-blend-screen blur-[250px] opacity-10" />
        {/* Subtle metallic wave effect via radial gradient */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ background: "radial-gradient(circle at 80% 50%, rgba(255,215,0,0.08) 0%, rgba(0,0,0,0) 50%)" }} />
        <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ background: "radial-gradient(circle at 20% 80%, rgba(218,165,32,0.1) 0%, rgba(0,0,0,0) 40%)" }} />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center w-[480px] px-4 sm:px-0"
        initial={false}
      >
        {/* The Glass Container */}
        <motion.div
          animate={{
            width: "100%",
            height: isLogin ? "480px" : "660px",
          }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className="absolute inset-0 bg-[#121212]/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-[24px]"
        >
           {/* Top-Left Sci-Fi Corner */}
           <div 
             className="absolute -top-[1px] -left-[1px] w-14 h-14 bg-white/[0.03] backdrop-blur-3xl border-t border-l border-white/30 z-20"
             style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)", borderTopLeftRadius: "24px" }}
           />
           {/* Bottom-Right Sci-Fi Corner */}
           <div 
             className="absolute -bottom-[1px] -right-[1px] w-14 h-14 bg-white/[0.03] backdrop-blur-3xl border-b border-r border-white/30 z-20"
             style={{ clipPath: "polygon(100% 100%, 0 100%, 100% 0)", borderBottomRightRadius: "24px" }}
           />
        </motion.div>

        {/* Form Content Wrapper */}
        <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full px-12 py-10 flex flex-col z-30"
            >
              {isLogin ? (
                <form onSubmit={submitLogin} className="flex flex-col w-full h-full">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                      Bem-vindo <span className="text-[#facc15]">de volta</span>
                    </h2>
                    <p className="text-xs text-gray-400 font-medium tracking-wide">Insira suas credenciais para acessar sua conta com segurança</p>
                  </div>

                  <div className="space-y-5 flex-grow">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 ml-1 mb-1.5">Endereço de E-mail</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#facc15] transition-colors" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-[#1a1a1a]/60 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#facc15] focus:border-[#facc15] transition-all"
                          placeholder="nome@dominio.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 ml-1 mb-1.5">Senha</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#facc15] transition-colors" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#1a1a1a]/60 border border-white/5 rounded-xl py-3 pl-11 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#facc15] focus:border-[#facc15] transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-3">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center w-4 h-4 rounded border border-white/20 bg-[#1a1a1a] group-hover:border-[#facc15] transition-colors">
                          <input type="checkbox" className="peer sr-only" />
                          <div className="absolute inset-0 rounded bg-[#facc15] scale-0 peer-checked:scale-100 transition-transform flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-3 h-3 text-black stroke-black stroke-[3] fill-none stroke-linecap-round stroke-linejoin-round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                        </div>
                        <span className="text-gray-400 font-medium">Lembrar de mim</span>
                      </label>
                      <a href="#" className="text-gray-400 font-medium hover:text-white transition-colors">Esqueceu a senha?</a>
                    </div>
                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                    {successMsg && <p className="text-xs text-emerald-400 text-center">{successMsg}</p>}
                  </div>

                  <div className="mt-8 flex flex-col gap-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#facc15] to-[#eab308] text-black font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 hover:brightness-110 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all disabled:opacity-50"
                    >
                      {loading ? "Entrando..." : "Entrar"}
                      {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>



                    <p className="mt-2 text-center text-xs font-medium text-gray-400">
                      Não tem uma conta?{" "}
                      <button type="button" onClick={() => handleSwitchMode(false)} className="text-[#facc15] hover:underline">
                        Cadastre-se
                      </button>
                    </p>

                    <div className="mt-8 text-center">
                      <p className="text-[11px] text-gray-500/80 font-medium flex items-center justify-center gap-1.5">
                        <Lock className="w-3 h-3" /> Ambiente seguro e criptografado
                      </p>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={submitSignup} className="flex flex-col w-full h-full">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                      Criar <span className="text-[#facc15]">Conta</span>
                    </h2>
                    <p className="text-xs text-gray-400 font-medium tracking-wide">Preencha os dados abaixo para começar</p>
                  </div>

                  <div className="space-y-4 flex-grow">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 ml-1 mb-1.5">Nome Completo</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#facc15] transition-colors" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[#1a1a1a]/60 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#facc15] focus:border-[#facc15] transition-all"
                          placeholder="Alan Johnson"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 ml-1 mb-1.5">Endereço de E-mail</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#facc15] transition-colors" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-[#1a1a1a]/60 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#facc15] focus:border-[#facc15] transition-all"
                          placeholder="nome@dominio.com"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-300 ml-1 mb-1.5">Senha</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#facc15] transition-colors" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#1a1a1a]/60 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#facc15] focus:border-[#facc15] transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-300 ml-1 mb-1.5">Confirmar Senha</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#facc15] transition-colors" />
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#1a1a1a]/60 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#facc15] focus:border-[#facc15] transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start mt-3 gap-2 group cursor-pointer">
                        <div className="relative flex items-center justify-center w-4 h-4 rounded border border-white/20 bg-[#1a1a1a] group-hover:border-[#facc15] transition-colors mt-0.5 shrink-0">
                          <input type="checkbox" required className="peer sr-only" />
                          <div className="absolute inset-0 rounded bg-[#facc15] scale-0 peer-checked:scale-100 transition-transform flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-3 h-3 text-black stroke-black stroke-[3] fill-none stroke-linecap-round stroke-linejoin-round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                        </div>
                      <span className="text-gray-400 font-medium text-xs leading-relaxed">Eu concordo com os Termos e Política de Privacidade</span>
                    </label>
                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                    {successMsg && <p className="text-xs text-emerald-400 text-center">{successMsg}</p>}
                  </div>

                  <div className="mt-8 flex flex-col gap-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#facc15] to-[#eab308] text-black font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 hover:brightness-110 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all disabled:opacity-50"
                    >
                      {loading ? "Criando Conta..." : "Cadastrar"}
                      {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>



                    <p className="mt-2 text-center text-xs font-medium text-gray-400">
                      Já tem uma conta?{" "}
                      <button type="button" onClick={() => handleSwitchMode(true)} className="text-[#facc15] hover:underline">
                        Entrar
                      </button>
                    </p>

                    <div className="mt-8 text-center">
                      <p className="text-[11px] text-gray-500/80 font-medium flex items-center justify-center gap-1.5">
                        <Lock className="w-3 h-3" /> Ambiente seguro e criptografado
                      </p>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
