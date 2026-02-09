"use client";

import Link from "next/link";
import { CartCount } from "@/components/CartCount";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import AdminLink from "@/components/AdminLink";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setSignedIn(!!u));
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))]">
      {/* Top luxury rule */}
      <div className="h-[2px] w-full bg-[hsl(var(--gold))]/60" />

      <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg))]/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] grid place-items-center shadow-sm">
              <span className="text-sm tracking-[0.22em] text-[hsl(var(--brand))] font-semibold">
                ES
              </span>
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold tracking-[0.18em] uppercase">
                Essenshine
              </div>
              <div className="text-xs text-[hsl(var(--muted))]">
                Natural Herbal Products • Hyderabad
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6 text-sm flex-wrap justify-end">
            <Link
              className="text-[hsl(var(--muted))] hover:text-[hsl(var(--text))] transition"
              href="/shop"
            >
              Shop
            </Link>

            {signedIn && (
              <Link
                className="text-[hsl(var(--muted))] hover:text-[hsl(var(--text))] transition"
                href="/account/orders"
              >
                My Orders
              </Link>
            )}

            <Link
              className="text-[hsl(var(--muted))] hover:text-[hsl(var(--text))] transition"
              href="/cart"
            >
              Cart <CartCount />
            </Link>

            {/* Admin only (shows only if user is in admins/{uid}) */}
            <AdminLink />

            <Link
              href="/disclaimer"
              className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-2 text-sm shadow-sm hover:bg-[hsl(var(--surface-2))] transition"
            >
              Disclaimer
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">{children}</main>

      <footer className="mt-16 border-t border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
        <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-[hsl(var(--muted))] space-y-2">
          <p className="text-xs">
            Disclaimer: Traditional use only. Content is for general wellness information and not medical advice.
          </p>
          <p className="text-xs">© {new Date().getFullYear()} Essenshine Natural Herbal Products</p>
        </div>
      </footer>
    </div>
  );
}
