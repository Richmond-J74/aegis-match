import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Store, Sparkles, User, Plus, MessageSquare, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";

const NAV = [
  { to: "/", label: "Home", icon: Home, testid: "nav-home" },
  { to: "/marketplace", label: "Marketplace", icon: Store, testid: "nav-marketplace" },
  { to: "/assistant", label: "AEGIS", icon: Sparkles, testid: "nav-assistant" },
  { to: "/messages", label: "Messages", icon: MessageSquare, testid: "nav-messages" },
  { to: "/profile", label: "Profile", icon: User, testid: "nav-profile" },
];

function initials(name) {
  if (!name) return "AE";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [fabOpen, setFabOpen] = useState(false);

  const isActive = (to) => (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to));

  const doLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white aegis-grid-bg">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex-col z-40">
        <div className="h-full bg-white/[0.04] border-r border-white/[0.08] backdrop-blur-xl flex flex-col">
          <div className="px-5 py-6 flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#00E5FF] flex items-center justify-center glow-cyan">
              <ShieldCheck size={20} className="text-[#0D1117]" />
            </div>
            <div>
              <p className="font-extrabold tracking-tight text-lg leading-none">AEGIS</p>
              <p className="text-[10px] text-[#8B949E] tracking-widest uppercase mt-0.5">Platform</p>
            </div>
            <span className="ml-auto h-2 w-2 rounded-full bg-[#10B981]" />
          </div>
          <nav className="flex-1 px-3 space-y-1 mt-2">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = isActive(n.to);
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  data-testid={n.testid}
                  className={`rounded-xl px-3 py-2.5 text-sm flex items-center gap-3 transition-[background-color,color] duration-200 ${
                    active ? "bg-white/[0.08] text-white glow-cyan" : "text-[#8B949E] hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Icon size={18} strokeWidth={2} />
                  {n.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="p-3 border-t border-white/[0.08]">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/[0.04]">
              <div className="h-9 w-9 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-semibold">
                {initials(user?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-[11px] text-[#8B949E] capitalize">{user?.role}</p>
              </div>
              <button data-testid="logout-button-desktop" onClick={doLogout} className="text-[#8B949E] hover:text-white transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:pl-64 min-h-screen pb-28 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8">{children}</div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed z-50 right-4 bottom-[calc(88px+env(safe-area-inset-bottom))] md:bottom-6 md:right-6">
        <button
          data-testid="floating-action-button"
          aria-label="Quick actions"
          onClick={() => setFabOpen(true)}
          className="h-14 w-14 rounded-2xl bg-[#00E5FF] text-[#0D1117] flex items-center justify-center glow-cyan hover:brightness-110 active:scale-95 transition-[filter,transform] duration-200"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </div>

      <Drawer open={fabOpen} onOpenChange={setFabOpen}>
        <DrawerContent className="bg-[#161B22] border-white/[0.08] text-white">
          <DrawerHeader>
            <DrawerTitle className="text-white">Quick Actions</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-3 max-w-md mx-auto w-full">
            <button
              data-testid="fab-new-request"
              onClick={() => { setFabOpen(false); navigate("/requests/new"); }}
              className="w-full text-left rounded-2xl p-4 glass hover:bg-white/[0.09] transition-colors flex items-center gap-3"
            >
              <div className="h-11 w-11 rounded-xl bg-[#00E5FF]/15 flex items-center justify-center"><Plus className="text-[#00E5FF]" size={22} /></div>
              <div>
                <p className="font-semibold">New Service Request</p>
                <p className="text-xs text-[#8B949E]">Describe what you need and track it</p>
              </div>
            </button>
            <button
              data-testid="fab-ask-aegis"
              onClick={() => { setFabOpen(false); navigate("/assistant"); }}
              className="w-full text-left rounded-2xl p-4 glass hover:bg-white/[0.09] transition-colors flex items-center gap-3"
            >
              <div className="h-11 w-11 rounded-xl bg-[#10B981]/15 flex items-center justify-center"><Sparkles className="text-[#10B981]" size={22} /></div>
              <div>
                <p className="font-semibold">Ask AEGIS AI</p>
                <p className="text-xs text-[#8B949E]">Turn an idea into a service brief</p>
              </div>
            </button>
            <DrawerClose className="w-full rounded-xl py-3 text-sm text-[#8B949E] hover:text-white transition-colors">Cancel</DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
        <div className="mx-auto max-w-md rounded-2xl glass-strong px-2 py-1.5 flex items-center justify-between">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.to);
            return (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`${n.testid}-mobile`}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-2 flex-1"
              >
                <Icon size={20} strokeWidth={2} className={active ? "text-[#00E5FF]" : "text-[#8B949E]"} />
                <span className={`text-[10px] ${active ? "text-white" : "text-[#8B949E]"}`}>{n.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
