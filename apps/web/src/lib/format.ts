const labels = {
  SINGLE_PRODUCT: "محصول",
  BUNDLE: "بسته",
  COURSE: "دوره",
  FREE: "رایگان",
  BEGINNER: "مبتدی",
  INTERMEDIATE: "متوسط",
  ADVANCED: "پیشرفته",
} as const;

export function typeLabel(type: string) {
  return labels[type as keyof typeof labels] ?? type;
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes.toLocaleString("fa-IR")} دقیقه`;
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours.toLocaleString("fa-IR")} ساعت`;
}

export function formatPrice(value: number | null) {
  if (value == null) return "";
  if (value === 0) return "رایگان";
  return `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;
}
