"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

type CategoryRow = { id: string; name: string; slug?: string; active?: boolean; sortOrder?: number };

function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminProductUpsertPage() {
  const router = useRouter();
  const params = useParams<{ productId: string }>();
  const productId = params.productId;

  const isNew = productId === "new";

  // ----- categories -----
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  // ----- product fields -----
  const [name, setName] = useState("");
  const [slug, setSlug] = useState(""); // used as ID when creating
  const [description, setDescription] = useState("");
  const [imagesText, setImagesText] = useState(""); // one URL per line

  const [priceINR, setPriceINR] = useState<number>(0);
  const [priceUSD, setPriceUSD] = useState<number>(0);
  const [priceEUR, setPriceEUR] = useState<number>(0);

  const [stock, setStock] = useState<number>(0);
  const [active, setActive] = useState<boolean>(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");

  const selectedCategoryName = useMemo(() => {
    return categories.find((c) => c.id === categoryId)?.name ?? "";
  }, [categories, categoryId]);

  const images = useMemo(() => {
    return imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [imagesText]);

  const canSave = useMemo(() => {
    if (saving) return false;
    if (!name.trim()) return false;

    // On create, slug is required (used as doc id)
    if (isNew && !slug.trim()) return false;

    // Category recommended — require it once categories exist
    if (categories.length > 0 && !categoryId) return false;

    return true;
  }, [saving, name, slug, isNew, categories.length, categoryId]);

  // Load categories + product (if editing)
  useEffect(() => {
    async function run() {
      setLoading(true);
      setStatus("");

      // 1) Load categories (active only)
      const cq = query(collection(db, "categories"), orderBy("sortOrder", "asc"));
      const csnap = await getDocs(cq);
      const catRows = csnap.docs
        .map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data.name as string,
            slug: data.slug as string | undefined,
            active: data.active as boolean | undefined,
            sortOrder: data.sortOrder as number | undefined,
          } as CategoryRow;
        })
        .filter((c) => !!c.name)
        .filter((c) => c.active !== false);

      setCategories(catRows);

      // Default category selection for new products
      if (isNew) {
        setCategoryId((prev) => prev || catRows[0]?.id || "");
      }

      // 2) If editing, load product data
      if (!isNew) {
        const pref = doc(db, "products", productId);
        const psnap = await getDoc(pref);

        if (!psnap.exists()) {
          router.replace("/admin/products");
          return;
        }

        const p = psnap.data() as any;

        setName(p.name ?? "");
        setSlug(p.slug ?? productId); // keep for display; won't change doc id
        setDescription(p.description ?? "");

        const imgs: string[] = Array.isArray(p.images) ? p.images : [];
        setImagesText(imgs.join("\n"));

        setPriceINR(Number(p.prices?.INR ?? 0));
        setPriceUSD(Number(p.prices?.USD ?? 0));
        setPriceEUR(Number(p.prices?.EUR ?? 0));

        setStock(Number(p.stock ?? 0));
        setActive(!!p.active);

        // category (new model)
        const existingCategoryId = p.categoryId ?? "";
        if (existingCategoryId) {
          setCategoryId(existingCategoryId);
        } else {
          // fallback: if only categoryName exists, try to match by name
          const existingName = (p.categoryName ?? "").toString();
          const match = catRows.find((c) => c.name === existingName);
          setCategoryId(match?.id ?? catRows[0]?.id ?? "");
        }
      }

      setLoading(false);
    }

    run();
  }, [productId, isNew, router]);

  // Auto-slugify from name for new product (only if slug empty)
  useEffect(() => {
    if (!isNew) return;
    if (!name) return;
    if (slug) return;
    setSlug(slugify(name));
  }, [isNew, name, slug]);

  async function save() {
    if (!canSave) return;

    setSaving(true);
    setStatus("");

    try {
      const payload: any = {
        name: name.trim(),
        // keep slug field for frontend routing; when new, doc id = slug
        slug: slug.trim() || productId,
        description: description.trim(),
        images,
        prices: {
          INR: Number.isFinite(priceINR) ? priceINR : 0,
          USD: Number.isFinite(priceUSD) ? priceUSD : 0,
          EUR: Number.isFinite(priceEUR) ? priceEUR : 0,
        },
        stock: Number.isFinite(stock) ? stock : 0,
        active: !!active,

        // ✅ Category (dynamic)
        categoryId: categoryId || null,
        categoryName: selectedCategoryName || null,

        updatedAt: serverTimestamp(),
      };

      if (isNew) {
        const id = slug.trim();
        const ref = doc(db, "products", id);

        // create
        await setDoc(ref, {
          ...payload,
          createdAt: serverTimestamp(),
        });

        setStatus("Created.");
        router.replace("/admin/products");
        return;
      }

      // edit
      await updateDoc(doc(db, "products", productId), payload);

      setStatus("Saved.");
      router.replace("/admin/products");
    } catch (e: any) {
      setStatus(e?.message ? `Error: ${e.message}` : "Error saving product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top header row like your admin UI */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-zinc-500">Products</div>
          <div className="text-2xl font-semibold">{isNew ? "Create" : "Edit"}</div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products"
            className="rounded-2xl border px-4 py-2 text-sm font-medium"
          >
            Back
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border p-6 text-sm text-zinc-500">Loading…</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT: main fields */}
          <div className="rounded-2xl border p-6 space-y-6">
            <div>
              <div className="text-sm text-zinc-500">{isNew ? "New product" : "Product"}</div>
              <div className="text-xl font-semibold">{isNew ? "Create" : "Update"}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Name</div>
              <input
                className="w-full rounded-xl border px-4 py-3 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amla Hair Oil"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">
                Slug {isNew ? "(used as ID)" : "(read-only)"}
              </div>
              <input
                className="w-full rounded-xl border px-4 py-3 text-sm"
                value={slug}
                onChange={(e) => isNew && setSlug(e.target.value)}
                disabled={!isNew}
                placeholder="e.g. amla-hair-oil"
              />
              {!isNew ? (
                <div className="text-xs text-zinc-500">
                  To change the ID later, create a new product and migrate (keeping this simple for MVP).
                </div>
              ) : null}
            </div>

            {/* ✅ Category */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Category</div>
              <select
                className="w-full rounded-xl border px-4 py-3 text-sm"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 ? (
                <div className="text-xs text-zinc-500">
                  No categories found. Create Firestore collection <b>categories</b> first.
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Description</div>
              <textarea
                className="w-full rounded-xl border px-4 py-3 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Images (one URL per line)</div>
              <textarea
                className="w-full rounded-xl border px-4 py-3 text-sm"
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
                rows={4}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* RIGHT: pricing & inventory */}
          <div className="rounded-2xl border p-6 space-y-5">
            <div className="text-sm text-zinc-500">Pricing & Inventory</div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Price INR</div>
              <input
                type="number"
                className="w-full rounded-xl border px-4 py-3 text-sm"
                value={priceINR}
                onChange={(e) => setPriceINR(Number(e.target.value))}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Price USD</div>
              <input
                type="number"
                className="w-full rounded-xl border px-4 py-3 text-sm"
                value={priceUSD}
                onChange={(e) => setPriceUSD(Number(e.target.value))}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Price EUR</div>
              <input
                type="number"
                className="w-full rounded-xl border px-4 py-3 text-sm"
                value={priceEUR}
                onChange={(e) => setPriceEUR(Number(e.target.value))}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Stock</div>
              <input
                type="number"
                className="w-full rounded-xl border px-4 py-3 text-sm"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                min={0}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Active
            </label>

            <button
              onClick={save}
              disabled={!canSave}
              className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>

            {status ? (
              <div className="text-sm text-zinc-600">{status}</div>
            ) : null}

            {/* Helpful preview info */}
            {selectedCategoryName ? (
              <div className="text-xs text-zinc-500">
                Will be shown to customers under: <b>{selectedCategoryName}</b>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
