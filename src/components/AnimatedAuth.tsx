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
    <div className="relative min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden font-sans">
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
                    <h2 className="text-3xl font-semibold text-white tracking-tight mb-2">Welcome Back</h2>
                    <p className="text-sm text-gray-400">Please enter your details to access your secure account</p>
                  </div>

                  <div className="space-y-5 flex-grow">
                    <div>
                      <label className="block text-xs text-gray-400 ml-1 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#facc15] focus:border-[#facc15] transition-all"
                          placeholder="name@domain.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 ml-1 mb-1.5">Password</label>
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
                        <span className="text-gray-400">Remember me</span>
                      </label>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">Forgot password?</a>
                    </div>
                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#facc15] to-[#d4af37] text-black font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {loading ? "Signing In..." : "Sign In"}
                      {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>

                    <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
                      <div className="h-px bg-white/10 w-full" />
                      <span className="whitespace-nowrap">Or continue with</span>
                      <div className="h-px bg-white/10 w-full" />
                    </div>

                    <div className="mt-6 flex gap-4">
                      <button type="button" className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        <span className="text-sm font-medium text-white">Google</span>
                      </button>
                      <button type="button" className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" /></svg>
                        <span className="text-sm font-medium text-white">Apple</span>
                      </button>
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-400">
                      Don't have an account?{" "}
                      <button type="button" onClick={() => handleSwitchMode(false)} className="text-[#facc15] font-medium hover:underline">
                        Sign Up
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={submitSignup} className="flex flex-col w-full h-full">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-semibold text-white tracking-tight mb-2">Create Account</h2>
                    <p className="text-sm text-gray-400">Please fill the details below to create your workspace</p>
                  </div>

                  <div className="space-y-4 flex-grow">
                    <div>
                      <label className="block text-xs text-gray-400 ml-1 mb-1.5">Full Name</label>
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
                      <label className="block text-xs text-gray-400 ml-1 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#facc15] focus:border-[#facc15] transition-all"
                          placeholder="name@domain.com"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 ml-1 mb-1.5">Password</label>
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
                        <label className="block text-xs text-gray-400 ml-1 mb-1.5">Confirm Password</label>
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
                      <span className="text-gray-400">I agree to the Terms & Privacy Policy</span>
                    </div>
                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#facc15] to-[#d4af37] text-black font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                      {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>

                    <p className="mt-6 text-center text-xs text-gray-400">
                      Already have an account?{" "}
                      <button type="button" onClick={() => handleSwitchMode(true)} className="text-[#facc15] font-medium hover:underline">
                        Sign In
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
