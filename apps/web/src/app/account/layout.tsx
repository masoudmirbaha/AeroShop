import type { Metadata } from "next";

export const metadata: Metadata = { title: "حساب کاربری", robots: { index: false } };

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return children;
}
