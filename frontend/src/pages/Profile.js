import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, Package, Store, Plus, Settings, ChevronRight, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

function initials(name) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const STATUS_STYLE = {
  pending: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/30",
  active: "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30",
  completed: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30",
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [notif, setNotif] = useState(user?.notifications || { email: true, push: true, sms: false });

  useEffect(() => {
    api.get("/orders").then((r) => setOrders(r.data)).catch(() => {});
  }, []);

  const doLogout = async () => { await logout(); navigate("/login"); };

  const updateNotif = async (key, val) => {
    const updated = { ...notif, [key]: val };
    setNotif(updated);
    try {
      const res = await api.post("/auth/onboarding", { role: user.role, interests: user.interests || [], notifications: updated });
      setUser(res.data);
      toast.success("Preferences updated");
    } catch (e) { toast.error("Could not update"); }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

      <div className="glass rounded-2xl p-5 flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-white/[0.08] flex items-center justify-center text-xl font-bold">{initials(user?.name)}</div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold truncate">{user?.name}</p>
          <p className="text-sm text-[#8B949E] truncate">{user?.email}</p>
          <span className="inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] capitalize"><ShieldCheck size={12} /> {user?.role}</span>
        </div>
      </div>

      {user?.role === "provider" && (
        <button data-testid="create-listing-button" onClick={() => navigate("/provider/new")} className="w-full glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.09] transition-colors text-left">
          <div className="h-11 w-11 rounded-xl bg-[#10B981]/15 flex items-center justify-center"><Plus size={20} className="text-[#10B981]" /></div>
          <div className="flex-1"><p className="font-semibold">Create a service listing</p><p className="text-xs text-[#8B949E]">Publish a new service to the marketplace</p></div>
          <ChevronRight size={18} className="text-[#8B949E]" />
        </button>
      )}

      <div className="glass rounded-2xl p-5">
        <p className="font-semibold mb-4 flex items-center gap-2"><Package size={18} className="text-[#00E5FF]" /> Order history</p>
        {orders.length === 0 ? (
          <div data-testid="empty-state" className="text-center py-8">
            <Store size={26} className="mx-auto text-[#8B949E] mb-2" />
            <p className="text-sm text-[#8B949E]">No orders yet</p>
            <button onClick={() => navigate("/marketplace")} className="mt-2 text-sm text-[#00E5FF] hover:underline">Browse services</button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {orders.map((o) => (
              <div key={o.order_id} className="flex items-center gap-3 rounded-xl p-3 bg-white/[0.04]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{o.service_title}</p>
                  <p className="text-xs text-[#8B949E]">${o.amount} · {o.tier_name}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full border capitalize ${STATUS_STYLE[o.status] || STATUS_STYLE.pending}`}>{o.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-5">
        <p className="font-semibold mb-4 flex items-center gap-2"><Settings size={18} className="text-[#00E5FF]" /> Notifications</p>
        <div className="space-y-3">
          {[{ id: "email", label: "Email updates" }, { id: "push", label: "Push notifications" }, { id: "sms", label: "SMS alerts" }].map((n) => (
            <div key={n.id} className="flex items-center justify-between">
              <span className="text-sm">{n.label}</span>
              <Switch data-testid={`profile-notif-${n.id}`} checked={!!notif[n.id]} onCheckedChange={(v) => updateNotif(n.id, v)} />
            </div>
          ))}
        </div>
      </div>

      <Button data-testid="logout-button" onClick={doLogout} className="w-full h-11 rounded-xl bg-white/[0.06] text-white border border-white/[0.10] hover:bg-red-500/10 hover:border-red-400/30 transition-[background-color,border-color] duration-200">
        <LogOut size={16} className="mr-2" /> Sign out
      </Button>
    </div>
  );
}
