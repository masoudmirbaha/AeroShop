import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { APP_DESCRIPTION, APP_NAME, APP_ORIGIN } from "@aeroshop/shared";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { SessionProvider } from "@/components/session-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-shell";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_ORIGIN),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: APP_ORIGIN,
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full antialiased`}
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
