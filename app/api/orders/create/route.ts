import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  const body = await req.json();

  const { userId, email, currency, items } = body ?? {};

  if (!userId || !Array.isArray(items) || items.length === 0) {
    return new Response("Invalid payload", { status: 400 });
  }

  const order = {
    userId,
    email: email ?? null,
    currency: currency ?? "INR",
    items: items.map((it: any) => ({
      id: String(it.id),
      slug: String(it.slug ?? ""),
      title: String(it.title ?? ""),
      qty: Number(it.qty ?? 1),
      priceINR: it.priceINR ?? null,
    })),
    status: "created",
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "orders"), order);
  return Response.json({ orderId: ref.id });
}