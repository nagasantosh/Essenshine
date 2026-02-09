"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/cart";
import { readCart, writeCart } from "@/lib/cart";

type CartContextValue = {
  items: CartItem[];
  count: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  useEffect(() => {
    writeCart(items);
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, it) => sum + it.qty, 0);

    function add(item: Omit<CartItem, "qty">, qty = 1) {
      setItems((prev) => {
        const existing = prev.find((p) => p.id === item.id);
        if (!existing) return [...prev, { ...item, qty }];
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + qty } : p));
      });
    }

    function remove(id: string) {
      setItems((prev) => prev.filter((p) => p.id !== id));
    }

    function setQty(id: string, qty: number) {
      const safe = Math.max(1, Math.min(99, qty));
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: safe } : p)));
    }

    function clear() {
      setItems([]);
    }

    return { items, count, add, remove, setQty, clear };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}