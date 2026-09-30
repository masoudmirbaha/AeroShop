import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "پرسش درباره محصولات، دوره‌ها یا خدمات شبیه‌سازی را از فرم تماس AeroShop بفرستید.",
};

export default function ContactLayout({ children }: LayoutProps<"/contact">) {
  return children;
}
