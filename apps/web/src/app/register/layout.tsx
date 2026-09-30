import type { Metadata } from "next";

export const metadata: Metadata = { title: "ثبت‌نام", robots: { index: false } };

export default function RegisterLayout({ children }: LayoutProps<"/register">) {
  return children;
}
