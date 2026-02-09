import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit } from "firebase/firestore";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const q = query(
    collection(db, "products"),
    where("slug", "==", slug),
    where("active", "==", true),
    limit(1)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    return new Response("Not found", { status: 404 });
  }

  const doc = snap.docs[0];
  const data = doc.data() as any;

  return Response.json({
    id: doc.id,
    title: data.name ?? data.title ?? "",
    slug: data.slug ?? doc.id,
    description: data.description ?? "",
    categoryId: data.categoryId ?? "",
    categoryName: data.categoryName ?? "",
    images: data.images ?? [],
    prices: data.prices ?? {},
    stock: data.stock ?? 0,
  });
}
