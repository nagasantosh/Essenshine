"use client";

import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { isUserAdmin } from "@/lib/adminClient";

export default function AdminLink() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return setShow(false);
      setShow(await isUserAdmin(user.uid));
    });
    return () => unsub();
  }, []);

  if (!show) return null;

  return (
    <Link href="/admin" className="text-sm hover:underline underline-offset-4">
      Admin
    </Link>
  );
}
