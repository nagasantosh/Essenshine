import { SiteShell } from "@/components/SiteShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AddToCartButton } from "@/components/AddToCartButton";
import Link from "next/link";
import { getBaseUrl } from "@/lib/baseUrl";


type Product = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  categoryName?: string;
  images?: string[];
};

async function getProduct(slug: string): Promise<Product | null> {
  const base = getBaseUrl();

  const res = await fetch(
    `${base}/api/catalog/product?slug=${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}


export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    return (
      <SiteShell>
        <div className="text-sm text-[hsl(var(--muted))]">
          Product not found.
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="space-y-10">
        {/* Breadcrumb */}
        <div className="text-sm text-[hsl(var(--muted))]">
          <Link href="/shop" className="hover:underline">
            Shop
          </Link>{" "}
          → {product.title}
        </div>

        {/* Layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <Card className="overflow-hidden">
            <div className="bg-[hsl(var(--surface-2))]">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-[420px] object-cover"
                />
              ) : (
                <div className="h-[420px] grid place-items-center">
                  <div className="h-40 w-28 rounded-[22px] border bg-[hsl(var(--surface))]" />
                </div>
              )}
            </div>
          </Card>

          {/* Details */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Badge>{product.categoryName ?? "Essentials"}</Badge>

              <h1 className="text-4xl font-semibold tracking-tight">
                {product.title}
              </h1>

              <p className="text-[15px] leading-7 text-[hsl(var(--muted))]">
                {product.description ??
                  "Premium herbal formulation crafted for daily rituals."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <AddToCartButton
                id={product.id}
                slug={product.slug}
                title={product.title}
              />
              <Button href="/cart" variant="secondary">
                Go to Cart →
              </Button>
            </div>

            {/* Trust section */}
            <Card>
              <CardContent>
                <div className="text-sm font-medium">Traditional Use Only</div>
                <p className="mt-2 text-sm text-[hsl(var(--muted))] leading-6">
                  This product is based on Ayurvedic tradition and general
                  wellness practices. It is not intended to diagnose, treat, or
                  cure any disease.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
