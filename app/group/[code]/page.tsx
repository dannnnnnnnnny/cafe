"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatPrice, formatWhen, useCart } from "@/lib/cart";
import type { DeliveryGroup, GroupStatus } from "@/lib/types";

type Participant = {
  orderNumber: string;
  customerName: string;
  status: string;
  itemCount: number;
  total: number;
};

const STATUS_KO: Record<GroupStatus, string> = {
  open: "모집 중",
  closed: "마감",
  done: "완료",
  cancelled: "취소",
};

export default function GroupPage() {
  const params = useParams<{ code: string }>();
  const code = String(params.code || "").toUpperCase();
  const { setGroupCode, totalCount, totalPrice, groupCode: cartGroup } =
    useCart();
  const [group, setGroup] = useState<DeliveryGroup | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/groups/${code}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "불러오기 실패");
      return;
    }
    setGroup(data.group as DeliveryGroup);
    setParticipants(data.participants as Participant[]);
  }, [code]);

  useEffect(() => {
    load();
  }, [load]);

  async function copyLink() {
    const url = `${window.location.origin}/group/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      prompt("링크를 복사하세요", url);
    }
  }

  function join() {
    setGroupCode(code);
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-3xl mb-3">😕</p>
        <p className="font-semibold">{error}</p>
        <Link href="/" className="btn btn-primary mt-6 inline-flex">
          홈으로
        </Link>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-ink-muted">
        불러오는 중…
      </div>
    );
  }

  const open = group.status === "open";
  const grandTotal = participants.reduce((s, p) => s + p.total, 0);

  return (
    <div className="mx-auto min-h-full max-w-lg px-4 pb-10">
      <header className="flex items-center gap-3 pt-6 pb-5">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-foam shadow-sm"
        >
          ←
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold tracking-wide text-coffee">합배송</p>
          <h1 className="truncate text-xl font-bold">{group.company_name}</h1>
        </div>
        <span
          className={`badge ${
            group.status === "open"
              ? "badge-pending"
              : group.status === "done"
                ? "badge-done"
                : "badge-cancelled"
          }`}
        >
          {STATUS_KO[group.status]}
        </span>
      </header>

      <section className="card space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-muted">초대 코드</p>
            <p className="text-2xl font-bold tracking-[0.25em] text-coffee">
              {group.code}
            </p>
          </div>
          <button type="button" className="btn btn-ghost text-sm py-2" onClick={copyLink}>
            {copied ? "복사됨 ✓" : "링크 복사"}
          </button>
        </div>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-ink-muted">배달 주소</dt>
            <dd className="font-semibold">📍 {group.delivery_address}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">희망 시간</dt>
            <dd className="font-semibold">{formatWhen(group.preferred_at)}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">주최</dt>
            <dd className="font-semibold">
              {group.host_name}
              {group.host_phone ? ` · ${group.host_phone}` : ""}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-4 card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">참가자 {participants.length}명</h2>
          <span className="text-sm font-bold text-coffee">
            {formatPrice(grandTotal)}
          </span>
        </div>
        {participants.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">
            아직 참여한 주문이 없어요. 첫 번째로 담아 보세요!
          </p>
        ) : (
          <ul className="divide-y divide-cream-dark">
            {participants.map((p) => (
              <li key={p.orderNumber} className="flex justify-between py-2.5 text-sm">
                <span>
                  <span className="font-semibold">{p.customerName}</span>
                  <span className="text-ink-muted">
                    {" "}
                    · {p.itemCount}개 · #{p.orderNumber}
                  </span>
                </span>
                <span className="tabular-nums text-ink-muted">
                  {formatPrice(p.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 space-y-3 pb-8">
        {open && totalCount > 0 && cartGroup === code ? (
          <>
            <Link href="/checkout" className="btn btn-primary flex w-full justify-between py-4">
              <span>주문하기 ({totalCount}개)</span>
              <span className="tabular-nums">{formatPrice(totalPrice)}</span>
            </Link>
            <Link
              href="/"
              onClick={join}
              className="btn btn-ghost flex w-full"
            >
              메뉴 더 담기
            </Link>
          </>
        ) : open ? (
          <>
            <Link
              href="/"
              onClick={join}
              className="btn btn-primary flex w-full py-4"
            >
              메뉴 담고 참여하기
            </Link>
            <p className="text-center text-xs text-ink-muted">
              메뉴를 담은 뒤 하단 또는 이 화면의 「주문하기」로 신청합니다.
            </p>
          </>
        ) : (
          <p className="rounded-xl bg-cream-dark px-4 py-3 text-center text-sm text-ink-muted">
            이 모임은 마감되어 더 이상 참여할 수 없어요.
          </p>
        )}
        <Link href="/" className="btn btn-ghost flex w-full">
          메뉴만 보기
        </Link>
      </div>
    </div>
  );
}
