"use client";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import type { OrderDoc, OrderStatus } from "@/lib/types";

const STATUS: OrderStatus[] = ["created", "paid", "packed", "shipped", "delivered"];

export default function AdminOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const orderId = useMemo(() => params?.orderId, [params]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OrderDoc | null>(null);

  const [fulfillmentStatus, setFulfillmentStatus] = useState<string>("created");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function run() {
      const ref = doc(db, "orders", orderId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        router.replace("/admin/orders");
        return;
      }
      const od = snap.data() as OrderDoc;
      setData(od);

      setFulfillmentStatus((od.fulfillmentStatus ?? od.status ?? "created") as string);
      setCarrier(od.tracking?.carrier ?? "");
      setTrackingNumber(od.tracking?.trackingNumber ?? "");
      setTrackingUrl(od.tracking?.trackingUrl ?? "");
      setAdminNotes(od.adminNotes ?? "");

      setLoading(false);
    }
    if (orderId) run();
  }, [orderId, router]);

  async function save() {
    setSaving(true);
    const ref = doc(db, "orders", orderId);
    await updateDoc(ref, {
      fulfillmentStatus,
      tracking: {
        carrier: carrier || null,
        trackingNumber: trackingNumber || null,
        trackingUrl: trackingUrl || null,
      },
      adminNotes: adminNotes || null,
    });
    setSaving(false);
    alert("Saved");
  }

  if (loading) return <div className="text-sm text-zinc-500">Loading…</div>;
  if (!data) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl border p-5">
        <div className="text-sm text-zinc-500">Order</div>
        <div className="mt-1 text-lg font-semibold">{orderId}</div>

        <div className="mt-4 grid gap-2 text-sm">
          <div><span className="text-zinc-500">Email:</span> {data.email}</div>
          <div><span className="text-zinc-500">User:</span> {data.userId}</div>
          <div><span className="text-zinc-500">Currency:</span> {data.currency}</div>
          <div><span className="text-zinc-500">Created:</span> {data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : ""}</div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-medium">Items</div>
          <pre className="mt-2 overflow-auto rounded-xl bg-zinc-950 p-3 text-xs text-zinc-100">
{JSON.stringify(data.items ?? [], null, 2)}
          </pre>
        </div>
      </div>

      <div className="rounded-2xl border p-5">
        <div className="text-sm text-zinc-500">Fulfillment</div>

        <label className="mt-3 block text-sm">
          Status
          <select
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={fulfillmentStatus}
            onChange={(e) => setFulfillmentStatus(e.target.value)}
          >
            {STATUS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <div className="mt-4 text-sm font-medium">Tracking</div>

        <label className="mt-2 block text-sm">
          Carrier
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
        </label>

        <label className="mt-2 block text-sm">
          Tracking number
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
        </label>

        <label className="mt-2 block text-sm">
          Tracking URL
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} />
        </label>

        <label className="mt-4 block text-sm">
          Admin notes
          <textarea className="mt-1 w-full rounded-xl border px-3 py-2" rows={4} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
        </label>

        <button
          className="mt-4 w-full rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
