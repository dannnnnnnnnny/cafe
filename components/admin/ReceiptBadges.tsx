/** 포인트 적립 · 현금영수증 표시 */
export function ReceiptBadges({
  wantPoint,
  wantReceipt,
  receiptPhone,
  compact = false,
}: {
  wantPoint: boolean;
  wantReceipt: boolean;
  receiptPhone?: string | null;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? "" : "mt-1"}`}>
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
          wantPoint
            ? "bg-[#e8f0e8] text-success"
            : "bg-cream-dark text-ink-muted"
        }`}
      >
        {wantPoint ? "포인트 적립" : "포인트 없음"}
      </span>
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
          wantReceipt
            ? "bg-[#e8eef8] text-[#2c4a7c]"
            : "bg-cream-dark text-ink-muted"
        }`}
      >
        {wantReceipt
          ? `현금영수증${receiptPhone ? ` ${receiptPhone}` : ""}`
          : "영수증 없음"}
      </span>
    </div>
  );
}
