import { GraduationCap, MessagesSquare, Presentation, Workflow, type LucideIcon } from "lucide-react";
import { FlipCard, type FlipCardContent } from "@/components/home/flip-card";
import { SimVisual, type SimKind } from "@/components/sim-visual";

type Feature = FlipCardContent & {
  icon: LucideIcon;
  art: SimKind;
  seed: number;
};

const features: Feature[] = [
  {
    id: "products",
    title: "محصولات آموزشی",
    subtitle: "آموزش‌های پروژه‌محور CFD",
    description: "فیلم، فایل مش و کیس آماده برای یادگیری شبیه‌سازی روی مسئله واقعی.",
    benefits: ["دانلود از حساب کاربری پس از خرید", "فایل‌های شبیه‌سازی همراه آموزش", "مثال‌های صنعتی و دانشگاهی"],
    cta: { label: "مشاهده محصولات", href: "/products" },
    icon: GraduationCap,
    art: "airfoil",
    seed: 11,
  },
  {
    id: "training",
    title: "آموزش اختصاصی",
    subtitle: "جلسه آنلاین روی مسئله شما",
    description: "آموزش خصوصی متناسب با پروژه، پایان‌نامه یا نیاز تیم مهندسی شما.",
    benefits: ["برنامه آموزشی متناسب با سطح شما", "کار روی مدل و داده خودتان", "زمان‌بندی منعطف جلسات"],
    cta: { label: "جزئیات آموزش", href: "/services/private-training" },
    icon: Presentation,
    art: "mesh",
    seed: 23,
  },
  {
    id: "project",
    title: "سفارش پروژه",
    subtitle: "شبیه‌سازی از مش تا گزارش",
    description: "انجام پروژه CFD و CAE با تعریف دامنه روشن و پیگیری وضعیت از حساب کاربری.",
    benefits: ["بررسی اولیه و برآورد زمان", "گزارش نتایج و فایل‌های پروژه", "پیگیری درخواست در حساب کاربری"],
    cta: { label: "ثبت درخواست پروژه", href: "/request-project" },
    icon: Workflow,
    art: "fsi",
    seed: 37,
  },
  {
    id: "consulting",
    title: "مشاوره مهندسی",
    subtitle: "انتخاب مسیر درست قبل از شروع",
    description: "پیش از خرید یا سفارش، مسئله را با یک مهندس مرور کنید تا مسیر مناسب روشن شود.",
    benefits: ["مشاوره اولیه رایگان", "پیشنهاد روش و ابزار مناسب", "راهنمایی برای انتخاب محصول"],
    cta: { label: "درخواست مشاوره", href: "/consultation" },
    icon: MessagesSquare,
    art: "structure",
    seed: 41,
  },
];

export function FlipCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {features.map(({ icon: Icon, art, seed, ...feature }) => (
        <FlipCard
          key={feature.id}
          feature={feature}
          visual={<SimVisual kind={art} seed={seed} decorative label={false} className="absolute inset-0" />}
          icon={<Icon className="size-5.5" aria-hidden="true" />}
          backIcon={<Icon className="size-5" aria-hidden="true" />}
        />
      ))}
    </div>
  );
}
