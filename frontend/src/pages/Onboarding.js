import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Briefcase, UserRound, Bell, Check, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setUser, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("client");
  const [interests, setInterests] = useState([]);
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false });
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
    if (user?.onboarding_complete) navigate("/");
  }, [user, loading, navigate]);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const toggleInterest = (c) =>
    setInterests((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const finish = async () => {
    setSaving(true);
    try {
      const res = await api.post("/auth/onboarding", { role, interests, notifications });
      setUser(res.data);
      toast.success("You're all set!");
      navigate("/");
    } catch (e) {
      toast.error("Could not save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] aegis-grid-bg text-white px-5 py-10">
      <div className="max-w-lg mx-auto" data-testid="onboarding-survey">
        <p className="text-xs text-[#8B949E] uppercase tracking-widest mb-2">Step {step} of 3</p>
        <Progress value={(step / 3) * 100} className="h-1.5 bg-white/[0.08] mb-8" />

        {step === 1 && (
          <div className="animate-fade-up">
            <h1 className="text-2xl font-bold mb-1">How will you use AEGIS?</h1>
            <p className="text-[#8B949E] mb-6">Pick the role that fits you best.</p>
            <div className="space-y-3">
              {[
                { id: "client", title: "I'm a Client", desc: "I want to find and hire services", icon: UserRound },
                { id: "provider", title: "I'm a Provider", desc: "I want to offer and sell my services", icon: Briefcase },
              ].map((r) => {
                const Icon = r.icon;
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    data-testid={`role-${r.id}`}
                    onClick={() => setRole(r.id)}
                    className={`w-full text-left rounded-2xl p-4 flex items-center gap-4 border transition-[background-color,border-color] duration-200 ${
                      active ? "bg-[#00E5FF]/10 border-[#00E5FF]/40" : "glass border-white/[0.08] hover:bg-white/[0.08]"
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${active ? "bg-[#00E5FF]/20" : "bg-white/[0.06]"}`}>
                      <Icon className={active ? "text-[#00E5FF]" : "text-white"} size={22} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-sm text-[#8B949E]">{r.desc}</p>
                    </div>
                    {active && <Check className="text-[#00E5FF]" size={20} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-up">
            <h1 className="text-2xl font-bold mb-1">Pick your interests</h1>
            <p className="text-[#8B949E] mb-6">We'll personalize your marketplace and matches.</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const active = interests.includes(c);
                return (
                  <button
                    key={c}
                    data-testid={`interest-${c}`}
                    onClick={() => toggleInterest(c)}
                    className={`rounded-full px-4 py-2 text-sm border transition-[background-color,border-color,color] duration-200 ${
                      active ? "bg-[#00E5FF]/15 text-white border-[#00E5FF]/40" : "bg-white/[0.06] text-[#8B949E] border-white/[0.10] hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-up">
            <h1 className="text-2xl font-bold mb-1">Notifications</h1>
            <p className="text-[#8B949E] mb-6">Choose how AEGIS keeps you updated.</p>
            <div className="space-y-3">
              {[
                { id: "email", label: "Email updates", desc: "Order status and important alerts" },
                { id: "push", label: "Push notifications", desc: "Real-time messages and matches" },
                { id: "sms", label: "SMS alerts", desc: "Critical updates via text" },
              ].map((n) => (
                <div key={n.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex items-center justify-center"><Bell size={18} className="text-[#00E5FF]" /></div>
                  <div className="flex-1">
                    <p className="font-medium">{n.label}</p>
                    <p className="text-xs text-[#8B949E]">{n.desc}</p>
                  </div>
                  <Switch
                    data-testid={`notif-${n.id}`}
                    checked={notifications[n.id]}
                    onCheckedChange={(v) => setNotifications({ ...notifications, [n.id]: v })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-8">
          {step > 1 && (
            <Button data-testid="onboarding-back" onClick={() => setStep(step - 1)} className="h-11 px-4 rounded-xl bg-white/[0.06] text-white border border-white/[0.10] hover:bg-white/[0.09]">
              <ArrowLeft size={16} className="mr-1" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button data-testid="onboarding-next" onClick={() => setStep(step + 1)} className="flex-1 h-11 rounded-xl bg-[#00E5FF] text-[#0D1117] font-semibold hover:brightness-110 glow-cyan">
              Continue <ArrowRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button data-testid="onboarding-finish" disabled={saving} onClick={finish} className="flex-1 h-11 rounded-xl bg-[#10B981] text-[#0D1117] font-semibold hover:brightness-110 glow-emerald">
              {saving ? <Loader2 className="animate-spin" size={18} /> : "Enter AEGIS"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
