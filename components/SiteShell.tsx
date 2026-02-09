"use client";

import Link from "next/link";
import { CartCount } from "@/components/CartCount";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setSignedIn(!!u));
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))]">
      <div className="h-[2px] w-full bg-[hsl(var(--gold))]/60" />

      <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg))]/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:py-5 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] grid place-items-center shadow-sm">
              <span className="text-xs sm:text-sm tracking-[0.22em] text-[hsl(var(--brand))] font-semibold">
                ES
              </span>
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold tracking-[0.18em] uppercase">
                Essenshine
              </div>
              <div className="text-xs text-[hsl(var(--muted))]">
                Natural Herbal Products
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link className="text-[hsl(var(--muted))] hover:text-[hsl(var(--text))] transition" href="/shop">
              Shop
            </Link>

            {signedIn && (
              <Link className="text-[hsl(var(--muted))] hover:text-[hsl(var(--text))] transition" href="/account/orders">
                My Orders
              </Link>
            )}

            <Link className="text-[hsl(var(--muted))] hover:text-[hsl(var(--text))] transition" href="/cart">
              Cart <CartCount />
            </Link>

            <Link className="text-[hsl(var(--muted))] hover:text-[hsl(var(--text))] transition" href="/admin">
              Admin
            </Link>

            <Link
              href="/disclaimer"
              className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-2 text-sm shadow-sm hover:bg-[hsl(var(--surface-2))] transition"
            >
              Disclaimer
            </Link>
          </nav>

          {/* Mobile: cart + menu */}
          <div className="md:hidden flex items-center gap-3">
            <Link className="text-sm" href="/cart" aria-label="Cart">
              Cart <CartCount />
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm shadow-sm"
              aria-label="Open menu"
            >
              {mobileOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--bg))]">
            <div className="mx-auto max-w-6xl px-4 py-4 space-y-3 text-sm">
              <Link onClick={() => setMobileOpen(false)} className="block py-2" href="/shop">
                Shop
              </Link>

              {signedIn && (
                <Link onClick={() => setMobileOpen(false)} className="block py-2" href="/account/orders">
                  My Orders
                </Link>
              )}

              <Link onClick={() => setMobileOpen(false)} className="block py-2" href="/admin">
                Admin
              </Link>

              <Link
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-2 text-sm shadow-sm hover:bg-[hsl(var(--surface-2))] transition"
                href="/disclaimer"
              >
                Disclaimer
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">{children}</main>

      <footer className="mt-16 border-t border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12 text-sm text-[hsl(var(--muted))] space-y-2">
          <p className="text-xs">
            Disclaimer: Traditional use only. Content is for general wellness information and not medical advice.
          </p>
          <p className="text-xs">© {new Date().getFullYear()} Herbal Bharat</p>
        </div>
      </footer>
    </div>
  );
}
