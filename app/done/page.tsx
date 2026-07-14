import Link from "next/link";

export default async function DonePage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string; g?: string; draft?: string }>;
}) {
  const { n, g, draft } = await searchParams;
  const orderNumber = n || "—";
  const groupCode = g?.toUpperCase();
  const isGroupDraft = Boolean(groupCode && draft === "1");

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <div className="card w-full px-6 py-12">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cream-dark text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold">
          {isGroupDraft
            ? "메뉴가 등록됐어요"
            : groupCode
              ? "합배송에 참여했어요"
              : "신청이 접수됐어요"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {isGroupDraft ? (
            <>
              아직 매장(어드민)에는 전달되지 않았어요.
              <br />
              주최자가 모임을 마감·전송하면 주문으로 접수됩니다.
            </>
          ) : (
            <>
              매장에서 확인 후 준비해 드릴게요.
              <br />
              주문 번호를 기억해 주세요.
            </>
          )}
        </p>
        <p className="mt-8 text-sm font-semibold text-ink-muted">
          {isGroupDraft ? "등록 번호" : "주문 번호"}
        </p>
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
              모임으로 돌아가기
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
