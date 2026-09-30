import type { Metadata } from "next";
import { APP_NAME } from "@aeroshop/shared";

export const metadata: Metadata = {
  title: { default: "تکمیل خرید", template: `%s | ${APP_NAME}` },
  robots: { index: false },
};

export default function CheckoutLayout({ children }: LayoutProps<"/checkout">) {
  return children;
}
