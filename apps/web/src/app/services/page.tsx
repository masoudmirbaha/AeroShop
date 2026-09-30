import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { IconTile, Page } from "@/components/page";
import { serviceIcon } from "@/components/service-icon";
import { api } from "@/lib/api";

type Service = { id: string; title: string; slug: string; summary: string };

export default async function ServicesPage() {
  const services = await api<Service[]>("/services");
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
