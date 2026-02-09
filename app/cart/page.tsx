"use client";

import { SiteShell } from "@/components/SiteShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/CartProvider";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseClient"; // or authClient
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CartPage() {
  const cart = useCart();

  const router = useRouter();

async function checkout() {
  const user = auth.currentUser;

  if (!user) {
    router.push("/login?next=/cart");
    return;
  }

  try {
    const order = {
      userId: user.uid,
      email: user.email ?? null,
      currency: "INR",
      items: cart.items.map((it) => ({
        id: it.id,
        slug: it.slug,
        title: it.title,
        qty: it.qty,
        priceINR: it.priceINR ?? null,
      })),
      status: "created",
      createdAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, "orders"), order);

    // optional: clear cart after order is created
    cart.clear();

    router.push(`/order/${ref.id}`);
  } catch (e: any) {
    console.error(e);
    alert("Checkout failed due to permissions. Please try again.");
  }
}

  const subtotalINR = cart.items.reduce((sum, it) => sum + (it.priceINR ?? 0) * it.qty, 0);

  return (
    <SiteShell>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="text-[11px] tracking-[0.28em] uppercase text-[hsl(var(--muted))]">
            Your selection
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
            Cart
          </h1>
          <div className="h-px w-24 bg-[hsl(var(--gold))]/70" />
        </div>

        {cart.items.length === 0 ? (
          <div className="text-sm text-[hsl(var(--muted))]">
            Your cart is empty.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((it) => (
                <Card key={it.id}>
                  <CardContent className="flex items-center gap-6">
                    <div className="h-16 w-14 rounded-[16px] border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]" />
                    <div className="flex-1">
                      <div className="font-semibold">{it.title}</div>
                      <div className="text-xs text-[hsl(var(--muted))] mt-1">
                        {it.priceINR ? `₹${it.priceINR}` : "Price coming soon"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => cart.setQty(it.id, it.qty - 1)}
                      >
                        −
                      </Button>
                      <div className="w-10 text-center text-sm">{it.qty}</div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => cart.setQty(it.id, it.qty + 1)}
                      >
                        +
                      </Button>
                    </div>

                    <Button size="sm" variant="ghost" onClick={() => cart.remove(it.id)}>
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <div>
                <Button variant="ghost" onClick={cart.clear}>
                  Clear cart
                </Button>
              </div>
            </div>

            <Card className="h-fit">
              <CardContent className="space-y-4">
                <div className="text-sm font-semibold">Order summary</div>
                <div className="h-px w-full bg-[hsl(var(--border))]" />

                <div className="flex items-center justify-between text-sm">
                  <div className="text-[hsl(var(--muted))]">Subtotal</div>
                  <div className="font-semibold">
                    {subtotalINR ? `₹${subtotalINR}` : "—"}
                  </div>
                </div>

                <div className="text-xs text-[hsl(var(--muted))] leading-6">
                  Taxes & shipping will be calculated at checkout.
                </div>
                
                <Button size="lg" className="w-full" onClick={checkout}>
                  Checkout
                </Button>

                <div className="text-xs text-[hsl(var(--muted))]">
                  Traditional use • Not medical advice
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SiteShell>
  );
}