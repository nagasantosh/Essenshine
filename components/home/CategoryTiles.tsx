import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Category = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
};

function GoldRule() {
  return <div className="h-px w-24 bg-[hsl(var(--gold))]/70" />;
}

function categoryBlurb(name: string) {
  const n = name.toLowerCase();
  if (n.includes("hair")) return "Nourish scalp, strengthen roots, and restore shine.";
  if (n.includes("skin")) return "Daily essentials for clean, balanced, calm skin.";
  if (n.includes("face")) return "Weekly rituals for clarity, softness, and glow.";
  return "Curated essentials crafted for modern herbal rituals.";
}

export default function CategoryTiles({ categories }: { categories: Category[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="text-[11px] tracking-[0.28em] uppercase text-[hsl(var(--muted))]">
            Shop by category
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Begin with a ritual.
          </h2>
          <GoldRule />
        </div>

        <Link
          className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--text))] transition"
          href="/shop"
        >
          View all →
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {categories.map((c) => {
          const href = `/shop?category=${encodeURIComponent(c.id)}`;
          const desc = c.description?.trim() ? c.description : categoryBlurb(c.name);

          return (
            <Card key={c.id} className="overflow-hidden group">
              <div className="relative h-48 bg-[hsl(var(--surface-2))] border-b border-[hsl(var(--border))]">
                <div className="absolute left-6 top-6 z-10">
                  <Badge>{c.name}</Badge>
                </div>

                {c.imageUrl ? (
                  <>
                    <img
                      src={c.imageUrl}
                      alt={c.imageAlt || c.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="h-28 w-20 rounded-[18px] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-sm transition-transform duration-300 group-hover:scale-[1.02]" />
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/10 to-transparent" />
              </div>

              <CardContent>
                <div className="text-lg font-semibold">{c.name}</div>
                <p className="mt-2 text-sm text-[hsl(var(--muted))] leading-6">
                  {desc}
                </p>

                <div className="mt-5 flex items-center gap-2">
                  <Button href={href} size="sm">
                    Explore
                  </Button>
                  <Link
                    href={href}
                    className="text-xs text-[hsl(var(--muted))] hover:text-[hsl(var(--text))] transition"
                  >
                    View items →
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
