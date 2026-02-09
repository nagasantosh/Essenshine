"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebaseClient";
import { SiteShell } from "@/components/SiteShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RazorpayScript } from "@/components/RazorpayScript";


type Order = {
  email: string | null;
  status: string;
  currency: string;
  items: { title: string; qty: number }[];
};

export default function OrderConfirmationPage() {
  const params = useParams();
  const pathname = usePathname();

  // 1) Try router params, 2) fallback to URL path (/order/<id>)
  const orderId = useMemo(() => {
    const raw = (params as any)?.orderId;
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];

    const parts = (pathname ?? "").split("/").filter(Boolean);
    const idx = parts.indexOf("order");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];

    return null;
  }, [params, pathname]);

  const [authReady, setAuthReady] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Wait until Firebase auth state is known (rules need auth)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => setAuthReady(true));
    return () => unsub();
  }, []);

  useEffect(() => {
    async function load() {
      setErr(null);
      setOrder(null);

      if (!orderId) return;
      if (!authReady) return;

      try {
        const ref = doc(db, "orders", orderId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setErr("Order not found.");
          return;
        }

        setOrder(snap.data() as Order);
      } catch (e: any) {
        console.error(e);
        setErr(e?.message ?? "Failed to load order.");
      }
    }

    load();
  }, [orderId, authReady]);

  return (
    <SiteShell>
      <div className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <div className="text-[11px] tracking-[0.28em] uppercase text-[hsl(var(--muted))]">
            Order created
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Thank you.
          </h1>
          <div className="h-px w-24 bg-[hsl(var(--gold))]/70" />
        </div>

        <Card>
          <CardContent className="space-y-4">
            <div className="text-sm text-[hsl(var(--muted))]">Order ID</div>
            <div className="font-mono text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2">
              {orderId ?? "Loading…"}
            </div>

            <div className="h-px w-full bg-[hsl(var(--border))]" />

            {!authReady ? (
              <div className="text-sm text-[hsl(var(--muted))]">Checking sign-in…</div>
            ) : err ? (
              <div className="text-sm text-red-600">{err}</div>
            ) : !orderId ? (
              <div className="text-sm text-[hsl(var(--muted))]">Loading order…</div>
            ) : !order ? (
              <div className="text-sm text-[hsl(var(--muted))]">Fetching details…</div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--muted))]">Status</span>
                  <span className="font-semibold">{order.status}</span>
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

                <div className="text-xs text-[hsl(var(--muted))] pt-2">
                  Traditional use • Not medical advice
                </div>
              </div>
            )}            {/* Razorpay */}
            {order && order.status !== "paid" && (
              <>
                <RazorpayScript />

                <Button
                  size="lg"
                  className="w-full mt-4"
                  onClick={async () => {
                    if (!orderId) return;

                    const createUrl = process.env.NEXT_PUBLIC_RZP_CREATE_URL!;
                    const verifyUrl = process.env.NEXT_PUBLIC_RZP_VERIFY_URL!;

                    console.log("createUrl:", createUrl);
                    console.log("createUrl:", verifyUrl);


                    const r1 = await fetch(createUrl, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orderId }),
                    });

                    const data = await r1.json();
                    if (!r1.ok) {
                      alert(data?.error ?? "Failed to start payment");
                      return;
                    }

                    const RazorpayCtor = (window as any).Razorpay;
                    if (!RazorpayCtor) {
                      alert("Razorpay not loaded yet. Try again.");
                      return;
                    }

                    const rzp = new RazorpayCtor({
                      key: data.keyId,
                      amount: data.amount,
                      currency: data.currency,
                      name: "Herbal Bharat",
                      description: "Ayurvedic wellness order",
                      order_id: data.razorpayOrderId,
                      handler: async (resp: any) => {
                        const r2 = await fetch(verifyUrl, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            orderId,
                            razorpay_order_id: resp.razorpay_order_id,
                            razorpay_payment_id: resp.razorpay_payment_id,
                            razorpay_signature: resp.razorpay_signature,
                          }),
                        });

                        const v = await r2.json();
                        if (!r2.ok || !v.ok) {
                          alert(v?.error ?? "Payment verification failed");
                          return;
                        }

                        alert("Payment successful ✅");
                        window.location.reload();
                      },
                    });

                    rzp.open();
                  }}
                >
                  Pay now (Razorpay)
                </Button>
              </>
            )}

            {order?.status === "paid" && (
              <div className="mt-4 text-sm font-semibold text-green-700 text-center">
                Payment successful ✅
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </SiteShell>
  );
}
