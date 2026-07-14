import Link from "next/link";

export default async function DonePage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string }>;
}) {
  const { n } = await searchParams;
  const orderNumber = n || "—";

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <div className="card w-full px-6 py-12">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cream-dark text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold">신청이 접수됐어요</h1>
        <p className="mt-2 text-sm text-ink-muted leading-relaxed">
          매장에서 확인 후 준비해 드릴게요.
          <br />
          주문 번호를 기억해 주세요.
        </p>
        <p className="mt-8 text-sm font-semibold text-ink-muted">주문 번호</p>
        <p className="mt-1 text-4xl font-bold tracking-[0.2em] text-coffee">
          {orderNumber}
        </p>
        <Link href="/" className="btn btn-primary mt-10 w-full">
          메뉴로 돌아가기
        </Link>
      </div>
    </div>
  );
}
