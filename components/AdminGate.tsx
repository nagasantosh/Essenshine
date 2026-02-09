"use client";

import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseClient";
import { isUserAdmin } from "@/lib/adminClient";

export default function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let alive = true;

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!alive) return;

      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      const ok = await isUserAdmin(user.uid);
      if (!alive) return;

      setAllowed(ok);
      setLoading(false);

      if (!ok) router.replace("/");
    });

    return () => {
      alive = false;
      unsub();
    };
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="animate-pulse text-sm text-zinc-500">Checking admin access…</div>
      </div>
    );
  }

  if (!allowed) return null;
  return <>{children}</>;
}
