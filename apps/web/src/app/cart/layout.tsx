import type { Metadata } from "next";

export const metadata: Metadata = { title: "سبد خرید", robots: { index: false } };

export default function CartLayout({ children }: LayoutProps<"/cart">) {
  return children;
}
