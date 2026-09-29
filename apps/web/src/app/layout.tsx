import type { Metadata } from "next";
import { Geist_Mono, Vazirmatn } from "next/font/google";
import { APP_NAME } from "@aeroshop/shared";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { SessionProvider } from "@/components/session-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-shell";
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
      <body className="flex min-h-full flex-col">
        <DirectionProvider direction="rtl">
          <SessionProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
          </SessionProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
