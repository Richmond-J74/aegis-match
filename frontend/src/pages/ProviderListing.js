import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Store, X } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProviderListing() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", category: "", price: "", description: "", delivery_days: 7 });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const submit = async () => {
    if (!form.title || !form.category || !form.price || !form.description) {
      toast.error("Fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post("/services", {
        title: form.title,
        category: form.category,
        price: parseFloat(form.price),
        description: form.description,
        tags,
        delivery_days: parseInt(form.delivery_days) || 7,
      });
      toast.success("Service published");
      navigate(`/marketplace/${res.data.service_id}`);
    } catch (e) {
      toast.error("Could not publish service");
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
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Store size={22} className="text-[#10B981]" /> Create Listing</h1>
        <p className="text-[#8B949E] text-sm mt-1">Publish a service to the AEGIS marketplace.</p>
      </div>

      <div className="glass rounded-2xl p-5 space-y-4" data-testid="listing-form">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input data-testid="listing-title" placeholder="e.g. Premium Brand Identity Kit" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5 h-11 rounded-xl bg-white/[0.04] border-white/[0.10] text-white placeholder:text-[#8B949E]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Category</label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger data-testid="listing-category" className="mt-1.5 h-11 rounded-xl bg-white/[0.04] border-white/[0.10] text-white"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent className="bg-[#161B22] border-white/[0.1] text-white">
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Starting price ($)</label>
            <Input data-testid="listing-price" type="number" placeholder="120" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1.5 h-11 rounded-xl bg-white/[0.04] border-white/[0.10] text-white placeholder:text-[#8B949E]" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea data-testid="listing-description" placeholder="Describe your service, what's included, and why clients should choose you…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5 min-h-[120px] rounded-xl bg-white/[0.04] border-white/[0.10] text-white placeholder:text-[#8B949E]" />
        </div>
        <div>
          <label className="text-sm font-medium">Tags</label>
          <div className="flex gap-2 mt-1.5">
            <Input data-testid="listing-tag-input" placeholder="Add a tag & press Enter" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} className="h-11 rounded-xl bg-white/[0.04] border-white/[0.10] text-white placeholder:text-[#8B949E]" />
            <Button onClick={addTag} className="h-11 px-4 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white hover:bg-white/[0.09]">Add</Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((t) => (
                <span key={t} className="rounded-full px-3 py-1 text-xs bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-white flex items-center gap-1.5">{t}<button onClick={() => setTags(tags.filter((x) => x !== t))}><X size={12} /></button></span>
              ))}
            </div>
          )}
        </div>
        <Button data-testid="publish-listing-button" onClick={submit} disabled={saving} className="w-full h-11 rounded-xl bg-[#10B981] text-[#0D1117] font-semibold hover:brightness-110 glow-emerald">
          {saving ? <Loader2 className="animate-spin" size={18} /> : "Publish service"}
        </Button>
      </div>
    </div>
  );
}
