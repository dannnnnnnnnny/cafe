"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/cart";
import type { Menu } from "@/lib/types";

export function MenuManager({ menus: initial }: { menus: Menu[] }) {
  const router = useRouter();
  const [menus, setMenus] = useState(initial);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setMenus(initial);
  }, [initial]);

  useEffect(() => {
    if (editingId && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [editingId]);

  const editing =
    editingId === "new"
      ? null
      : menus.find((m) => m.id === editingId) ?? null;

  function startCreate() {
    setEditingId("new");
    setError(null);
  }

  function startEdit(m: Menu) {
    setEditingId(m.id);
    setError(null);
  }

  function closeForm() {
    setEditingId(null);
    setError(null);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
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
        setSaving(false);
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
      category: String(fd.get("category") || "디저트").trim() || "디저트",
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
        setSaving(false);
        setError(err.message);
        return;
      }
      setMenus((prev) =>
        prev
          .map((m) => (m.id === editing.id ? (data as Menu) : m))
          .sort((a, b) => a.sort_order - b.sort_order),
      );
    } else {
      const { data, error: err } = await supabase
        .from("menus")
        .insert(payload)
        .select()
        .single();
      if (err) {
        setSaving(false);
        setError(err.message);
        return;
      }
      setMenus((prev) =>
        [...prev, data as Menu].sort((a, b) => a.sort_order - b.sort_order),
      );
    }

    setSaving(false);
    closeForm();
    router.refresh();
  }

  async function toggleAvailable(m: Menu) {
    setBusyId(m.id);
    const next = !m.is_available;
    // 낙관적 업데이트
    setMenus((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, is_available: next } : x)),
    );
    const supabase = createBrowserSupabase();
    const { data, error: err } = await supabase
      .from("menus")
      .update({ is_available: next })
      .eq("id", m.id)
      .select()
      .single();
    setBusyId(null);
    if (err) {
      setMenus((prev) =>
        prev.map((x) =>
          x.id === m.id ? { ...x, is_available: m.is_available } : x,
        ),
      );
      alert(err.message);
      return;
    }
    setMenus((prev) => prev.map((x) => (x.id === m.id ? (data as Menu) : x)));
    router.refresh();
  }

  async function remove(m: Menu) {
    if (!confirm(`「${m.name}」을(를) 삭제할까요?\n삭제 후 복구할 수 없습니다.`)) {
      return;
    }
    setBusyId(m.id);
    const supabase = createBrowserSupabase();
    const { error: err } = await supabase.from("menus").delete().eq("id", m.id);
    setBusyId(null);
    if (err) {
      alert(err.message);
      return;
    }
    if (editingId === m.id) closeForm();
    setMenus((prev) => prev.filter((x) => x.id !== m.id));
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="btn btn-primary w-full py-3.5"
        onClick={startCreate}
      >
        + 메뉴 추가
      </button>

      <p className="px-0.5 text-xs text-ink-muted">
        품절 스위치는 바로 반영됩니다. 이름·가격은 「수정」에서 저장하세요.
      </p>

      <ul className="space-y-2">
        {menus.map((m) => {
          const isEditing = editingId === m.id;
          const busy = busyId === m.id;

          return (
            <li key={m.id} className="overflow-hidden rounded-2xl bg-foam shadow-sm">
              <div
                className={`flex items-center gap-3 p-3 ${
                  !m.is_available ? "bg-cream/80" : ""
                }`}
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-dark">
                  {m.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl opacity-40">
                      ☕
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">
                    {m.name}
                    {!m.is_available && (
                      <span className="ml-1.5 rounded-full bg-[#f0e0e0] px-1.5 py-0.5 text-[10px] font-bold text-danger">
                        품절
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {m.category} · {formatPrice(m.price)}
                  </p>
                </div>

                {/* 품절 토글 — 큰 터치 영역 */}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggleAvailable(m)}
                  className="flex shrink-0 flex-col items-center gap-0.5"
                  aria-label={m.is_available ? "품절 처리" : "판매 재개"}
                >
                  <span
                    className={`relative h-7 w-12 rounded-full transition ${
                      m.is_available ? "bg-success" : "bg-[#c4bbb4]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                        m.is_available ? "left-5" : "left-0.5"
                      }`}
                    />
                  </span>
                  <span className="text-[10px] font-bold text-ink-muted">
                    {m.is_available ? "판매중" : "품절"}
                  </span>
                </button>
              </div>

              {/* 액션 버튼 한 줄 */}
              <div className="flex border-t border-cream-dark">
                <button
                  type="button"
                  className={`flex-1 py-2.5 text-sm font-bold ${
                    isEditing ? "bg-cream text-coffee" : "text-coffee"
                  }`}
                  onClick={() => (isEditing ? closeForm() : startEdit(m))}
                >
                  {isEditing ? "접기" : "수정"}
                </button>
                <div className="w-px bg-cream-dark" />
                <button
                  type="button"
                  className="flex-1 py-2.5 text-sm font-bold text-danger disabled:opacity-40"
                  disabled={busy}
                  onClick={() => remove(m)}
                >
                  삭제
                </button>
              </div>

              {/* 인라인 수정 폼 */}
              {isEditing && (
                <MenuEditForm
                  key={m.id}
                  formRef={formRef}
                  editing={m}
                  error={error}
                  saving={saving}
                  onSubmit={onSubmit}
                  onCancel={closeForm}
                />
              )}
            </li>
          );
        })}
      </ul>

      {/* 새 메뉴 폼 — 목록 하단 또는 상단 직후 */}
      {editingId === "new" && (
        <div className="card overflow-hidden p-0">
          <div className="border-b border-cream-dark px-4 py-3">
            <p className="font-bold">새 메뉴</p>
          </div>
          <MenuEditForm
            formRef={formRef}
            editing={null}
            error={error}
            saving={saving}
            onSubmit={onSubmit}
            onCancel={closeForm}
          />
        </div>
      )}
    </div>
  );
}

function MenuEditForm({
  formRef,
  editing,
  error,
  saving,
  onSubmit,
  onCancel,
}: {
  formRef: React.RefObject<HTMLFormElement | null>;
  editing: Menu | null;
  error: string | null;
  saving: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="space-y-3 border-t border-cream-dark bg-cream/40 p-4"
    >
      <div>
        <label htmlFor="menu-name">이름</label>
        <input
          id="menu-name"
          name="name"
          required
          defaultValue={editing?.name ?? ""}
          placeholder="메뉴 이름"
        />
      </div>
      <div>
        <label htmlFor="menu-desc">설명 (선택)</label>
        <input
          id="menu-desc"
          name="description"
          defaultValue={editing?.description ?? ""}
          placeholder="간단한 설명"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="menu-price">가격 (원)</label>
          <input
            id="menu-price"
            name="price"
            type="number"
            min={0}
            step={100}
            required
            defaultValue={editing?.price ?? 2500}
            inputMode="numeric"
          />
        </div>
        <div>
          <label htmlFor="menu-sort">정렬 번호</label>
          <input
            id="menu-sort"
            name="sort_order"
            type="number"
            defaultValue={editing?.sort_order ?? 0}
            inputMode="numeric"
          />
        </div>
      </div>
      <div>
        <label htmlFor="menu-cat">카테고리</label>
        <input
          id="menu-cat"
          name="category"
          defaultValue={editing?.category ?? "디저트"}
          placeholder="디저트 / 커피 …"
        />
      </div>
      <div>
        <label htmlFor="menu-image">이미지 (선택)</label>
        <input id="menu-image" name="image" type="file" accept="image/*" />
        {editing?.image_url && (
          <p className="mt-1 text-[11px] text-ink-muted">
            새 파일을 고르지 않으면 기존 이미지 유지
          </p>
        )}
      </div>
      <label className="flex cursor-pointer items-center gap-2 !mb-0">
        <input
          type="checkbox"
          name="is_available"
          defaultChecked={editing?.is_available ?? true}
          className="h-5 w-5 accent-coffee"
        />
        <span className="text-sm font-semibold">판매 중으로 저장</span>
      </label>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="btn btn-primary flex-[2] py-3"
          disabled={saving}
        >
          {saving ? "저장 중…" : "저장"}
        </button>
        <button
          type="button"
          className="btn btn-ghost flex-1 py-3"
          onClick={onCancel}
          disabled={saving}
        >
          취소
        </button>
      </div>
    </form>
  );
}
