import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancel() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center" data-testid="payment-cancel">
        <div className="h-16 w-16 rounded-2xl bg-white/[0.06] flex items-center justify-center mx-auto mb-4"><XCircle size={34} className="text-[#8B949E]" /></div>
        <h1 className="text-xl font-bold">Checkout canceled</h1>
        <p className="text-sm text-[#8B949E] mt-2">No charge was made. You can pick up where you left off anytime.</p>
        <Button onClick={() => navigate("/marketplace")} className="mt-6 h-11 px-6 rounded-xl bg-[#00E5FF] text-[#0D1117] font-semibold hover:brightness-110">Back to marketplace</Button>
      </div>
    </div>
  );
}
