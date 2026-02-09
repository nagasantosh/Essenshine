"use client";

import { useEffect, useState } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter, useSearchParams } from "next/navigation";

export default function FinishSignInPage() {
  const [status, setStatus] = useState("Signing you in…");
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  useEffect(() => {
    async function complete() {
      const href = window.location.href;

      if (!isSignInWithEmailLink(auth, href)) {
        setStatus("Invalid or expired sign-in link.");
        return;
      }

      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt("Confirm your email") ?? "";
      }

      await signInWithEmailLink(auth, email, href);
      window.localStorage.removeItem("emailForSignIn");

      router.replace(next);
    }

    complete();
  }, [router, next]);

  return <div className="p-10 text-sm">{status}</div>;
}