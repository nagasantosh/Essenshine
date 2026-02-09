import { SiteShell } from "@/components/SiteShell";

export default function CartPage() {
  return (
    <SiteShell>
      <h1 className="text-2xl font-semibold">Cart</h1>
      <p className="mt-2 text-[hsl(var(--muted))]">
        Next: cart state + totals.
      </p>
    </SiteShell>
  );
}