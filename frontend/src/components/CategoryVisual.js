import React from "react";
import * as Icons from "lucide-react";
import { catStyle } from "@/lib/api";

export default function CategoryVisual({ category, className = "", iconSize = 28 }) {
  const s = catStyle(category);
  const Icon = Icons[s.icon] || Icons.Sparkles;
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${s.from}22, ${s.to}11)`,
      }}
      data-testid="category-visual"
    >
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-40"
        style={{ background: s.from }}
      />
      <div
        className="absolute -left-8 -bottom-8 h-28 w-28 rounded-full blur-2xl opacity-25"
        style={{ background: s.to }}
      />
      <div
        className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: `${s.from}22`, border: `1px solid ${s.from}44` }}
      >
        <Icon size={iconSize} style={{ color: s.from }} strokeWidth={1.75} />
      </div>
    </div>
  );
}
