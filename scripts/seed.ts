import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

async function seed() {
  const products = [
    {
      title: "Ashwagandha Powder",
      slug: "ashwagandha-powder",
      description: "Premium Ayurvedic herb for vitality & calm.",
      ingredients: ["Ashwagandha root"],
      usage: "1 tsp daily with warm water or milk",
      active: true,
    },
    {
      title: "Triphala Powder",
      slug: "triphala-powder",
      description: "Classic Ayurvedic blend for digestion support.",
      ingredients: ["Amla", "Haritaki", "Bibhitaki"],
      usage: "1 tsp before sleep with warm water",
      active: true,
    },
  ];

  for (const p of products) {
    await addDoc(collection(db, "products"), p);
    console.log("Seeded:", p.title);
  }

  process.exit();
}

seed();