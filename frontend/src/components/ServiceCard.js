import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import CategoryVisual from "@/components/CategoryVisual";

export default function ServiceCard({ service, view = "grid" }) {
  const navigate = useNavigate();
  const go = () => navigate(`/marketplace/${service.service_id}`);

  if (view === "list") {
    return (
      <button
        data-testid="service-card"
        onClick={go}
        className="w-full text-left glass rounded-2xl p-3 flex gap-4 hover:bg-white/[0.09] hover:border-white/[0.16] transition-[background-color,border-color] duration-200"
      >
        <CategoryVisual category={service.category} className="h-20 w-24 rounded-xl shrink-0" iconSize={22} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] text-[#00E5FF]">{service.category}</span>
          </div>
          <p className="font-semibold truncate">{service.title}</p>
          <p className="text-xs text-[#8B949E] truncate mt-0.5">by {service.provider_name}</p>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1 text-white"><Star size={13} className="text-[#fbbf24] fill-[#fbbf24]" /> {service.rating} <span className="text-[#8B949E]">({service.reviews_count})</span></span>
            <span className="text-[#8B949E]">from <span className="text-white font-semibold">${service.price}</span></span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      data-testid="service-card"
      onClick={go}
      className="text-left glass rounded-2xl overflow-hidden hover:border-white/[0.16] hover:-translate-y-0.5 transition-[transform,border-color] duration-200 group"
    >
      <CategoryVisual category={service.category} className="h-32 w-full" iconSize={28} />
      <div className="p-4">
        <span className="text-[11px] text-[#00E5FF]">{service.category}</span>
        <p className="font-semibold mt-1 line-clamp-2 min-h-[2.5rem]">{service.title}</p>
        <p className="text-xs text-[#8B949E] mt-1">by {service.provider_name}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(service.tags || []).slice(0, 3).map((t) => (
            <span key={t} className="rounded-full px-2 py-0.5 text-[10px] bg-white/[0.06] border border-white/[0.10] text-[#8B949E]">{t}</span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.08]">
          <span className="flex items-center gap-1 text-xs text-white"><Star size={13} className="text-[#fbbf24] fill-[#fbbf24]" /> {service.rating}</span>
          <span className="text-sm"><span className="text-[#8B949E] text-xs">from </span><span className="font-bold text-white">${service.price}</span></span>
        </div>
      </div>
    </button>
  );
}
