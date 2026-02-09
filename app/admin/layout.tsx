import AdminGate from "@/components/AdminGate";
import Link from "next/link";
import AdminLogoutButton from "@/components/AdminLogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              Essenshine Natural Herbal Products
            </div>
            <h1 className="text-2xl font-semibold">Admin</h1>
          </div>

          <nav className="flex gap-3 text-sm">
            <Link className="rounded-full border px-3 py-1 hover:bg-zinc-50" href="/admin">
              Dashboard
            </Link>
            <Link className="rounded-full border px-3 py-1 hover:bg-zinc-50" href="/admin/orders">
              Orders
            </Link>
            <Link className="rounded-full border px-3 py-1 hover:bg-zinc-50" href="/admin/products">
              Products
            </Link>
            <Link className="rounded-full border px-3 py-1 hover:bg-zinc-50" href="/admin/categories">
              Categories
            </Link>

            <AdminLogoutButton />
          </nav>
        </div>

        {children}
      </div>
    </AdminGate>
  );
}
