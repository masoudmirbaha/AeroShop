import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SimVisual } from "@/components/sim-visual";
import { engineeringServiceCards } from "@/lib/home-demo";

export function EngineeringServices() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {engineeringServiceCards.map((item) => (
        <article
          key={item.id}
          className="surface card-glow group relative flex flex-col overflow-hidden shadow-[0_1px_2px_0] shadow-navy/5 transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-24px] hover:shadow-navy/35 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-(--sim-bg)">
            <SimVisual
              kind={item.visual}
              seed={item.seed}
              label={false}
              decorative
              className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy/45 via-navy/10 to-transparent" />
            <span className="sr-only">{`تصویرسازی مهندسی مرتبط با ${item.title}`}</span>
          </div>
          <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
            <h3 className="text-base font-semibold tracking-tight transition-colors group-hover:text-primary">{item.title}</h3>
            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">{item.summary}</p>
            <Link
              href={item.href}
              className="btn btn-outline btn-sm mt-4 w-fit outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {item.cta}
              <ArrowLeft aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
