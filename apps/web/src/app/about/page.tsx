import { Cpu, GraduationCap, Workflow } from "lucide-react";
import Link from "next/link";
import { Card, IconTile, Page } from "@/components/page";

const pillars = [
  { icon: GraduationCap, title: "آموزش مسئله‌محور", text: "مثال‌ها روی مسئله واقعی مهندسی بسته شده‌اند، نه فقط معرفی منوهای نرم‌افزار." },
  { icon: Workflow, title: "خدمات پروژه", text: "مشاوره، سفارش پروژه، آموزش خصوصی و پشتیبانی فنی با وضعیت قابل پیگیری." },
  { icon: Cpu, title: "تمرکز بر CFD", text: "انتقال حرارت، چندفازی، احتراق، آکوستیک، مش دینامیک و اندرکنش سیال و سازه." },
];

export default function AboutPage() {
  return (
    <Page
      eyebrow="درباره ما"
      title="درباره AeroShop"
      description="AeroShop برای مهندسانی ساخته شده که شبیه‌سازی جریان را یاد می‌گیرند یا پروژه CFD را برون‌سپاری می‌کنند."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "درباره ما" }]}
    >
      <Card className="p-6 leading-8 text-foreground/85 md:p-8">
        محصولات دیجیتال هستند: آموزش، بسته و دوره. خدمات جداگانه شامل مشاوره، سفارش پروژه، آموزش خصوصی و پشتیبانی فنی است.
      </Card>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {pillars.map(({ icon, title, text }) => (
          <Card key={title} className="p-6">
            <IconTile icon={icon} />
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/products" className="btn btn-primary">
          مشاهده محصولات
        </Link>
        <Link href="/contact" className="btn btn-outline">
          تماس با ما
        </Link>
      </div>
    </Page>
  );
}
