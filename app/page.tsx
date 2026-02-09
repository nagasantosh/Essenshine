import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import CategoryTiles from "@/components/home/CategoryTiles";
import { AddToCartButton } from "@/components/AddToCartButton";
import HeroCarousel from "@/components/home/HeroCarousel";
import { getBaseUrl } from "@/lib/baseUrl";

type Product = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  categoryName?: string;
  images?: string[];
};

type Category = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
};

function GoldRule() {
  return <div className="h-px w-24 bg-[hsl(var(--gold))]/70" />;
}

async function getProducts(): Promise<Product[]> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/catalog/products`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function getCategories(): Promise<Category[]> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/catalog/categories`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const featured = products.slice(0, 6);

  const heroItems = products
    .filter((p) => (p.images?.length ?? 0) > 0)
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.description ?? "Premium herbal formulation.",
      href: `/product/${p.slug}`,
      imageUrl: p.images?.[0] ?? "",
      badge: p.categoryName ?? "Featured",
    }));

  return (
    <SiteShell>
      <div className="space-y-16">
        {/* ANNOUNCEMENT STRIP */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="text-[hsl(var(--muted))]">
              From Hyderabad • Premium herbal rituals for hair & skin
              <span className="mx-2 text-[hsl(var(--gold))]">•</span>
              <span className="text-[hsl(var(--text))] font-medium">
                Secure checkout & fast dispatch
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[hsl(var(--muted))]">Guaranteed secure checkout</span>
              <Link href="/shop" className="text-sm hover:underline underline-offset-4">
                Shop now →
              </Link>
            </div>
          </div>
        </div>

        {/* HERO */}
        <section className="grid gap-8 lg:grid-cols-2 items-center">
          {/* LEFT */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-[11px] tracking-[0.28em] uppercase text-[hsl(var(--muted))]">
                Essenshine Natural Herbal Products
              </div>

              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
                Old-world herbal rituals,
                <span className="text-[hsl(var(--gold))]"> refined</span> for modern care.
              </h1>

              <GoldRule />

              <p className="max-w-xl text-[15px] leading-7 text-[hsl(var(--muted))]">
                Premium hair and skin essentials with clear usage guidance and safety notes—without medical claims.
                Crafted for daily routines.
              </p>
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap gap-3">
              <Button href="/shop" size="lg">
                Explore collection
              </Button>
              <Button href="/shop?category=hair-care" variant="secondary" size="lg">
                Shop Hair Care
              </Button>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge>Herbal</Badge>
              <Badge>Secure checkout</Badge>
              <Badge>Hyderabad</Badge>
              <Badge>Traditional use</Badge>
            </div>

            {/* Quick category chips */}
            {categories.length > 0 && (
              <div className="pt-3">
                <div className="text-xs text-[hsl(var(--muted))] mb-2">Shop by category</div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/shop"
                    className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm shadow-sm hover:bg-[hsl(var(--surface-2))] transition"
                  >
                    All Items
                  </Link>

                  {categories.slice(0, 6).map((c) => (
                    <Link
                      key={c.id}
                      href={`/shop?category=${encodeURIComponent(c.id)}`}
                      className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm shadow-sm hover:bg-[hsl(var(--surface-2))] transition"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Moving hero images */}
          <HeroCarousel items={heroItems} />
        </section>

        {/* DYNAMIC CATEGORIES */}
        <CategoryTiles categories={categories} />

        {/* FEATURED PRODUCTS */}
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="text-[11px] tracking-[0.28em] uppercase text-[hsl(var(--muted))]">
              Featured
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Most chosen essentials.
            </h2>
            <GoldRule />
          </div>

          {featured.length === 0 ? (
            <div className="text-sm text-[hsl(var(--muted))]">
              No products yet. Add products in Firestore: <b>products</b> with <b>active=true</b>.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <Card key={p.id} className="overflow-hidden">
                  <div className="relative h-48 bg-[hsl(var(--surface-2))] border-b border-[hsl(var(--border))]">
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
                        <div className="h-24 w-16 rounded-[18px] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-sm" />
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

          <div className="pt-2">
            <Button href="/shop" variant="secondary" size="lg">
              Explore all products
            </Button>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
