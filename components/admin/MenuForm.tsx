"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/cart";
import type { Menu } from "@/lib/types";

export function MenuManager({ menus: initial }: { menus: Menu[] }) {
  const router = useRouter();
  const [menus, setMenus] = useState(initial);
  const [editing, setEditing] = useState<Menu | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startCreate() {
    setEditing(null);
    setOpen(true);
    setError(null);
  }

  function startEdit(m: Menu) {
    setEditing(m);
    setOpen(true);
    setError(null);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const supabase = createBrowserSupabase();

    let image_url = editing?.image_url ?? null;
    const file = fd.get("image") as File | null;
    if (file && file.size > 0) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("menu-images")
        .upload(path, file, { upsert: true });
      if (upErr) {
        setBusy(false);
        setError(upErr.message);
        return;
      }
      const { data } = supabase.storage.from("menu-images").getPublicUrl(path);
      image_url = data.publicUrl;
    }

    const payload = {
      name: String(fd.get("name") || "").trim(),
      description: String(fd.get("description") || "").trim() || null,
      price: Number(fd.get("price") || 0),
      category: String(fd.get("category") || "기타").trim() || "기타",
      is_available: fd.get("is_available") === "on",
      sort_order: Number(fd.get("sort_order") || 0),
      image_url,
    };

    if (editing) {
      const { data, error: err } = await supabase
        .from("menus")
        .update(payload)
        .eq("id", editing.id)
        .select()
        .single();
      if (err) {
        setBusy(false);
        setError(err.message);
        return;
      }
      setMenus((prev) => prev.map((m) => (m.id === editing.id ? (data as Menu) : m)));
    } else {
      const { data, error: err } = await supabase
        .from("menus")
        .insert(payload)
        .select()
        .single();
      if (err) {
        setBusy(false);
        setError(err.message);
        return;
      }
      setMenus((prev) => [...prev, data as Menu].sort((a, b) => a.sort_order - b.sort_order));
    }

    setBusy(false);
    setOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function toggleAvailable(m: Menu) {
    const supabase = createBrowserSupabase();
    const { data, error: err } = await supabase
      .from("menus")
      .update({ is_available: !m.is_available })
      .eq("id", m.id)
      .select()
      .single();
    if (err) {
      alert(err.message);
      return;
    }
    setMenus((prev) => prev.map((x) => (x.id === m.id ? (data as Menu) : x)));
    router.refresh();
  }

  async function remove(m: Menu) {
    if (!confirm(`「${m.name}」을(를) 삭제할까요?`)) return;
    const supabase = createBrowserSupabase();
    const { error: err } = await supabase.from("menus").delete().eq("id", m.id);
    if (err) {
      alert(err.message);
      return;
    }
    setMenus((prev) => prev.filter((x) => x.id !== m.id));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <button type="button" className="btn btn-primary w-full" onClick={startCreate}>
        + 메뉴 추가
      </button>

      {open && (
        <form onSubmit={onSubmit} className="card p-4 space-y-3">
          <h2 className="font-bold">{editing ? "메뉴 수정" : "새 메뉴"}</h2>
          <div>
            <label htmlFor="name">이름</label>
            <input id="name" name="name" required defaultValue={editing?.name ?? ""} />
          </div>
          <div>
            <label htmlFor="description">설명</label>
            <input
              id="description"
              name="description"
              defaultValue={editing?.description ?? ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="price">가격</label>
              <input
                id="price"
                name="price"
                type="number"
                min={0}
                required
                defaultValue={editing?.price ?? 4000}
              />
            </div>
            <div>
              <label htmlFor="sort_order">정렬</label>
              <input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={editing?.sort_order ?? 0}
              />
            </div>
          </div>
          <div>
            <label htmlFor="category">카테고리</label>
            <input
              id="category"
              name="category"
              defaultValue={editing?.category ?? "커피"}
              placeholder="커피 / 논커피 / 디저트"
            />
          </div>
          <div>
            <label htmlFor="image">이미지</label>
            <input id="image" name="image" type="file" accept="image/*" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer !mb-0">
            <input
              type="checkbox"
              name="is_available"
              defaultChecked={editing?.is_available ?? true}
              className="h-4 w-4 accent-coffee"
            />
            <span className="text-sm font-semibold">판매 중</span>
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1" disabled={busy}>
              {busy ? "저장 중…" : "저장"}
            </button>
            <button
              type="button"
              className="btn btn-ghost flex-1"
              onClick={() => setOpen(false)}
            >
              닫기
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-2">
        {menus.map((m) => (
          <li key={m.id} className="card flex items-center gap-3 p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-dark">
              {m.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xl opacity-40">
                  ☕
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold truncate">
                {m.name}
                {!m.is_available && (
                  <span className="ml-2 text-xs font-semibold text-danger">품절</span>
                )}
              </p>
              <p className="text-sm text-ink-muted">
                {m.category} · {formatPrice(m.price)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                className="text-xs font-semibold text-coffee"
                onClick={() => startEdit(m)}
              >
                수정
              </button>
              <button
                type="button"
                className="text-xs font-semibold text-ink-muted"
                onClick={() => toggleAvailable(m)}
              >
                {m.is_available ? "품절" : "판매"}
              </button>
              <button
                type="button"
                className="text-xs font-semibold text-danger"
                onClick={() => remove(m)}
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
