export const dynamic = "force-dynamic";
"use client";

import { useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const params = useSearchParams();
  const next = params.get("next") || "/";

  async function sendLink() {
    const actionCodeSettings = {
      url: `${window.location.origin}/finish-signin?next=${next}`,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem("emailForSignIn", email);
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-md p-10 space-y-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>

      <p className="text-sm text-[hsl(var(--muted))]">
        We’ll email you a one-time sign-in link.
      </p>

      <input
        className="w-full rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button onClick={sendLink} className="w-full">
        Send sign-in link
      </Button>

      {sent && (
        <div className="text-sm text-green-700">
          Link sent. Check your inbox.
        </div>
      )}
    </div>
  );
}
