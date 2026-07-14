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
  open: "메뉴 모집 중",
  closed: "마감",
  submitted: "어드민 전송됨",
  done: "완료",
  cancelled: "취소",
};

export default function GroupPage() {
  const params = useParams<{ code: string }>();
  const code = String(params.code || "").toUpperCase();
  const { ready, setGroupCode, totalCount, totalPrice } = useCart();
  const [group, setGroup] = useState<DeliveryGroup | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    if (group?.status === "open" && code) {
      setGroupCode(code);
    }
  }, [group?.status, code, setGroupCode]);

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

  function joinAndShop() {
    setGroupCode(code);
  }

  async function submitToAdmin() {
    if (
      !confirm(
        `참가자 ${participants.length}명의 메뉴를 마감하고\n어드민(매장)에 합배송 주문을 보낼까요?\n\n보낸 뒤에는 추가 참여가 불가합니다.`,
      )
    ) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/groups/${code}/submit`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "전송 실패");
      await load();
      alert(
        `어드민에 합배송 주문을 보냈습니다.\n참가자 ${data.participantCount}명`,
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "전송 실패");
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !group) {
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
  const hasCart = totalCount > 0;
  const canSubmit = open && participants.length > 0;

  return (
    <div className="mx-auto min-h-full max-w-lg px-4 pb-28">
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
              : group.status === "submitted"
                ? "badge-pending"
                : group.status === "done"
                  ? "badge-done"
                  : "badge-cancelled"
          }`}
        >
          {STATUS_KO[group.status] ?? group.status}
        </span>
      </header>

      {/* 단계 안내 */}
      <section className="mb-4 rounded-2xl bg-cream-dark/80 px-4 py-3 text-xs leading-relaxed text-ink-muted">
        {open ? (
          <>
            <strong className="text-ink">① 메뉴 모집</strong> — 각자 메뉴 등록
            (아직 매장 미전달)
            <br />
            <strong className="text-ink">② 합배송 주문 보내기</strong> — 모집
            끝나면 아래 버튼으로 어드민에 전송
          </>
        ) : group.status === "submitted" ? (
          <>어드민에 주문이 전달되었습니다. 매장에서 준비 중이에요.</>
        ) : group.status === "done" ? (
          <>합배송이 완료되었습니다.</>
        ) : (
          <>이 합배송은 종료되었습니다.</>
        )}
      </section>

      <section className="card space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-muted">초대 코드</p>
            <p className="text-2xl font-bold tracking-[0.25em] text-coffee">
              {group.code}
            </p>
          </div>
          {open && (
            <button
              type="button"
              className="btn btn-ghost text-sm py-2"
              onClick={copyLink}
            >
              {copied ? "복사됨 ✓" : "링크 복사"}
            </button>
          )}
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
          <h2 className="font-bold">
            등록 {participants.length}명
            {open && (
              <span className="ml-2 text-xs font-normal text-ink-muted">
                (모집 중)
              </span>
            )}
          </h2>
          <span className="text-sm font-bold text-coffee">
            {formatPrice(grandTotal)}
          </span>
        </div>
        {participants.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">
            아직 등록된 메뉴가 없어요.
            <br />
            메뉴를 담고 「내 메뉴 등록」을 해주세요.
          </p>
        ) : (
          <ul className="divide-y divide-cream-dark">
            {participants.map((p) => (
              <li
                key={p.orderNumber}
                className="flex justify-between py-2.5 text-sm"
              >
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

      {open && hasCart && (
        <section className="mt-4 rounded-2xl border-2 border-coffee/20 bg-foam p-4">
          <p className="text-xs font-bold tracking-wide text-coffee">
            내 장바구니 (아직 미등록)
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {totalCount}개 · {formatPrice(totalPrice)} — 아래에서 등록하세요
          </p>
        </section>
      )}

      <div className="mt-6 space-y-3">
        {/* ① 개인 메뉴 등록 */}
        {open && (
          <>
            {!ready ? (
              <p className="text-center text-sm text-ink-muted">
                장바구니 확인 중…
              </p>
            ) : hasCart ? (
              <>
                <Link
                  href="/checkout"
                  onClick={joinAndShop}
                  className="btn btn-primary flex w-full justify-between py-4 text-base"
                >
                  <span>내 메뉴 등록 ({totalCount}개)</span>
                  <span className="tabular-nums">{formatPrice(totalPrice)}</span>
                </Link>
                <Link
                  href="/"
                  onClick={joinAndShop}
                  className="btn btn-ghost flex w-full"
                >
                  메뉴 더 담기
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  onClick={joinAndShop}
                  className="btn btn-ghost flex w-full py-3.5"
                >
                  메뉴 담으러 가기
                </Link>
              </>
            )}

            {/* ② 어드민 전송 — 모집과 별개 */}
            <div className="rounded-2xl border border-cream-dark bg-foam p-4 space-y-3">
              <p className="text-sm font-bold text-ink">주최자 · 합배송 확정</p>
              <p className="text-xs leading-relaxed text-ink-muted">
                동료 메뉴 등록이 끝나면, 이 버튼으로 매장(어드민)에 한 번에
                전달합니다. 모집 중에는 어드민에 주문이 가지 않습니다.
              </p>
              <button
                type="button"
                className="btn btn-primary w-full py-4"
                disabled={!canSubmit || submitting}
                onClick={submitToAdmin}
              >
                {submitting
                  ? "전송 중…"
                  : canSubmit
                    ? `합배송 주문 보내기 (${participants.length}명 · ${formatPrice(grandTotal)})`
                    : "합배송 주문 보내기 (메뉴 등록 후 가능)"}
              </button>
            </div>
          </>
        )}

        {!open && (
          <p className="rounded-xl bg-cream-dark px-4 py-3 text-center text-sm text-ink-muted">
            {group.status === "submitted"
              ? "어드민에 전달 완료 · 추가 등록 불가"
              : "이 합배송은 종료되었습니다"}
          </p>
        )}
      </div>
    </div>
  );
}
