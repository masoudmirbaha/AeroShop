import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { AdminGate, AdminLoginRedirect } from "@/components/admin/admin-gate";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = { title: "مدیریت", robots: { index: false } };

// Keeps the panel shell away from signed-out visitors. Only the presence of the access cookie
// (set by the API as httpOnly) is checked here; it is never read or decoded. Authorization still
// belongs to the API roles guard, with AdminGate confirming the role before rendering.
const ACCESS_COOKIE = "access_token";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await cookies()).has(ACCESS_COOKIE)) return <AdminLoginRedirect />;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 md:flex-row md:items-start">
      <aside className="min-w-0 shrink-0 md:w-56">
        <AdminNav />
      </aside>
      <main className="admin-content surface min-w-0 flex-1 p-5 md:p-7">
        <AdminGate>{children}</AdminGate>
      </main>
    </div>
  );
}
