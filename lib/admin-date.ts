/** 로컬 타임존 기준 YYYY-MM-DD */
export function toDateKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date().toISOString());
}

export function formatDateKey(key: string): string {
  if (!key) return "";
  const [y, m, d] = key.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

export function orderDateKey(order: {
  preferred_at?: string;
  created_at: string;
}): string {
  return toDateKey(order.preferred_at || order.created_at);
}
