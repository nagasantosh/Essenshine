import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");

  // Only active products
  let q = query(collection(db, "products"), where("active", "==", true));

  // Optional category filter
  if (category && category !== "all") {
    q = query(
      collection(db, "products"),
      where("active", "==", true),
      where("categoryId", "==", category)
    );
  }

  const snapshot = await getDocs(q);

  const products = snapshot.docs.map((doc) => {
    const data = doc.data() as any;

    return {
      id: doc.id,

      // name → title mapping
      title: data.name ?? data.title ?? "",

      slug: data.slug ?? doc.id,
      description: data.description ?? "",

      categoryId: data.categoryId ?? "",
      categoryName: data.categoryName ?? "",

      // ✅ Include product images
      images: data.images ?? [],

      active: data.active ?? false,
      stock: data.stock ?? 0,

      prices: data.prices ?? {},
    };
  });

  return Response.json(products);
}
