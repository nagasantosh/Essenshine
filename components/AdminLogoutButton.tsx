"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseClient";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.replace("/");
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-full border px-3 py-1 text-sm hover:bg-zinc-50"
    >
      Logout
    </button>
  );
}
