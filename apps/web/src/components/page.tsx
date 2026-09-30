import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

const widths = {
  default: "max-w-6xl",
  narrow: "max-w-3xl",
  form: "max-w-xl",
} as const;

type Width = keyof typeof widths;

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  width?: Width;
};

export function Page({ children, width = "default", ...header }: PageHeaderProps & { children: ReactNode }) {
  return (
    <main className="flex-1">
      <PageHeader width={width} {...header} />
      <div className={cn("mx-auto w-full px-4 pt-8 pb-16 md:pt-10", widths[width])}>{children}</div>
    </main>
  );
}

export function PageHeader({ title, description, breadcrumbs, actions, width = "default" }: PageHeaderProps) {
  return (
    <header className="relative isolate overflow-hidden bg-linear-to-b from-band via-band/80 to-page">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [background-image:linear-gradient(to_right,color-mix(in_oklch,var(--navy)_5%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--navy)_5%,transparent)_1px,transparent_1px)] [background-size:32px_32px] mask-[radial-gradient(ellipse_70%_120%_at_15%_0%,black,transparent_75%)]"
      />
      <div aria-hidden="true" className="absolute -top-24 end-[-6rem] -z-10 size-80 rounded-full bg-radial from-brand-cyan/12 from-30% to-transparent to-70%" />
      <svg
        aria-hidden="true"
        viewBox="0 0 480 200"
        preserveAspectRatio="none"
        className="absolute inset-y-0 end-0 -z-10 hidden h-full w-[34rem] text-primary mask-[linear-gradient(to_right,black,transparent)] md:block"
      >
        {[40, 62, 84, 106, 128, 150, 172].map((y, index) => (
          <path key={y} d={`M480 ${y} C 360 ${y - 22 + index * 4}, 240 ${y + 18 - index * 3}, 0 ${y - 8}`} fill="none" stroke="currentColor" strokeWidth="1" opacity={0.08 + (index % 3) * 0.05} />
        ))}
      </svg>
      <div className={cn("mx-auto w-full px-4 pt-8 pb-9 md:pt-10 md:pb-12", widths[width])}>
        {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 max-w-2xl">
            <h1 className="text-2xl leading-tight font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
            {description ? <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base md:leading-8">{description}</p> : null}
            <span aria-hidden="true" className="mt-5 flex items-center gap-1.5">
              <span className="accent-line h-0.5 w-10 rounded-full" />
              <span className="h-0.5 w-3 rounded-full bg-brand-cyan/70" />
            </span>
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}

function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="مسیر صفحه" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <ChevronLeft className="size-3.5 opacity-60" aria-hidden="true" /> : null}
            {item.href ? (
              <Link href={item.href} className="rounded transition-colors hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground/80">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Section({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {title ? (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
            {description ? <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Card({ children, className, interactive }: { children: ReactNode; className?: string; interactive?: boolean }) {
  return <div className={cn("surface p-5", interactive && "surface-hover", className)}>{children}</div>;
}

export function IconTile({ icon: Icon, className }: { icon: ComponentType<{ className?: string }>; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-secondary to-accent text-primary ring-1 ring-primary/10 ring-inset",
        className,
      )}
    >
      <Icon className="size-5" />
    </span>
  );
}

export function AuthShell({ title, description, children, footer }: { title: string; description: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 md:py-20">
      <div className="w-full max-w-md">
        <div className="surface p-6 shadow-[0_18px_40px_-24px] shadow-navy/25 sm:p-8">
          <span aria-hidden="true" className="accent-line mb-5 block h-1 w-12 rounded-full" />
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          <div className="mt-6">{children}</div>
        </div>
        {footer ? <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div> : null}
      </div>
    </main>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ComponentType<{ className?: string }>; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="surface relative isolate flex flex-col items-center overflow-hidden px-6 py-14 text-center">
      <div aria-hidden="true" className="tech-grid absolute inset-0 -z-10 mask-[radial-gradient(ellipse_50%_60%_at_50%_30%,black,transparent)]" />
      <span aria-hidden="true" className="relative grid place-items-center">
        <span className="absolute size-20 rounded-full bg-primary/8 ring-1 ring-primary/10" />
        <IconTile icon={icon} className="relative size-12 bg-card shadow-sm" />
      </span>
      <p className="mt-6 font-semibold">{title}</p>
      {description ? <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
