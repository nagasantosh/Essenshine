"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import type { ProductDoc } from "@/lib/types";

type Row = { id: string; data: ProductDoc };

export default function AdminProductsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      const q = query(collection(db, "products"), orderBy("name", "asc"));
      const snap = await getDocs(q);
      setRows(snap.docs.map((d) => ({ id: d.id, data: d.data() as ProductDoc })));
      setLoading(false);
    }
    run();
  }, []);

  return (
    <div className="rounded-2xl border">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <div className="text-sm text-zinc-500">Products</div>
          <div className="text-lg font-medium">Catalog</div>
        </div>
        <Link
          className="rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white"
          href="/admin/products/new"
        >
          New product
        </Link>
      </div>

      {loading ? (
        <div className="p-4 text-sm text-zinc-500">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr className="border-b">
                <th className="p-3">Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Active</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Prices</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ id, data }) => (
                <tr key={id} className="border-b hover:bg-zinc-50">
                  <td className="p-3">
                    <Link className="font-medium underline underline-offset-2" href={`/admin/products/${id}`}>
                      {data.name}
                    </Link>
                  </td>
                  <td className="p-3 text-zinc-600">{data.slug}</td>
                  <td className="p-3">
                    <span className="rounded-full border px-2 py-1 text-xs">
                      {data.active ? "active" : "inactive"}
                    </span>
                  </td>
                  <td className="p-3">{data.stock ?? 0}</td>
                  <td className="p-3 text-xs text-zinc-600">
                    INR {data.prices?.INR ?? "-"} / USD {data.prices?.USD ?? "-"} / EUR {data.prices?.EUR ?? "-"}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-4 text-sm text-zinc-500" colSpan={5}>
                    No products found.
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
