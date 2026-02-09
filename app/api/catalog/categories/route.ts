import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

export async function GET() {
  const q = query(
    collection(db, "categories"),
    where("active", "==", true),
    orderBy("sortOrder", "asc")
  );

  const snap = await getDocs(q);

  const categories = snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      name: data.name ?? "",
      slug: data.slug ?? d.id,
      sortOrder: data.sortOrder ?? 0,
      active: data.active ?? true,
      description: data.description ?? "",
      imageUrl: data.imageUrl ?? "",
      imageAlt: data.imageAlt ?? "",
    };
  });

  return Response.json(categories);
}
