"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SnowEffect } from "@/components/effects/SnowEffect";

interface Effect {
  name: string;
  slug: string;
  description: string;
}

const effects: Effect[] = [
  {
    name: "Fractal Glass",
    slug: "fractalglass",
    description: "Aurora-like flowing waves behind ribbed glass with customizable colors and dynamics.",
  },
];

function EffectCard({ effect }: { effect: Effect }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="group">
      <Link
        href={`/${effect.slug}`}
        className="block py-4 border-b border-white/[0.06] hover:border-white/[0.12] transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-lg text-white/80 group-hover:text-white transition-colors tracking-wide">
            {effect.name}
          </span>
          <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
            View →
          </span>
        </div>
      </Link>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 py-2 text-[10px] uppercase tracking-widest text-white/30 hover:text-white/50 transition-colors"
      >
        <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        Details
      </button>
      {isExpanded && (
        <p className="pb-4 text-sm text-white/40 leading-relaxed">
          {effect.description}
        </p>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white relative">
      <SnowEffect />

      <div className="max-w-2xl mx-auto px-6 py-24 relative z-10">
        {/* Header */}
        <header className="mb-20">
          <h1 className="text-3xl font-light tracking-tight mb-2">
            Sleth<span className="italic font-serif">UI</span>Lab
          </h1>
          <p className="text-sm text-white/40">
            A collection of experimental UI elements
          </p>
        </header>

        {/* Effects list */}
        <section>
          <h2 className="text-[10px] uppercase tracking-widest text-white/30 mb-6">
            Effects
          </h2>
          <div>
            {effects.map((effect) => (
              <EffectCard key={effect.slug} effect={effect} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-32 pt-8 border-t border-white/[0.04]">
          <p className="text-xs text-white/20">
            Built with Love by Slethware
          </p>
        </footer>
      </div>
    </main>
  );
}