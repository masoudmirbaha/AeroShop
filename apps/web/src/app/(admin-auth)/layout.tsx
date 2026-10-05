import type { Metadata } from "next";
import type { ReactNode } from "react";

// Sits above `app/admin`, so admin sign-in is reachable without the panel's gate.
export const metadata: Metadata = { title: "ورود مدیریت", robots: { index: false, follow: false } };

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return children;
}
