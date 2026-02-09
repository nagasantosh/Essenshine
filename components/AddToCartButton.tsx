"use client";

import { useCart } from "@/components/CartProvider";
import { Button } from "@/components/ui/Button";

export function AddToCartButton({
  id,
  slug,
  title,
  priceINR,
}: {
  id: string;
  slug: string;
  title: string;
  priceINR?: number;
}) {
  const cart = useCart();

  return (
    <Button
      size="sm"
      variant="secondary"
      className="flex-1"
      onClick={() => {
        cart.add({ id, slug, title, priceINR }, 1);
      }}
    >
      Add
    </Button>
  );
}