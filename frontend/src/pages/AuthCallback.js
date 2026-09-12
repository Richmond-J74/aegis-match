import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    const sessionId = match ? decodeURIComponent(match[1]) : null;
    if (!sessionId) {
      navigate("/login");
      return;
    }
    (async () => {
      try {
        const res = await api.post("/auth/google/session", { session_id: sessionId });
        setToken(res.data.session_token);
        login(res.data.user, res.data.session_token);
        // clear hash
        window.history.replaceState(null, "", window.location.pathname);
        navigate(res.data.user.onboarding_complete ? "/" : "/onboarding", { state: { user: res.data.user } });
      } catch (e) {
        navigate("/login");
      }
    })();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-[#00E5FF] flex items-center justify-center animate-pulse glow-cyan">
          <ShieldCheck className="text-[#0D1117]" size={24} />
        </div>
        <p className="text-sm text-[#8B949E]">Signing you in…</p>
      </div>
    </div>
  );
}
