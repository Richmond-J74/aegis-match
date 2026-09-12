import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, CheckCircle2, FileText, Wallet, Sparkles, ArrowUpRight, Plus, Clock } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import CategoryVisual from "@/components/CategoryVisual";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_STYLE = {
  pending: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/30",
  active: "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30",
  completed: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30",
};

function MetricCard({ icon: Icon, label, value, accent }) {
  return (
    <div data-testid="dashboard-metric-card" className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center`} style={{ background: `${accent}1a` }}>
          <Icon size={20} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-3xl font-bold mt-3">{value}</p>
      <p className="text-xs text-[#8B949E] mt-1">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/summary").then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const chartData = [
    { d: "Mon", v: 4 }, { d: "Tue", v: 7 }, { d: "Wed", v: 5 },
    { d: "Thu", v: 9 }, { d: "Fri", v: 6 }, { d: "Sat", v: 11 }, { d: "Sun", v: 8 },
  ];

  const m = data?.metrics || {};

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[#8B949E] text-sm">Welcome back</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{user?.name?.split(" ")[0] || "there"}</h1>
        </div>
        <button
          data-testid="dashboard-ask-aegis"
          onClick={() => navigate("/assistant")}
          className="hidden sm:flex items-center gap-2 rounded-xl px-4 h-11 bg-[#00E5FF] text-[#0D1117] font-semibold hover:brightness-110 glow-cyan transition-[filter] duration-200"
        >
          <Sparkles size={18} /> Ask AEGIS
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl bg-white/[0.05]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard icon={Package} label="Active orders" value={m.active_orders ?? 0} accent="#00E5FF" />
          <MetricCard icon={CheckCircle2} label="Completed" value={m.completed_orders ?? 0} accent="#10B981" />
          <MetricCard icon={FileText} label="Open requests" value={m.open_requests ?? 0} accent="#fbbf24" />
          <MetricCard icon={Wallet} label="Total spent" value={`$${m.total_spent ?? 0}`} accent="#60a5fa" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">Activity</p>
              <p className="text-xs text-[#8B949E]">Your engagement this week</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-[#10B981]"><ArrowUpRight size={14} /> +18%</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" tick={{ fill: "#8B949E", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#161B22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
                <Area type="monotone" dataKey="v" stroke="#00E5FF" strokeWidth={2} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="font-semibold mb-4">Quick actions</p>
          <div className="space-y-3">
            <button data-testid="quick-new-request" onClick={() => navigate("/requests/new")} className="w-full flex items-center gap-3 rounded-xl p-3 bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-left">
              <div className="h-9 w-9 rounded-lg bg-[#00E5FF]/15 flex items-center justify-center"><Plus size={18} className="text-[#00E5FF]" /></div>
              <span className="text-sm">New service request</span>
            </button>
            <button data-testid="quick-browse" onClick={() => navigate("/marketplace")} className="w-full flex items-center gap-3 rounded-xl p-3 bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-left">
              <div className="h-9 w-9 rounded-lg bg-[#10B981]/15 flex items-center justify-center"><Package size={18} className="text-[#10B981]" /></div>
              <span className="text-sm">Browse marketplace</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <p className="font-semibold mb-4">Active orders</p>
          {(!data?.active_orders || data.active_orders.length === 0) ? (
            <div data-testid="empty-state" className="text-center py-8">
              <Package size={28} className="mx-auto text-[#8B949E] mb-2" />
              <p className="text-sm text-[#8B949E]">No active orders yet</p>
              <button onClick={() => navigate("/marketplace")} className="mt-3 text-sm text-[#00E5FF] hover:underline">Explore services</button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.active_orders.map((o) => (
                <div key={o.order_id} className="flex items-center gap-3 rounded-xl p-3 bg-white/[0.04]">
                  <CategoryVisual category="" className="h-10 w-10 rounded-lg" iconSize={16} />
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
          <p className="font-semibold mb-4">Recent requests</p>
          {(!data?.recent_requests || data.recent_requests.length === 0) ? (
            <div data-testid="empty-state" className="text-center py-8">
              <FileText size={28} className="mx-auto text-[#8B949E] mb-2" />
              <p className="text-sm text-[#8B949E]">No requests yet</p>
              <button onClick={() => navigate("/requests/new")} className="mt-3 text-sm text-[#00E5FF] hover:underline">Create a request</button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recent_requests.map((r) => (
                <div key={r.request_id} className="flex items-center gap-3 rounded-xl p-3 bg-white/[0.04]">
                  <div className="h-10 w-10 rounded-lg bg-white/[0.06] flex items-center justify-center"><Clock size={16} className="text-[#8B949E]" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    <p className="text-xs text-[#8B949E]">{r.category}</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full border border-[#fbbf24]/30 text-[#fbbf24] bg-[#fbbf24]/10 capitalize">{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
