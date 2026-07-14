import Link from "next/link";
import { CheckoutForm } from "@/components/CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="mx-auto min-h-full max-w-lg px-4 pb-10">
      <header className="flex items-center gap-3 pt-6 pb-5">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-foam shadow-sm text-ink"
          aria-label="뒤로"
        >
          ←
        </Link>
        <div>
          <h1 className="text-xl font-bold">구매 신청</h1>
          <p className="text-sm text-ink-muted">정보를 입력해 주세요</p>
        </div>
      </header>
      <CheckoutForm />
    </div>
  );
}
