import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, setToken } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login" ? { email: form.email, password: form.password } : form;
      const res = await api.post(path, payload);
      setToken(res.data.session_token);
      login(res.data.user, res.data.session_token);
      toast.success(mode === "login" ? "Welcome back" : "Account created");
      navigate(res.data.user.onboarding_complete ? "/" : "/onboarding");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] aegis-grid-bg text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] h-72 w-72 rounded-full bg-[#00E5FF]/10 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-5%] h-80 w-80 rounded-full bg-[#10B981]/10 blur-3xl" />
      <div className="relative z-10 min-h-screen flex flex-col md:items-center md:justify-center px-5 py-10">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="h-10 w-10 rounded-xl bg-[#00E5FF] flex items-center justify-center glow-cyan">
              <ShieldCheck size={22} className="text-[#0D1117]" />
            </div>
            <div>
              <p className="font-extrabold tracking-tight text-xl leading-none">AEGIS</p>
              <p className="text-[10px] text-[#8B949E] tracking-widest uppercase mt-0.5">Platform</p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-[#8B949E] mt-2 mb-8">
            {mode === "login" ? "Sign in to access AEGIS Core AI and your marketplace." : "Join AEGIS to match with the right services in seconds."}
          </p>

          <div className="glass rounded-2xl p-6" data-testid="auth-form">
            <Button
              type="button"
              onClick={handleGoogle}
              data-testid="google-login-button"
              className="w-full h-11 rounded-xl bg-white/[0.06] text-white border border-white/[0.10] hover:bg-white/[0.09] mb-4"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="mr-2"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </Button>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-white/[0.08]" />
              <span className="text-xs text-[#8B949E]">or</span>
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>

            <form onSubmit={submit} className="space-y-3">
              {mode === "register" && (
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                  <Input
                    data-testid="name-input"
                    required
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-11 pl-9 rounded-xl bg-white/[0.04] border-white/[0.10] text-white placeholder:text-[#8B949E]"
                  />
                </div>
              )}
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                <Input
                  data-testid="email-input"
                  type="email"
                  required
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-11 pl-9 rounded-xl bg-white/[0.04] border-white/[0.10] text-white placeholder:text-[#8B949E]"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                <Input
                  data-testid="password-input"
                  type="password"
                  required
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="h-11 pl-9 rounded-xl bg-white/[0.04] border-white/[0.10] text-white placeholder:text-[#8B949E]"
                />
              </div>
              <Button
                type="submit"
                data-testid="submit-auth-button"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#00E5FF] text-[#0D1117] font-semibold hover:brightness-110 glow-cyan"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : mode === "login" ? "Sign in" : "Create account"}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-[#8B949E] mt-6">
            {mode === "login" ? "New to AEGIS?" : "Already have an account?"}{" "}
            <button
              data-testid="toggle-auth-mode"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-[#00E5FF] hover:underline font-medium"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
