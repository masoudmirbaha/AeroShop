"use client";

import { useState } from "react";
import { adminFetch, inputClass, Notice, Pager, sendJson, useAdminData, type Paged } from "@/components/admin/admin-client";
import { formatDate } from "@/components/admin/labels";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  orderCount: number;
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [message, setMessage] = useState("");
  const params = new URLSearchParams({ page: String(page), ...(q ? { q } : {}) });
  const { data, error, reload } = useAdminData<Paged<User>>(`/admin/users?${params}`);

  async function update(user: User, change: Partial<Pick<User, "role" | "isActive">>) {
    try {
      await adminFetch(`/admin/users/${user.id}`, sendJson("PATCH", change));
      setMessage(`حساب ${user.email} به‌روزرسانی شد.`);
      reload();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "انجام نشد.");
    }
  }

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">کاربران</h1>
      <form
        className="mb-4 flex gap-2"
        action={(formData) => {
          setPage(1);
          setQ(String(formData.get("q") ?? "").trim());
        }}
      >
        <input name="q" defaultValue={q} placeholder="جستجو در ایمیل یا نام" className={`${inputClass} flex-1`} />
        <button type="submit" className="rounded-md border px-4 py-2">
          جستجو
        </button>
      </form>
      <Notice text={error || message} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="p-2 text-start">کاربر</th>
              <th className="p-2 text-start">نقش</th>
              <th className="p-2 text-start">وضعیت</th>
              <th className="p-2 text-start">سفارش</th>
              <th className="p-2 text-start">عضویت</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-2">
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {user.email}
                  </p>
                </td>
                <td className="p-2">
                  <select value={user.role} onChange={(event) => update(user, { role: event.target.value as User["role"] })} className="rounded-md border px-2 py-1">
                    <option value="USER">کاربر</option>
                    <option value="ADMIN">مدیر</option>
                  </select>
                </td>
                <td className="p-2">
                  <button type="button" onClick={() => update(user, { isActive: !user.isActive })} className="underline">
                    {user.isActive ? "فعال — غیرفعال کن" : "غیرفعال — فعال کن"}
                  </button>
                </td>
                <td className="p-2">{user.orderCount}</td>
                <td className="p-2 text-muted-foreground">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data ? <Pager page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} /> : null}
    </>
  );
}
