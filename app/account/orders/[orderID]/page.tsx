"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "@/lib/firebaseClient";
import { SiteShell } from "@/components/SiteShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Order = {
  userId: string;
  email: string | null;
  status: string;
  items: { title: string; qty: number }[];
  payment?: { provider?: string; status?: string };
};

export default function MyOrderDetailPage() {
  const params = useParams();
  const pathname = usePathname();

  // 1) Try params, 2) fallback to URL path /account/orders/<id>
  const orderId = useMemo(() => {
    const raw = (params as any)?.orderId;
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];

    const parts = (pathname ?? "").split("/").filter(Boolean);
    const idx = parts.indexOf("orders");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];

    return null;
  }, [params, pathname]);

  const [authReady, setAuthReady] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("auth user:", u?.uid);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    async function loadOrder() {
      console.log("debug:", { authReady, orderId });

      if (!authReady) return;
      if (!orderId) {
        setErr("No orderId found in route.");
        return;
      }

      setErr(null);
      setOrder(null);

      try {
        console.log("Fetching orderId:", orderId);
        const snap = await getDoc(doc(db, "orders", orderId));
        console.log("Snap exists?", snap.exists());

        if (!snap.exists()) {
          setErr("Order not found.");
          return;
        }

        setOrder(snap.data() as Order);
      } catch (e: any) {
        console.error("Firestore getDoc failed:", e);
        setErr(e?.message ?? "Failed to load order.");
      }
    }

    loadOrder();
  }, [authReady, orderId]);

  return (
    <SiteShell>
      <div className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <div className="text-[11px] tracking-[0.28em] uppercase text-[hsl(var(--muted))]">
            My Orders
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Order Details
          </h1>
          <div className="h-px w-24 bg-[hsl(var(--gold))]/70" />
        </div>

        <Card>
          <CardContent className="space-y-4">
            {/* Debug line so we can see what the page thinks */}
            <div className="text-xs text-[hsl(var(--muted))]">
              debug: authReady={String(authReady)} orderId={String(orderId)}
            </div>

            {!authReady ? (
              <div className="text-sm text-[hsl(var(--muted))]">Checking sign-in…</div>
            ) : err ? (
              <div className="text-sm text-red-600">{err}</div>
            ) : !order ? (
              <div className="text-sm text-[hsl(var(--muted))]">Loading order…</div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--muted))]">Status</span>
                  <Badge>{order.status}</Badge>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--muted))]">Email</span>
                  <span className="font-semibold">{order.email ?? "—"}</span>
                </div>

                <div className="h-px w-full bg-[hsl(var(--border))]" />

                <div className="text-sm font-semibold">Items</div>
                <div className="space-y-2">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--muted))]">{it.title}</span>
                      <span className="font-semibold">× {it.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SiteShell>
  );
}
