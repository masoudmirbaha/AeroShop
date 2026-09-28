import type { Metadata } from "next";
import { Geist_Mono, Vazirmatn } from "next/font/google";
import { APP_NAME } from "@aeroshop/shared";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "محصولات آموزشی دیجیتال و خدمات مهندسی CFD",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
