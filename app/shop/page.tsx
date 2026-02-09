import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AddToCartButton } from "@/components/AddToCartButton";
import { getBaseUrl } from "@/lib/baseUrl";


type Category = { id: string; name: string };
type Product = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  images?: string[];
};

function GoldRule() {
  return <div className="h-px w-24 bg-[hsl(var(--gold))]/70" />;
}

async function getCategories(): Promise<Category[]> {
  const base = getBaseUrl();

  const res = await fetch(`${base}/api/catalog/categories`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

async function getProducts(categoryId: string): Promise<Product[]> {
  const base = getBaseUrl();

  const url =
    categoryId && categoryId !== "all"
      ? `${base}/api/catalog/products?category=${encodeURIComponent(categoryId)}`
      : `${base}/api/catalog/products`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) return [];
  return res.json();
}


export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const categoryId = sp?.category ?? "all";
  const q = (sp?.q ?? "").trim().toLowerCase();

  const [categories, productsRaw] = await Promise.all([
    getCategories(),
    getProducts(categoryId),
  ]);

  const selectedCategoryName =
    categoryId === "all"
      ? "All Items"
      : categories.find((c) => c.id === categoryId)?.name ?? "Category";

  const products = q
    ? productsRaw.filter((p) => {
        const hay = `${p.title} ${p.description ?? ""} ${
          p.categoryName ?? ""
        }`.toLowerCase();
        return hay.includes(q);
      })
    : productsRaw;

  const pillBase =
    "rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm shadow-sm hover:bg-[hsl(var(--surface-2))] transition";

  const pillActive =
    "rounded-full border border-[hsl(var(--gold))]/60 bg-[hsl(var(--surface))] px-4 py-2 text-sm shadow-sm";

  return (
    <SiteShell>
      <div className="space-y-8">
        {/* HEADER */}
        <div className="space-y-3">
          <div className="text-[11px] tracking-[0.28em] uppercase text-[hsl(var(--muted))]">
            Browse • Filter • Add to cart
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
            Shop
          </h1>
          <GoldRule />
          <p className="max-w-2xl text-[15px] leading-7 text-[hsl(var(--muted))]">
            Showing <b>{selectedCategoryName}</b>. Use search to quickly find the
            right product.
          </p>
        </div>

        {/* STICKY FILTER BAR */}
        <div className="sticky top-[92px] z-40">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))]/85 backdrop-blur p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-[hsl(var(--muted))]">
                {productsRaw.length} item{productsRaw.length === 1 ? "" : "s"} •{" "}
                {q
                  ? `${products.length} match${
                      products.length === 1 ? "" : "es"
                    }`
                  : "No search"}
              </div>

              <Link
                href={
                  categoryId === "all"
                    ? "/shop"
                    : `/shop?category=${encodeURIComponent(categoryId)}`
                }
                className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--text))] transition"
              >
                Clear search →
              </Link>
            </div>

            {/* Search input: server-only (no client state) */}
            <form className="flex gap-2" action="/shop" method="get">
              <input type="hidden" name="category" value={categoryId} />
              <input
                name="q"
                defaultValue={sp?.q ?? ""}
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-sm"
                placeholder="Search products (e.g. oil, pack, neem)"
              />
              <button className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white">
                Search
              </button>
            </form>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              <Link
                href={q ? `/shop?q=${encodeURIComponent(q)}` : "/shop"}
                className={categoryId === "all" ? pillActive : pillBase}
              >
                All Items
              </Link>

              {categories.map((c) => {
                const href = q
                  ? `/shop?category=${encodeURIComponent(
                      c.id
                    )}&q=${encodeURIComponent(q)}`
                  : `/shop?category=${encodeURIComponent(c.id)}`;

                return (
                  <Link
                    key={c.id}
                    href={href}
                    className={categoryId === c.id ? pillActive : pillBase}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {products.length === 0 ? (
          <div className="text-sm text-[hsl(var(--muted))]">
            No products found. Try another category or clear search.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                {/* ✅ PRODUCT IMAGE */}
                <div className="relative h-52 bg-[hsl(var(--surface-2))] border-b border-[hsl(var(--border))]">
                  <div className="absolute left-6 top-6 z-10">
                    <span className="inline-flex items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3.5 py-1.5 text-xs text-[hsl(var(--muted))]">
                      {p.categoryName ?? "Essentials"}
                    </span>
                  </div>

                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="h-28 w-20 rounded-[18px] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-sm" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />
                </div>

                <CardContent>
                  <div className="text-lg font-semibold">{p.title}</div>
                  <div className="mt-3 text-sm text-[hsl(var(--muted))] line-clamp-2">
                    {p.description ?? "Premium herbal formulation."}
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button size="sm" className="flex-1" href={`/product/${p.slug}`}>
                      View
                    </Button>
                    <AddToCartButton id={p.id} slug={p.slug} title={p.title} />
                  </div>

                  <div className="mt-5 h-px w-full bg-[hsl(var(--border))]" />
                  <div className="mt-4 text-xs text-[hsl(var(--muted))]">
                    Traditional use • Not medical advice
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* BROWSE OTHER CATEGORIES */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5">
          <div className="text-sm font-medium">Browse other categories</div>
          <div className="mt-2 text-sm text-[hsl(var(--muted))]">
            Explore more rituals — hair, skin, face packs and more.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${encodeURIComponent(c.id)}`}
                className="rounded-full border px-4 py-2 text-sm hover:bg-[hsl(var(--surface-2))] transition"
              >
                {c.name} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
