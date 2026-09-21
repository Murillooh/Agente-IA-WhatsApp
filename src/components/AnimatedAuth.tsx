"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

export function AnimatedAuth({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [isAnimating, setIsAnimating] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSwitchMode = (toLogin: boolean) => {
    if (isAnimating || isLogin === toLogin) return;
    setError(null);
    setIsAnimating(true);
    // Switch the content halfway through the animation
    setTimeout(() => {
      setIsLogin(toLogin);
    }, 600);
    // End animation
    setTimeout(() => {
      setIsAnimating(false);
    }, 1200);
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
    router.push("/");
    router.refresh();
  };

  return (
    <div className="relative w-full h-full min-h-screen lg:min-h-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden font-sans">
      {/* Background with abstract golden/copper waves */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#b8860b] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#d2691e] rounded-full mix-blend-screen filter blur-[200px] opacity-20" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-[#facc15] rounded-full mix-blend-screen filter blur-[120px] opacity-10" />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center w-[450px]"
        initial={false}
      >
        {/* The Glass Container with Hexagon Animation */}
        <motion.div
          animate={
            isAnimating
              ? {
                  width: "240px",
                  height: "240px",
                  clipPath: [
                    "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // rectangle
                    "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)", // hexagon
                    "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)", // hexagon
                    "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // rectangle
                  ],
                  rotate: [0, 0, 180, 180],
                }
              : {
                  width: "100%",
                  height: isLogin ? "560px" : "680px",
                  clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                  rotate: 0,
                }
          }
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)]"
          style={{ transformOrigin: "center center" }}
        />

        {/* Form Content Wrapper */}
        <AnimatePresence mode="wait">
          {!isAnimating && (
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full px-10 py-12 flex flex-col z-20"
            >
              {isLogin ? (
                <form onSubmit={submitLogin} className="flex flex-col w-full h-full">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-semibold text-white tracking-tight mb-2">Bem-vindo de volta</h2>
                    <p className="text-sm text-gray-400">Insira seus dados para acessar sua conta com segurança</p>
                  </div>

                  <div className="space-y-5 flex-grow">
                    <div>
                      <label className="block text-xs text-gray-400 ml-1 mb-1.5">E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#facc15] focus:border-[#facc15] transition-all"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 ml-1 mb-1.5">Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#facc15] focus:border-[#facc15] transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded bg-white/5 border-white/10 text-[#facc15] focus:ring-[#facc15] focus:ring-offset-0" />
                        <span className="text-gray-400">Lembrar de mim</span>
                      </label>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">Esqueceu a senha?</a>
                    </div>
                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#facc15] to-[#d4af37] text-black font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {loading ? "Entrando..." : "Entrar"}
                      {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>



                    <p className="mt-6 text-center text-xs text-gray-400">
                      Não tem uma conta?{" "}
                      <button type="button" onClick={() => handleSwitchMode(false)} className="text-[#facc15] font-medium hover:underline">
                        Criar Conta
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={submitSignup} className="flex flex-col w-full h-full">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-semibold text-white tracking-tight mb-2">Criar Conta</h2>
                    <p className="text-sm text-gray-400">Preencha os dados abaixo para criar sua conta</p>
                  </div>

                  <div className="space-y-4 flex-grow">
                    <div>
                      <label className="block text-xs text-gray-400 ml-1 mb-1.5">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#facc15] focus:border-[#facc15] transition-all"
                          placeholder="Alan Johnson"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 ml-1 mb-1.5">E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#facc15] focus:border-[#facc15] transition-all"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 ml-1 mb-1.5">Senha</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#facc15] focus:border-[#facc15] transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 ml-1 mb-1.5">Confirmar Senha</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#facc15] focus:border-[#facc15] transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start text-xs mt-2 gap-2">
                      <input type="checkbox" required className="mt-0.5 rounded bg-white/5 border-white/10 text-[#facc15] focus:ring-[#facc15] focus:ring-offset-0" />
                      <span className="text-gray-400">Eu concordo com os Termos e Política de Privacidade</span>
                    </div>
                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#facc15] to-[#d4af37] text-black font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {loading ? "Criando Conta..." : "Criar Conta"}
                      {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>

                    <p className="mt-6 text-center text-xs text-gray-400">
                      Já tem uma conta?{" "}
                      <button type="button" onClick={() => handleSwitchMode(true)} className="text-[#facc15] font-medium hover:underline">
                        Entrar
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
