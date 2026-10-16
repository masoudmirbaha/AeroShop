import { Download, GraduationCap, Package, Users, type LucideIcon } from "lucide-react";
import { AnimatedStat } from "@/components/home/animated-stat";

type Accent = {
  band: string;
  icon: string;
  rail: string;
  wash: string;
  ring: string;
  motif: string;
};

const accents = {
  products: {
    band: "bg-[color-mix(in_oklch,var(--primary)_22%,white)]",
    icon: "text-primary",
    rail: "bg-primary",
    wash: "from-primary/[0.11]",
    ring: "ring-primary/20 hover:ring-primary/40",
    motif: "stroke-primary/28",
  },
  courses: {
    band: "bg-[color-mix(in_oklch,var(--brand-cyan)_28%,white)]",
    icon: "text-[color-mix(in_oklch,var(--navy)_40%,var(--brand-cyan))]",
    rail: "bg-brand-cyan",
    wash: "from-brand-cyan/[0.14]",
    ring: "ring-brand-cyan/25 hover:ring-brand-cyan/45",
    motif: "stroke-brand-cyan/35",
  },
  users: {
    band: "bg-[color-mix(in_oklch,var(--navy)_16%,white)]",
    icon: "text-navy",
    rail: "bg-navy",
    wash: "from-navy/[0.1]",
    ring: "ring-navy/18 hover:ring-navy/32",
    motif: "stroke-navy/25",
  },
  downloads: {
    band: "bg-[color-mix(in_oklch,var(--brand-cyan)_16%,color-mix(in_oklch,var(--primary)_14%,white))]",
    icon: "text-[color-mix(in_oklch,var(--primary)_65%,var(--brand-cyan))]",
    rail: "bg-[color-mix(in_oklch,var(--brand-cyan)_40%,var(--primary))]",
    wash: "from-[color-mix(in_oklch,var(--primary)_12%,transparent)]",
    ring: "ring-primary/20 hover:ring-primary/38",
    motif: "stroke-primary/26",
  },
} as const satisfies Record<string, Accent>;

const stats: {
  value: number;
  label: string;
  icon: LucideIcon;
  accent: keyof typeof accents;
}[] = [
  { value: 100, label: "محصول", icon: Package, accent: "products" },
  { value: 20, label: "دوره", icon: GraduationCap, accent: "courses" },
  { value: 500, label: "کاربر", icon: Users, accent: "users" },
  { value: 1000, label: "دانلود", icon: Download, accent: "downloads" },
];

function CardMotif({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 180 140"
      className={`pointer-events-none absolute end-0 top-0 h-[7.5rem] w-[9.5rem] opacity-80 ${className}`}
      fill="none"
    >
      <path d="M24 36 H92" strokeWidth="1" />
      <path d="M24 54 H140" strokeWidth="1" />
      <path d="M24 72 H110" strokeWidth="1" />
      <path d="M42 18 V96" strokeWidth="1" />
      <path d="M60 18 V112" strokeWidth="1" />
      <path d="M78 18 V84" strokeWidth="1" />
      <circle cx="140" cy="36" r="12" strokeWidth="1.25" />
      <circle cx="140" cy="36" r="4" strokeWidth="1.25" />
      <path d="M108 108 C128 88, 148 88, 168 108" strokeWidth="1.2" />
    </svg>
  );
}

/** Premium statistics strip under the homepage banner — not a second hero. */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/70" aria-labelledby="home-stats-heading">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-b from-navy/[0.055] via-background to-background" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.45] [background-image:linear-gradient(to_left,color-mix(in_oklch,var(--navy)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--navy)_6%,transparent)_1px,transparent_1px)] [background-size:32px_32px] mask-[radial-gradient(ellipse_85%_65%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-l from-transparent via-primary/35 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-8 md:py-11">
        <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
          <h2 id="home-stats-heading" className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            AeroShop به روایت آمار
          </h2>
          <div aria-hidden="true" className="mb-1 hidden h-px flex-1 bg-linear-to-l from-transparent via-border to-border/80 sm:block" />
        </div>

        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {stats.map(({ value, label, icon: Icon, accent }) => {
            const tone = accents[accent];
            return (
              <div
                key={label}
                className={`group relative flex min-h-[9.75rem] overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_0] shadow-navy/[0.06] ring-1 ring-border/80 transition-[translate,box-shadow,ring-color] duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-24px] hover:shadow-navy/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:min-h-[10.75rem] ${tone.ring}`}
              >
                {/* Accent band — sits on inline-start in RTL */}
                <div className={`relative flex w-14 shrink-0 flex-col items-center border-e border-black/5 pt-5 md:w-[3.75rem] md:pt-6 ${tone.band}`}>
                  <div aria-hidden="true" className={`absolute inset-y-0 start-0 w-1 ${tone.rail}`} />
                  <div
                    className={`relative grid size-10 place-items-center rounded-xl bg-white shadow-[0_1px_2px_0] shadow-navy/10 ring-1 ring-black/5 md:size-11 ${tone.icon}`}
                  >
                    <Icon className="size-5 md:size-[1.35rem]" aria-hidden="true" strokeWidth={1.7} />
                  </div>
                  <div aria-hidden="true" className={`mt-auto mb-5 h-10 w-px opacity-30 ${tone.rail}`} />
                </div>

                <div className={`relative flex min-w-0 flex-1 flex-col bg-linear-to-bl ${tone.wash} via-transparent to-transparent px-3.5 py-4 md:px-4 md:py-5`}>
                  <CardMotif className={tone.motif} />
                  <dd className="relative mt-auto text-[2rem] leading-none font-bold tracking-tight text-navy md:text-[2.35rem]">
                    <AnimatedStat value={value} />
                  </dd>
                  <dt className="relative mt-3 text-sm font-semibold tracking-wide text-muted-foreground">{label}</dt>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
