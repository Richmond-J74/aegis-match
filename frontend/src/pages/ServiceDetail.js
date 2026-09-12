import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Clock, Check, ArrowLeft, MessageSquare, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import CategoryVisual from "@/components/CategoryVisual";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api.get(`/services/${id}`).then((r) => setService(r.data)).catch(() => toast.error("Service not found")).finally(() => setLoading(false));
  }, [id]);

  const startCheckout = async () => {
    setPaying(true);
    try {
      const res = await api.post("/payments/checkout", {
        service_id: id,
        tier_index: tier,
        origin_url: window.location.origin,
      });
      window.location.href = res.data.checkout_url;
    } catch (e) {
      toast.error("Could not start checkout");
      setPaying(false);
    }
  };

  const messageProvider = async () => {
    try {
      const res = await api.post("/conversations", {
        participant_id: service.provider_id,
        service_id: service.service_id,
        service_title: service.title,
      });
      navigate(`/messages/${res.data.conversation_id}`);
    } catch (e) {
      toast.error("Could not open chat");
    }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-56 rounded-2xl bg-white/[0.05]" /><Skeleton className="h-40 rounded-2xl bg-white/[0.05]" /></div>;
  if (!service) return null;

  const tiers = service.pricing_tiers || [];
  const selected = tiers[tier] || { price: service.price, name: "Standard", features: [], delivery_days: service.delivery_days };

  return (
    <div className="space-y-5" data-testid="service-detail">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#8B949E] hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="glass rounded-2xl overflow-hidden">
            <CategoryVisual category={service.category} className="h-48 w-full" iconSize={40} />
            <div className="p-5">
              <span className="text-xs text-[#00E5FF]">{service.category}</span>
              <h1 className="text-2xl font-bold mt-1">{service.title}</h1>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1"><Star size={15} className="text-[#fbbf24] fill-[#fbbf24]" /> {service.rating} <span className="text-[#8B949E]">({service.reviews_count} reviews)</span></span>
                <span className="flex items-center gap-1 text-[#8B949E]"><Clock size={15} /> {selected.delivery_days} days</span>
              </div>
              <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-white/[0.08]">
                <div className="h-9 w-9 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-semibold">{(service.provider_name || "P")[0]}</div>
                <div><p className="text-sm font-medium">{service.provider_name}</p><p className="text-xs text-[#8B949E]">Verified provider</p></div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <Tabs defaultValue="overview">
              <TabsList className="bg-white/[0.04] border border-white/[0.08]">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <p className="text-sm text-[#c9d1d9] leading-relaxed">{service.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {(service.tags || []).map((t) => (
                    <span key={t} className="rounded-full px-3 py-1 text-xs bg-white/[0.06] border border-white/[0.10] text-[#8B949E]">{t}</span>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="mt-4 space-y-3">
                {(service.reviews || []).map((r, i) => (
                  <div key={i} className="rounded-xl p-3 bg-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{r.author}</p>
                      <span className="flex items-center gap-1 text-xs"><Star size={12} className="text-[#fbbf24] fill-[#fbbf24]" /> {r.rating}</span>
                    </div>
                    <p className="text-sm text-[#8B949E] mt-1">{r.text}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Pricing panel */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5 lg:sticky lg:top-6">
            <p className="font-semibold mb-3">Choose a package</p>
            <div className="space-y-2.5">
              {tiers.map((t, i) => (
                <button
                  key={i}
                  data-testid={`pricing-tier-${i}`}
                  onClick={() => setTier(i)}
                  className={`w-full text-left rounded-xl p-3 border transition-[background-color,border-color] duration-200 ${
                    tier === i ? "bg-[#10B981]/10 border-[#10B981]/40" : "bg-white/[0.04] border-white/[0.10] hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{t.name}</span>
                    <span className="font-bold">${t.price}</span>
                  </div>
                  <p className="text-xs text-[#8B949E] mt-0.5">{t.description}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-1.5">
              {(selected.features || []).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[#c9d1d9]"><Check size={14} className="text-[#10B981]" /> {f}</div>
              ))}
            </div>
            <Button data-testid="checkout-button" onClick={() => setCheckoutOpen(true)} className="w-full h-11 rounded-xl bg-[#10B981] text-[#0D1117] font-semibold hover:brightness-110 glow-emerald mt-4">
              Continue · ${selected.price}
            </Button>
            <Button data-testid="message-provider-button" onClick={messageProvider} className="w-full h-11 rounded-xl bg-white/[0.06] text-white border border-white/[0.10] hover:bg-white/[0.09] mt-2">
              <MessageSquare size={16} className="mr-2" /> Message provider
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="bg-[#161B22] border-white/[0.08] text-white">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ShieldCheck size={18} className="text-[#00E5FF]" /> Secure Checkout</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl p-4 bg-white/[0.04]">
              <div className="flex justify-between text-sm"><span className="text-[#8B949E]">{service.title}</span></div>
              <div className="flex justify-between mt-2"><span className="text-sm">{selected.name} package</span><span className="font-bold">${selected.price}</span></div>
              <div className="flex justify-between mt-3 pt-3 border-t border-white/[0.08]"><span className="font-medium">Total</span><span className="font-bold text-[#10B981]">${selected.price}</span></div>
            </div>
            <p className="text-xs text-[#8B949E]">You'll be redirected to Stripe (test mode). Use card 4242 4242 4242 4242, any future expiry & CVC.</p>
            <Button data-testid="confirm-checkout-button" onClick={startCheckout} disabled={paying} className="w-full h-11 rounded-xl bg-[#10B981] text-[#0D1117] font-semibold hover:brightness-110 glow-emerald">
              {paying ? <Loader2 className="animate-spin" size={18} /> : `Pay $${selected.price}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
