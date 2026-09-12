import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) { setStatus("error"); return; }
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const r = await api.get(`/payments/status/${sessionId}`);
        if (r.data.payment_status === "paid") { setStatus("paid"); return; }
        if (["expired", "failed"].includes(r.data.payment_status)) { setStatus("error"); return; }
      } catch (e) {}
      if (attempts < 8) setTimeout(poll, 1600);
      else setStatus("pending");
    };
    poll();
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center" data-testid="payment-success">
        {status === "checking" && (<><Loader2 size={40} className="animate-spin text-[#00E5FF] mx-auto mb-4" /><p className="font-semibold">Confirming your payment…</p><p className="text-sm text-[#8B949E] mt-1">This only takes a moment.</p></>)}
        {status === "paid" && (<><div className="h-16 w-16 rounded-2xl bg-[#10B981]/15 flex items-center justify-center mx-auto mb-4 glow-emerald"><CheckCircle2 size={34} className="text-[#10B981]" /></div><h1 className="text-2xl font-bold">Payment successful</h1><p className="text-sm text-[#8B949E] mt-2">Your order is now active. You can track it from your dashboard.</p><div className="flex gap-3 mt-6"><Button onClick={() => navigate("/")} className="flex-1 h-11 rounded-xl bg-[#00E5FF] text-[#0D1117] font-semibold hover:brightness-110">Go to dashboard</Button><Button onClick={() => navigate("/profile")} className="flex-1 h-11 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white hover:bg-white/[0.09]">View orders</Button></div></>)}
        {status === "pending" && (<><Loader2 size={40} className="animate-spin text-[#fbbf24] mx-auto mb-4" /><p className="font-semibold">Still processing</p><p className="text-sm text-[#8B949E] mt-1">Your payment is being finalized. Check your dashboard shortly.</p><Button onClick={() => navigate("/")} className="mt-6 h-11 px-6 rounded-xl bg-[#00E5FF] text-[#0D1117] font-semibold">Go to dashboard</Button></>)}
        {status === "error" && (<><div className="h-16 w-16 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto mb-4"><XCircle size={34} className="text-red-400" /></div><h1 className="text-xl font-bold">Payment not confirmed</h1><p className="text-sm text-[#8B949E] mt-2">Something went wrong. Please try again.</p><Button onClick={() => navigate("/marketplace")} className="mt-6 h-11 px-6 rounded-xl bg-[#00E5FF] text-[#0D1117] font-semibold">Back to marketplace</Button></>)}
      </div>
    </div>
  );
}
