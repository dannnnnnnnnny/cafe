import Link from "next/link";

export default async function DonePage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string; g?: string }>;
}) {
  const { n, g } = await searchParams;
  const orderNumber = n || "—";
  const groupCode = g?.toUpperCase();

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <div className="card w-full px-6 py-12">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cream-dark text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold">
          {groupCode ? "합배송에 참여했어요" : "신청이 접수됐어요"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          매장에서 확인 후 준비해 드릴게요.
          <br />
          주문 번호를 기억해 주세요.
        </p>
        <p className="mt-8 text-sm font-semibold text-ink-muted">주문 번호</p>
        <p className="mt-1 text-4xl font-bold tracking-[0.2em] text-coffee">
          {orderNumber}
        </p>
        {groupCode && (
          <p className="mt-4 text-sm text-ink-muted">
            합배송 코드{" "}
            <span className="font-bold tracking-widest text-coffee">
              {groupCode}
            </span>
          </p>
        )}
        <div className="mt-10 space-y-2">
          {groupCode && (
            <Link
              href={`/group/${groupCode}`}
              className="btn btn-primary w-full"
            >
              모임 현황 보기
            </Link>
          )}
          <Link
            href="/"
            className={`btn w-full ${groupCode ? "btn-ghost" : "btn-primary"}`}
          >
            메뉴로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
