import type { ReactNode } from "react";
import { AdminGate } from "@/components/admin/admin-gate";
import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminLayout({ children }: { children: ReactNode }) {
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
