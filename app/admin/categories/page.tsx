"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sortOrder: number;
  imageUrl?: string;
  imageAlt?: string;
};

function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // create form
  const [newName, setNewName] = useState("");
  const [newSortOrder, setNewSortOrder] = useState<number>(0);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");

  // editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<number>(0);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageAlt, setEditImageAlt] = useState("");

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  async function load() {
    setLoading(true);
    const q = query(collection(db, "categories"), orderBy("sortOrder", "asc"));
    const snap = await getDocs(q);

    const list = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        name: (data.name ?? "") as string,
        slug: (data.slug ?? d.id) as string,
        active: (data.active ?? true) as boolean,
        sortOrder: Number(data.sortOrder ?? 0),
        imageUrl: (data.imageUrl ?? "") as string,
        imageAlt: (data.imageAlt ?? "") as string,
      } as Category;
    });

    setRows(list);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    // suggest next sort order
    const max = rows.reduce((m, r) => Math.max(m, r.sortOrder ?? 0), 0);
    setNewSortOrder(max + 10);
  }, [rows]);

  const canCreate = useMemo(() => newName.trim().length > 1 && !busy, [newName, busy]);

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditSlug(c.slug);
    setEditSortOrder(c.sortOrder);
    setEditImageUrl(c.imageUrl ?? "");
    setEditImageAlt(c.imageAlt ?? "");
    setStatus("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditSlug("");
    setEditSortOrder(0);
    setEditImageUrl("");
    setEditImageAlt("");
  }

  async function createCategory() {
    if (!canCreate) return;

    setBusy(true);
    setStatus("");

    try {
      const name = newName.trim();
      const slug = slugify(name);

      await addDoc(collection(db, "categories"), {
        name,
        slug,
        active: true,
        sortOrder: Number.isFinite(newSortOrder) ? newSortOrder : rows.length * 10,
        imageUrl: newImageUrl.trim(),
        imageAlt: newImageAlt.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setNewName("");
      setNewImageUrl("");
      setNewImageAlt("");
      await load();
      setStatus("Category created.");
    } catch (e: any) {
      setStatus(e?.message ? `Error: ${e.message}` : "Error creating category.");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    if (!editingId) return;

    setBusy(true);
    setStatus("");

    try {
      await updateDoc(doc(db, "categories", editingId), {
        name: editName.trim(),
        slug: editSlug.trim() || slugify(editName),
        sortOrder: Number(editSortOrder ?? 0),
        imageUrl: editImageUrl.trim(),
        imageAlt: editImageAlt.trim(),
        updatedAt: serverTimestamp(),
      });

      cancelEdit();
      await load();
      setStatus("Saved.");
    } catch (e: any) {
      setStatus(e?.message ? `Error: ${e.message}` : "Error saving category.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(c: Category) {
    setBusy(true);
    setStatus("");
    try {
      await updateDoc(doc(db, "categories", c.id), {
        active: !c.active,
        updatedAt: serverTimestamp(),
      });
      await load();
    } catch (e: any) {
      setStatus(e?.message ? `Error: ${e.message}` : "Error updating category.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteCategory(c: Category) {
    if (!confirm(`Delete category "${c.name}"? This cannot be undone.`)) return;

    setBusy(true);
    setStatus("");

    try {
      const pq = query(collection(db, "products"), where("categoryId", "==", c.id), limit(1));
      const psnap = await getDocs(pq);
      if (!psnap.empty) {
        setStatus("Cannot delete: this category is used by at least one product.");
        setBusy(false);
        return;
      }

      await deleteDoc(doc(db, "categories", c.id));
      await load();
      setStatus("Deleted.");
    } catch (e: any) {
      setStatus(e?.message ? `Error: ${e.message}` : "Error deleting category.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <div className="text-sm text-zinc-500">Categories</div>
          <div className="text-lg font-medium">Manage categories</div>
        </div>
      </div>

      {/* CREATE */}
      <div className="border-b p-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_140px_120px]">
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="New category (e.g. Hair Care)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <input
            type="number"
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Sort"
            value={newSortOrder}
            onChange={(e) => setNewSortOrder(Number(e.target.value))}
          />

          <button
            onClick={createCategory}
            disabled={!canCreate}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Image URL (optional)"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
          />
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Image alt text (optional)"
            value={newImageAlt}
            onChange={(e) => setNewImageAlt(e.target.value)}
          />
        </div>

        <div className="text-xs text-zinc-500">
          Tip: set an image URL so category cards look premium on the homepage and shop page.
        </div>
      </div>

      {/* STATUS */}
      {status ? <div className="border-b p-4 text-sm text-zinc-600">{status}</div> : null}

      {/* LIST */}
      {loading ? (
        <div className="p-4 text-sm text-zinc-500">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr className="border-b">
                <th className="p-3">Preview</th>
                <th className="p-3">Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Sort</th>
                <th className="p-3">Status</th>
                <th className="p-3 w-[320px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const editing = editingId === c.id;

                return (
                  <tr key={c.id} className="border-b hover:bg-zinc-50 align-top">
                    <td className="p-3">
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt={c.imageAlt || c.name}
                          className="h-12 w-12 rounded-xl object-cover border"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-xl border bg-zinc-50" />
                      )}
                    </td>

                    <td className="p-3">
                      {editing ? (
                        <input
                          className="w-full rounded-lg border px-2 py-1"
                          value={editName}
                          onChange={(e) => {
                            setEditName(e.target.value);
                            if (!editSlug || editSlug === slugify(c.name)) {
                              setEditSlug(slugify(e.target.value));
                            }
                          }}
                        />
                      ) : (
                        <div className="font-medium">{c.name}</div>
                      )}

                      {editing ? (
                        <div className="mt-2 grid gap-2">
                          <input
                            className="w-full rounded-lg border px-2 py-1 text-xs"
                            value={editImageUrl}
                            onChange={(e) => setEditImageUrl(e.target.value)}
                            placeholder="Image URL"
                          />
                          <input
                            className="w-full rounded-lg border px-2 py-1 text-xs"
                            value={editImageAlt}
                            onChange={(e) => setEditImageAlt(e.target.value)}
                            placeholder="Image alt text"
                          />
                        </div>
                      ) : null}
                    </td>

                    <td className="p-3 text-zinc-600">
                      {editing ? (
                        <input
                          className="w-full rounded-lg border px-2 py-1"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                        />
                      ) : (
                        c.slug
                      )}
                    </td>

                    <td className="p-3">
                      {editing ? (
                        <input
                          type="number"
                          className="w-full rounded-lg border px-2 py-1"
                          value={editSortOrder}
                          onChange={(e) => setEditSortOrder(Number(e.target.value))}
                        />
                      ) : (
                        c.sortOrder
                      )}
                    </td>

                    <td className="p-3">
                      <span className="rounded-full border px-2 py-1 text-xs">
                        {c.active ? "active" : "inactive"}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {!editing ? (
                          <>
                            <button
                              onClick={() => startEdit(c)}
                              disabled={busy}
                              className="rounded-lg border px-3 py-1 text-xs"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => toggleActive(c)}
                              disabled={busy}
                              className="rounded-lg border px-3 py-1 text-xs"
                            >
                              {c.active ? "Deactivate" : "Activate"}
                            </button>

                            <button
                              onClick={() => deleteCategory(c)}
                              disabled={busy}
                              className="rounded-lg border px-3 py-1 text-xs text-red-700"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={saveEdit}
                              disabled={busy || editName.trim().length < 2}
                              className="rounded-lg bg-black px-3 py-1 text-xs text-white disabled:opacity-50"
                            >
                              Save
                            </button>

                            <button
                              onClick={cancelEdit}
                              disabled={busy}
                              className="rounded-lg border px-3 py-1 text-xs"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td className="p-4 text-sm text-zinc-500" colSpan={6}>
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
