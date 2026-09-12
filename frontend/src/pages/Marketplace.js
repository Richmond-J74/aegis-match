import React, { useEffect, useState, useCallback } from "react";
import { Search, SlidersHorizontal, LayoutGrid, List, X } from "lucide-react";
import { api } from "@/lib/api";
import ServiceCard from "@/components/ServiceCard";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Marketplace() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("popular");
  const [priceRange, setPriceRange] = useState([0, 700]);
  const [minRating, setMinRating] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(["All", ...r.data])).catch(() => {});
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (search) params.search = search;
      if (category !== "All") params.category = category;
      if (priceRange[0] > 0) params.min_price = priceRange[0];
      if (priceRange[1] < 700) params.max_price = priceRange[1];
      if (minRating > 0) params.min_rating = minRating;
      const r = await api.get("/services", { params });
      setServices(r.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  }, [search, category, sort, priceRange, minRating]);

  useEffect(() => {
    const t = setTimeout(fetchServices, 250);
    return () => clearTimeout(t);
  }, [fetchServices]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-[#8B949E] text-sm mt-1">Discover services matched to your goals.</p>
      </div>

      {/* Toolbar */}
      <div data-testid="marketplace-toolbar" className="glass rounded-2xl p-3 flex items-center gap-2 sticky top-3 z-20">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
          <Input
            data-testid="marketplace-search-input"
            placeholder="Search services, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 rounded-xl bg-white/[0.04] border-white/[0.10] text-white placeholder:text-[#8B949E]"
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger data-testid="sort-select" className="h-10 w-[130px] rounded-xl bg-white/[0.04] border-white/[0.10] text-white hidden sm:flex">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#161B22] border-white/[0.1] text-white">
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="rating">Top rated</SelectItem>
            <SelectItem value="price_low">Price: Low</SelectItem>
            <SelectItem value="price_high">Price: High</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <button data-testid="open-filters" className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.10] flex items-center justify-center hover:bg-white/[0.08] transition-colors">
              <SlidersHorizontal size={16} />
            </button>
          </SheetTrigger>
          <SheetContent data-testid="marketplace-filters" className="bg-[#161B22] border-white/[0.08] text-white">
            <SheetHeader><SheetTitle className="text-white">Filters</SheetTitle></SheetHeader>
            <div className="mt-6 space-y-8">
              <div>
                <p className="text-sm font-medium mb-3">Price range</p>
                <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={700} step={10} className="mb-2" />
                <div className="flex justify-between text-xs text-[#8B949E]"><span>${priceRange[0]}</span><span>${priceRange[1]}</span></div>
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Minimum rating</p>
                <div className="flex gap-2">
                  {[0, 4, 4.5, 4.8].map((r) => (
                    <button key={r} onClick={() => setMinRating(r)} className={`rounded-lg px-3 py-2 text-xs border transition-colors ${minRating === r ? "bg-[#00E5FF]/15 border-[#00E5FF]/40 text-white" : "bg-white/[0.04] border-white/[0.10] text-[#8B949E]"}`}>
                      {r === 0 ? "Any" : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={() => { setPriceRange([0,700]); setMinRating(0); }} className="w-full h-10 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white hover:bg-white/[0.09]">
                Reset filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <div className="hidden sm:flex rounded-xl bg-white/[0.04] border border-white/[0.10] p-0.5">
          <button data-testid="view-grid" onClick={() => setView("grid")} className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${view === "grid" ? "bg-white/[0.10] text-white" : "text-[#8B949E]"}`}><LayoutGrid size={16} /></button>
          <button data-testid="view-list" onClick={() => setView("list")} className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${view === "list" ? "bg-white/[0.10] text-white" : "text-[#8B949E]"}`}><List size={16} /></button>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((c) => (
          <button
            key={c}
            data-testid={`cat-chip-${c}`}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm border transition-[background-color,border-color,color] duration-200 ${
              category === c ? "bg-[#00E5FF]/15 text-white border-[#00E5FF]/40" : "bg-white/[0.06] text-[#8B949E] border-white/[0.10] hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl bg-white/[0.05]" />)}
        </div>
      ) : services.length === 0 ? (
        <div data-testid="empty-state" className="glass rounded-2xl py-16 text-center">
          <Search size={32} className="mx-auto text-[#8B949E] mb-3" />
          <p className="font-medium">No services found</p>
          <p className="text-sm text-[#8B949E] mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
          {services.map((s) => <ServiceCard key={s.service_id} service={s} view={view} />)}
        </div>
      )}
    </div>
  );
}
