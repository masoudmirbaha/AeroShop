"use client";

import { Clock, Mail, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card, IconTile, Page } from "@/components/page";

export default function ContactPage() {
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  async function submit(formData: FormData) {
    const response = await fetch("/api/v1/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
      }),
    });
    setOk(response.ok);
    setMessage(response.ok ? "پیام ثبت شد." : "ارسال پیام انجام نشد.");
  }

  return (
    <Page
      title="تماس با ما"
      description="پرسش، پیشنهاد یا درخواست همکاری را بفرستید؛ پیام شما مستقیم به تیم AeroShop می‌رسد."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "تماس" }]}
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-6 md:p-8">
          <form action={submit} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="field-label">نام</span>
                <input name="name" required placeholder="نام شما" className="field" />
              </label>
              <label>
                <span className="field-label">ایمیل</span>
                <input name="email" type="email" required placeholder="you@example.com" dir="ltr" className="field text-end" />
              </label>
            </div>
            <label>
              <span className="field-label">موضوع</span>
              <input name="subject" required placeholder="موضوع پیام" className="field" />
            </label>
            <label>
              <span className="field-label">پیام</span>
              <textarea name="message" required minLength={10} placeholder="متن پیام (حداقل ۱۰ کاراکتر)" className="field min-h-36 leading-7" />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="btn btn-primary">
                ارسال پیام
              </button>
              {message ? (
                <p role="status" className={`text-sm ${ok ? "text-accent-foreground" : "text-destructive"}`}>
                  {message}
                </p>
              ) : null}
            </div>
          </form>
        </Card>
        <aside className="grid gap-4">
          <Card className="flex gap-3">
            <IconTile icon={MessagesSquare} />
            <div>
              <p className="font-semibold">مشاوره فنی</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                برای بررسی مسئله CFD از{" "}
                <Link href="/consultation" className="text-link">
                  مشاوره رایگان
                </Link>{" "}
                استفاده کنید.
              </p>
            </div>
          </Card>
          <Card className="flex gap-3">
            <IconTile icon={Clock} />
            <div>
              <p className="font-semibold">زمان پاسخ</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">پیام‌ها معمولاً در روزهای کاری بررسی می‌شوند.</p>
            </div>
          </Card>
          <Card className="flex gap-3">
            <IconTile icon={Mail} />
            <div>
              <p className="font-semibold">پرسش‌های رایج</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                پیش از ارسال،{" "}
                <Link href="/faq" className="text-link">
                  پرسش‌های متداول
                </Link>{" "}
                را ببینید.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </Page>
  );
}
