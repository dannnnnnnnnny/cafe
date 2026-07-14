"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function NewGroupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const defaultPreferred = (() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  })();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      companyName: String(fd.get("companyName") || ""),
      deliveryAddress: String(fd.get("deliveryAddress") || ""),
      preferredAt: String(fd.get("preferredAt") || ""),
      hostName: String(fd.get("hostName") || ""),
      hostPhone: String(fd.get("hostPhone") || ""),
    };

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { code?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "생성 실패");
      router.push(`/group/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "생성 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto min-h-full max-w-lg px-4 pb-10">
      <header className="flex items-center gap-3 pt-6 pb-5">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-foam shadow-sm"
          aria-label="뒤로"
        >
          ←
        </Link>
        <div>
          <h1 className="text-xl font-bold">합배송 모임 만들기</h1>
          <p className="text-sm text-ink-muted">회사 동료와 한 번에 배달받아요</p>
        </div>
      </header>

      <form onSubmit={onSubmit} className="card space-y-4 p-4">
        <div>
          <label htmlFor="companyName">회사명</label>
          <input id="companyName" name="companyName" required placeholder="예: 카페테크" />
        </div>
        <div>
          <label htmlFor="deliveryAddress">배달 주소</label>
          <input
            id="deliveryAddress"
            name="deliveryAddress"
            required
            placeholder="회사 주소 / 상세 위치"
          />
        </div>
        <div>
          <label htmlFor="preferredAt">희망 배달 시간</label>
          <input
            id="preferredAt"
            name="preferredAt"
            type="datetime-local"
            required
            defaultValue={defaultPreferred}
          />
        </div>
        <div>
          <label htmlFor="hostName">주최자 이름</label>
          <input id="hostName" name="hostName" required placeholder="홍길동" />
        </div>
        <div>
          <label htmlFor="hostPhone">주최자 연락처 (선택)</label>
          <input id="hostPhone" name="hostPhone" type="tel" placeholder="010-1234-5678" />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <button type="submit" className="btn btn-primary w-full py-3.5" disabled={loading}>
          {loading ? "만드는 중…" : "모임 만들고 링크 받기"}
        </button>
        <p className="text-center text-xs text-ink-muted">
          주소와 시간은 고정됩니다. 동료는 각자 메뉴만 담으면 돼요.
        </p>
      </form>
    </div>
  );
}
