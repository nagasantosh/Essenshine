export const dynamic = "force-dynamic";
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import { SiteShell } from "@/components/SiteShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type OrderRow = {
  id: string;
  status: string;
  currency?: string;
  createdAt?: Timestamp;
  items?: { title: string; qty: number }[];
  payment?: { provider?: string; status?: string };
};

function prettyDate(ts?: Timestamp) {
  if (!ts) return "—";
  const d = ts.toDate();
  return d.toLocaleString();
}

export default function MyOrdersPage() {
  const [authReady, setAuthReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    async function load() {
      setErr(null);
      setLoading(true);
      setOrders([]);

      if (!authReady) return;
      if (!uid) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", uid),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        const rows: OrderRow[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setOrders(rows);
      } catch (e: any) {
        console.error(e);
        setErr(e?.message ?? "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [authReady, uid]);

  return (
    <SiteShell>
      <div className="max-w-3xl space-y-6">
        <div className="space-y-2">
          <div className="text-[11px] tracking-[0.28em] uppercase text-[hsl(var(--muted))]">
            Account
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            My Orders
          </h1>
          <div className="h-px w-24 bg-[hsl(var(--gold))]/70" />
        </div>

        {!authReady ? (
          <div className="text-sm text-[hsl(var(--muted))]">Checking sign-in…</div>
        ) : !uid ? (
          <Card>
            <CardContent className="space-y-2">
              <div className="text-sm font-semibold">Please sign in</div>
              <div className="text-sm text-[hsl(var(--muted))]">
                You need to be signed in to view your orders.
              </div>
              <Link className="text-sm underline" href="/login?next=/account/orders">
                Go to login
              </Link>
            </CardContent>
          </Card>
        ) : err ? (
          <div className="text-sm text-red-600">{err}</div>
        ) : loading ? (
          <div className="text-sm text-[hsl(var(--muted))]">Loading your orders…</div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="space-y-2">
              <div className="text-sm font-semibold">No orders yet</div>
              <div className="text-sm text-[hsl(var(--muted))]">
                Your past orders will appear here after checkout.
              </div>
              <Link className="text-sm underline" href="/shop">
                Continue shopping
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const itemCount = (o.items ?? []).reduce((s, it) => s + (it.qty ?? 0), 0);
              const paid = o.status === "paid" || o.payment?.status === "paid";

              return (
                <Link key={o.id} href={`/account/orders/${o.id}`}>
                  <Card className="hover:opacity-95 transition">
                    <CardContent className="flex items-center justify-between gap-6">
                      <div className="space-y-1">
                        <div className="font-mono text-sm">{o.id}</div>
                        <div className="text-xs text-[hsl(var(--muted))]">
                          {prettyDate(o.createdAt)} • {itemCount} item{itemCount === 1 ? "" : "s"}
                        </div>
                      </div>

<div className="flex items-center gap-2">
  <Badge>{o.status}</Badge>
  {o.payment?.provider ? <Badge>{o.payment.provider}</Badge> : null}
</div>

                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        <div className="text-xs text-[hsl(var(--muted))]">
          Traditional use • Not medical advice
        </div>
      </div>
    </SiteShell>
  );
}
