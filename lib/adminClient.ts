import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export async function isUserAdmin(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "admins", uid));
  return snap.exists();
}
