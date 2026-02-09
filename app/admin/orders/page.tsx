"use client";

import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import type { OrderDoc } from "@/lib/types";

type Row = { id: string; data: OrderDoc };

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(50));
      const snap = await getDocs(q);
      const items: Row[] = snap.docs.map((d) => ({ id: d.id, data: d.data() as OrderDoc }));
      setRows(items);
      setLoading(false);
    }
    run();
  }, []);

  return (
    <div className="rounded-2xl border">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <div className="text-sm text-zinc-500">Orders</div>
          <div className="text-lg font-medium">Latest 50</div>
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-sm text-zinc-500">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr className="border-b">
                <th className="p-3">Order</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Currency</th>
                <th className="p-3">Items</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ id, data }) => (
                <tr key={id} className="border-b hover:bg-zinc-50">
                  <td className="p-3">
                    <Link className="font-medium underline underline-offset-2" href={`/admin/orders/${id}`}>
                      {id.slice(0, 8)}…
                    </Link>
                    <div className="text-xs text-zinc-500">
                      {data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : ""}
                    </div>
                  </td>
                  <td className="p-3">{data.email}</td>
                  <td className="p-3">
                    <span className="rounded-full border px-2 py-1 text-xs">
                      {(data.fulfillmentStatus ?? data.status) as string}
                    </span>
                  </td>
                  <td className="p-3">{data.currency}</td>
                  <td className="p-3">{Array.isArray(data.items) ? data.items.length : 0}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-4 text-sm text-zinc-500" colSpan={5}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
