import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Link
        href="/admin/orders"
        className="block rounded-2xl border p-5 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-black/20"
      >
        <div className="text-sm text-zinc-500">Next</div>
        <div className="mt-1 text-lg font-medium">Manage Orders</div>
        <p className="mt-2 text-sm text-zinc-600">
          Review recent orders and update fulfillment status + tracking.
        </p>
      </Link>

      <Link
        href="/admin/products"
        className="block rounded-2xl border p-5 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-black/20"
      >
        <div className="text-sm text-zinc-500">Next</div>
        <div className="mt-1 text-lg font-medium">Manage Products</div>
        <p className="mt-2 text-sm text-zinc-600">
          CRUD products, prices (INR/USD/EUR), stock and active flag.
        </p>
      </Link>
    </div>
  );
}
