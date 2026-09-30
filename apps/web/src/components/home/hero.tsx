import { ArrowLeft, Boxes, Download, GraduationCap, Package, Thermometer, Users, Wind, Workflow, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { AnimatedStat } from "@/components/home/animated-stat";

const stats: { value: number; label: string; icon: LucideIcon }[] = [
  { value: 100, label: "محصول", icon: Package },
  { value: 20, label: "دوره", icon: GraduationCap },
  { value: 500, label: "کاربر", icon: Users },
  { value: 1000, label: "دانلود", icon: Download },
];

const floating: { label: string; icon: LucideIcon; className: string; delay: string }[] = [
  { label: "CFD", icon: Wind, className: "-top-5 end-6", delay: "0s" },
  { label: "Heat Transfer", icon: Thermometer, className: "top-1/3 -start-8", delay: "1.2s" },
  { label: "FEA", icon: Boxes, className: "-bottom-5 start-10", delay: "2.1s" },
  { label: "Flow Simulation", icon: Workflow, className: "bottom-1/4 -end-8", delay: "0.6s" },
];

const gridLines =
  "[background-image:linear-gradient(to_right,color-mix(in_oklch,var(--brand-cyan)_10%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-cyan)_10%,transparent)_1px,transparent_1px)]";

function delay(value: string) {
  return { "--delay": value } as CSSProperties;
}

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-navy-foreground">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-bl from-navy via-navy to-primary/35" />
      <div aria-hidden="true" className={`absolute inset-0 -z-10 ${gridLines} [background-size:40px_40px] mask-[radial-gradient(ellipse_80%_70%_at_50%_40%,black,transparent)]`} />
      <div aria-hidden="true" className="animate-glow absolute -top-40 end-[-10%] -z-10 size-[32rem] rounded-full bg-primary/20 blur-3xl" />
      <div aria-hidden="true" className="animate-glow absolute -bottom-48 start-[-8%] -z-10 size-[26rem] rounded-full bg-brand-cyan/10 blur-3xl [animation-delay:2s]" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 pt-16 pb-20 md:pt-24 md:pb-28 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div>
          <h1 className="animate-fade-up text-3xl leading-[1.35] font-bold tracking-tight text-white md:text-5xl md:leading-[1.3]" style={delay("0.08s")}>
            مرجع آموزش، شبیه‌سازی و خدمات مهندسی{" "}
            <span className="text-brand-cyan">CFD و CAE</span>
          </h1>
          <p className="animate-fade-up mt-5 max-w-xl text-base leading-8 text-navy-foreground/75 md:text-lg" style={delay("0.16s")}>
            محصولات آموزشی، دوره‌های تخصصی، مشاوره و انجام پروژه‌های مهندسی
          </p>
          <div className="animate-fade-up mt-9 flex flex-wrap gap-3" style={delay("0.24s")}>
            <Link href="/products" className="btn btn-lg bg-white text-navy shadow-lg shadow-black/20 hover:bg-secondary">
              مشاهده محصولات
              <ArrowLeft aria-hidden="true" />
            </Link>
            <Link href="/request-project" className="btn btn-lg border-white/20 bg-white/5 text-white backdrop-blur hover:border-white/35 hover:bg-white/10">
              درخواست پروژه
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(({ value, label, icon: Icon }, index) => (
              <div
                key={label}
                className="animate-fade-up flex flex-col rounded-xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur transition-[background-color,translate] duration-200 hover:-translate-y-0.5 hover:bg-white/10"
                style={delay(`${0.32 + index * 0.08}s`)}
              >
                <Icon className="size-4 text-brand-cyan" aria-hidden="true" />
                <dt className="order-last mt-0.5 text-xs text-navy-foreground/65">{label}</dt>
                <dd className="mt-3 text-2xl font-bold text-white">
                  <AnimatedStat value={value} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div aria-hidden="true" className="animate-fade-up relative mx-auto w-full max-w-md lg:max-w-none" style={delay("0.2s")}>
          <div className="relative rounded-2xl bg-white/5 p-2 ring-1 ring-white/12 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="relative h-64 overflow-hidden rounded-xl bg-navy md:h-80">
              <div className={`absolute inset-0 opacity-60 ${gridLines} [background-size:26px_26px]`} />
              <svg viewBox="0 0 400 260" preserveAspectRatio="none" className="absolute inset-0 size-full">
                <defs>
                  <linearGradient id="hero-flow" x1="0" x2="1">
                    <stop offset="0" stopColor="var(--brand-cyan)" stopOpacity="0.1" />
                    <stop offset="0.55" stopColor="var(--brand-cyan)" stopOpacity="0.95" />
                    <stop offset="1" stopColor="var(--primary)" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                {[62, 86, 110, 130, 150, 172, 196, 220].map((y) => {
                  const above = y < 140;
                  const bend = above ? y - 28 : y + 24;
                  return <path key={y} d={`M0 ${y} C 120 ${y}, 160 ${bend}, 230 ${bend} S 330 ${y}, 400 ${y}`} fill="none" stroke="url(#hero-flow)" strokeWidth="1.3" />;
                })}
                <path d="M140 140 C 170 108, 255 108, 300 136 C 255 147, 185 151, 140 140 Z" fill="var(--navy-foreground)" opacity="0.95" />
              </svg>
              <div className="absolute start-3 top-3 flex items-center gap-2 rounded-md bg-white/10 px-2.5 py-1 text-[11px] text-navy-foreground ring-1 ring-white/15" dir="ltr">
                <span className="size-1.5 rounded-full bg-brand-cyan" />
                Velocity magnitude · Re 2.4×10⁵
              </div>
              <div className="absolute end-3 bottom-3 flex h-24 w-2.5 flex-col overflow-hidden rounded-full ring-1 ring-white/15">
                <span className="flex-1 bg-brand-cyan" />
                <span className="flex-1 bg-primary" />
                <span className="flex-1 bg-navy-foreground/30" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 px-2 pt-3 pb-1 text-center" dir="ltr">
              {["Mesh", "Solve", "Post"].map((step, index) => (
                <div key={step}>
                  <p className="text-[11px] text-navy-foreground/60">
                    0{index + 1} · {step}
                  </p>
                  <div className="mx-auto mt-2 h-1 max-w-24 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-linear-to-r from-brand-cyan to-primary" style={{ width: `${100 - index * 24}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {floating.map(({ label, icon: Icon, className, delay: d }) => (
            <span
              key={label}
              className={`animate-float absolute hidden items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-white shadow-lg shadow-black/20 ring-1 ring-white/15 backdrop-blur-md md:inline-flex ${className}`}
              style={delay(d)}
              dir="ltr"
            >
              <span className="grid size-6 place-items-center rounded-md bg-brand-cyan/20 text-brand-cyan">
                <Icon className="size-3.5" />
              </span>
              {label}
            </span>
          ))}
        </div>

        <ul aria-label="حوزه‌های تخصصی" className="-mt-6 flex flex-wrap justify-center gap-2 md:hidden" dir="ltr">
          {floating.map(({ label, icon: Icon }) => (
            <li key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs text-white ring-1 ring-white/12">
              <Icon className="size-3.5 text-brand-cyan" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-linear-to-l from-transparent via-brand-cyan/40 to-transparent" />
    </section>
  );
}
