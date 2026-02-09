"use client";

import { useCart } from "@/components/CartProvider";

export function CartCount() {
  const { count } = useCart();
  if (!count) return null;

  return (
    <span className="ml-2 inline-flex items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2 py-0.5 text-xs text-[hsl(var(--muted))]">
      {count}
    </span>
  );
}