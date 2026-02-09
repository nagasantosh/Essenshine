"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type HeroItem = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  imageUrl: string;
  badge?: string;
};

export default function HeroCarousel({ items }: { items: HeroItem[] }) {
  const safeItems = useMemo(() => items.filter((x) => !!x.imageUrl), [items]);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (safeItems.length <= 1) return;

    const t = window.setInterval(() => {
      setI((prev) => (prev + 1) % safeItems.length);
    }, 3800);

    return () => window.clearInterval(t);
  }, [safeItems.length]);

  if (safeItems.length === 0) {
    return (
      <div className="h-[420px] rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] grid place-items-center">
        <div className="text-sm text-[hsl(var(--muted))]">Add product images to see the hero carousel.</div>
      </div>
    );
  }

  const active = safeItems[i];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] h-[420px]">
      {/* Image */}
      <img
        key={active.id}
        src={active.imageUrl}
        alt={active.title}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
        loading="eager"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/0" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/0 to-black/0" />

      {/* Content */}
      <div className="absolute left-6 right-6 bottom-6">
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {active.badge ? <Badge>{active.badge}</Badge> : <Badge>Featured</Badge>}
              <span className="text-xs text-white/80">Secure checkout</span>
            </div>

            <div className="text-2xl md:text-3xl font-semibold tracking-tight text-white leading-[1.1]">
              {active.title}
            </div>

            {active.subtitle ? (
              <div className="text-sm text-white/80 max-w-md leading-6">
                {active.subtitle}
              </div>
            ) : null}

            <div className="pt-2 flex gap-2">
              <Button href={active.href} size="sm">
                View
              </Button>
              <Button href="/shop" size="sm" variant="secondary">
                Shop all
              </Button>
            </div>
          </div>

          {/* Dots */}
          <div className="hidden sm:flex items-center gap-2">
            {safeItems.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  idx === i ? "bg-white" : "bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Small link */}
        <div className="pt-4">
          <Link
            href="/shop"
            className="text-xs text-white/80 hover:text-white transition underline underline-offset-4"
          >
            Explore categories →
          </Link>
        </div>
      </div>
    </div>
  );
}
