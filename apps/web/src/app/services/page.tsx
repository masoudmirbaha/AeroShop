import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ApiErrorNotice, DemoNotice } from "@/components/demo-notice";
import { IconTile, Page } from "@/components/page";
import { serviceIcon } from "@/components/service-icon";
import { demoServices } from "@/lib/catalog-demo";
import { demoCatalogEnabled } from "@/lib/demo-mode";
import { tryApi } from "@/lib/try-api";

type Service = { id: string; title: string; slug: string; summary: string };

export const metadata: Metadata = {
  title: "خدمات شبیه‌سازی و مشاوره",
  description: "مشاوره رایگان، انجام پروژه CFD، آموزش خصوصی و پشتیبانی فنی با وضعیت قابل پیگیری در حساب کاربری.",
};

export default async function ServicesPage() {
  const load = await tryApi<Service[]>("/services");
  const demoEnabled = demoCatalogEnabled();

  let services: Service[] = [];
  let usingDemo = false;
  let apiFailed = false;

  if (load.status === "ok") {
    services = load.data;
    if (!services.length && demoEnabled) {
      services = demoServices;
      usingDemo = true;
    }
  } else {
    apiFailed = true;
    if (demoEnabled) {
      services = demoServices;
      usingDemo = true;
    } else {
      throw new Error(load.message);
    }
  }

  return (
    <Page
      title="خدمات شبیه‌سازی و مشاوره"
      description="از مشاوره رایگان پیش از شروع تا انجام کامل پروژه CFD، آموزش خصوصی و پشتیبانی فنی بعد از تحویل. وضعیت هر درخواست در حساب کاربری قابل پیگیری است."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "خدمات" }]}
      actions={
        <Link href="/consultation" className="btn btn-primary">
          مشاوره رایگان
        </Link>
      }
    >
      {apiFailed ? <ApiErrorNotice message="بارگذاری فهرست خدمات از سرور انجام نشد." /> : null}
      {usingDemo ? <DemoNotice message="فهرست خدمات نمایشی برای دمو — ثبت درخواست واقعی پس از ورود به حساب و اتصال سرور ممکن است." /> : null}
      <div className="grid gap-5 md:grid-cols-2">
        {services.map((service) => (
          <article key={service.id} className="surface surface-hover group relative flex gap-4 p-6">
            <IconTile icon={serviceIcon(service.slug)} className="size-12" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">
                <Link href={`/services/${service.slug}`} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50">
                  {service.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{service.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-[gap] duration-200 group-hover:gap-2">
                جزئیات و ثبت درخواست
                <ArrowLeft className="size-4" aria-hidden="true" />
              </span>
            </div>
          </article>
        ))}
      </div>
    </Page>
  );
}
