import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Card, IconTile, Page } from "@/components/page";
import { serviceIcon } from "@/components/service-icon";
import { api } from "@/lib/api";

type Service = { title: string; slug: string; summary: string; description: string };

const steps = ["ثبت درخواست با شرح مسئله", "بررسی توسط مهندس و تعیین مسیر", "پیگیری وضعیت از حساب کاربری"];

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await api<Service>(`/services/${slug}`);
  const href = slug === "free-consultation" ? "/consultation" : "/request-project";
  return (
    <Page
      title={service.title}
      description={service.summary}
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "خدمات", href: "/services" }, { label: service.title }]}
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3">
            <IconTile icon={serviceIcon(service.slug)} />
            <h2 className="text-lg font-bold">شرح خدمت</h2>
          </div>
          <p className="mt-5 leading-8 text-foreground/85">{service.description}</p>
        </Card>
        <aside className="surface p-6 lg:sticky lg:top-24">
          <h2 className="font-semibold">روند کار</h2>
          <ol className="mt-4 grid gap-3">
            {steps.map((step) => (
              <li key={step} className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent-foreground" aria-hidden="true" />
                {step}
              </li>
            ))}
          </ol>
          <Link href={`${href}?service=${service.slug}`} className="btn btn-primary btn-lg mt-6 w-full">
            ثبت درخواست
          </Link>
        </aside>
      </div>
    </Page>
  );
}
