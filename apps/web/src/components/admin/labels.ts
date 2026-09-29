export const orderStatusLabels: Record<string, string> = {
  PENDING: "در انتظار",
  PAID: "پرداخت‌شده",
  FAILED: "ناموفق",
  CANCELLED: "لغوشده",
};

export const requestStatusLabels: Record<string, string> = {
  NEW: "جدید",
  REVIEWING: "در حال بررسی",
  QUOTED: "قیمت داده شد",
  IN_PROGRESS: "در حال انجام",
  DELIVERED: "تحویل شد",
  CLOSED: "بسته شد",
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
