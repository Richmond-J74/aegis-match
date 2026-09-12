import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Loader2, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RequestBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", category: "", brief: "", budget: "", timeline: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
    if (location.state?.prefill) setForm((f) => ({ ...f, ...location.state.prefill }));
  }, [location.state]);

  const submit = async () => {
    if (!form.title || !form.category || !form.brief) {
      toast.error("Please fill in title, category and brief");
      return;
    }
    setSaving(true);
    try {
      await api.post("/requests", {
        title: form.title,
        category: form.category,
        brief: form.brief,
        budget: form.budget ? parseFloat(form.budget) : null,
        timeline: form.timeline || null,
      });
      toast.success("Service request created");
      navigate("/");
    } catch (e) {
      toast.error("Could not create request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#8B949E] hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back
      </button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><FileText size={22} className="text-[#00E5FF]" /> New Service Request</h1>
        <p className="text-[#8B949E] text-sm mt-1">Describe what you need. AEGIS can help you shape it.</p>
      </div>

      <div className="glass rounded-2xl p-5 space-y-4" data-testid="request-builder">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input data-testid="request-title" placeholder="e.g. Logo for my coffee shop" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5 h-11 rounded-xl bg-white/[0.04] border-white/[0.10] text-white placeholder:text-[#8B949E]" />
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger data-testid="request-category" className="mt-1.5 h-11 rounded-xl bg-white/[0.04] border-white/[0.10] text-white"><SelectValue placeholder="Select a category" /></SelectTrigger>
            <SelectContent className="bg-[#161B22] border-white/[0.1] text-white">
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Brief</label>
          <Textarea data-testid="request-brief" placeholder="Describe scope, goals, and any details…" value={form.brief} onChange={(e) => setForm({ ...form, brief: e.target.value })} className="mt-1.5 min-h-[120px] rounded-xl bg-white/[0.04] border-white/[0.10] text-white placeholder:text-[#8B949E]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Budget ($)</label>
            <Input data-testid="request-budget" type="number" placeholder="500" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="mt-1.5 h-11 rounded-xl bg-white/[0.04] border-white/[0.10] text-white placeholder:text-[#8B949E]" />
          </div>
          <div>
            <label className="text-sm font-medium">Timeline</label>
            <Input data-testid="request-timeline" placeholder="e.g. 2 weeks" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className="mt-1.5 h-11 rounded-xl bg-white/[0.04] border-white/[0.10] text-white placeholder:text-[#8B949E]" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button data-testid="ai-help-button" onClick={() => navigate("/assistant")} className="h-11 px-4 rounded-xl bg-white/[0.06] text-white border border-white/[0.10] hover:bg-white/[0.09]">
            <Sparkles size={16} className="mr-2 text-[#00E5FF]" /> Ask AEGIS
          </Button>
          <Button data-testid="submit-request-button" onClick={submit} disabled={saving} className="flex-1 h-11 rounded-xl bg-[#00E5FF] text-[#0D1117] font-semibold hover:brightness-110 glow-cyan">
            {saving ? <Loader2 className="animate-spin" size={18} /> : "Create request"}
          </Button>
        </div>
      </div>
    </div>
  );
}
