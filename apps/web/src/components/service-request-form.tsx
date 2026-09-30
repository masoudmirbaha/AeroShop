"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, Page } from "@/components/page";

export function ServiceRequestForm({ serviceSlug, title }: { serviceSlug: string; title: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  async function submit(formData: FormData) {
    const response = await fetch("/api/v1/service-requests", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceSlug,
        subject: formData.get("subject"),
        message: formData.get("message"),
      }),
    });
    if (response.status === 401) {
      router.push("/login");
      return;
    }
    setOk(response.ok);
    setMessage(response.ok ? "درخواست ثبت شد و وضعیت آن NEW است." : "ثبت درخواست انجام نشد.");
  }

  return (
    <Page
      width="form"
      title={title}
      description="مسئله را کوتاه و دقیق شرح دهید: هندسه، رژیم جریان، نرم‌افزار و خروجی مورد انتظار. وضعیت درخواست در حساب کاربری قابل پیگیری است."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "خدمات", href: "/services" }, { label: title }]}
    >
      <Card className="p-6 md:p-8">
        <form action={submit} className="grid gap-4">
          <label>
            <span className="field-label">موضوع</span>
            <input name="subject" required minLength={3} placeholder="موضوع" className="field" />
          </label>
          <label>
            <span className="field-label">شرح درخواست</span>
            <textarea name="message" required minLength={10} placeholder="شرح درخواست" className="field min-h-40 leading-7" />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn btn-primary">
              ارسال درخواست
            </button>
            {message ? (
              <p role="status" className={`text-sm ${ok ? "text-accent-foreground" : "text-destructive"}`}>
                {message}
              </p>
            ) : null}
          </div>
        </form>
      </Card>
    </Page>
  );
}
