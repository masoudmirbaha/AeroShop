import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SimVisual, visualFor, type SimKind } from "@/components/sim-visual";
import { DEMO_BADGE, demoSimulationTopics } from "@/lib/home-demo";

export type HomeTopic = { id: string; name: string; slug: string; description: string | null };

type Card = {
  key: string;
  title: string;
  summary: string;
  href: string;
  visual: SimKind;
  seed: number;
};

function cardsFromApi(topics: HomeTopic[]): Card[] {
  return topics.map((topic) => {
    const { kind, seed } = visualFor({ slug: topic.slug, title: topic.name, topic: { name: topic.name, slug: topic.slug } });
    return {
      key: topic.id,
      title: topic.name,
      summary: topic.description?.trim() || "موضوع‌های مهندسی که آموزش و خدمات حول آن‌ها ساخته شده‌اند.",
      href: `/products?topic=${encodeURIComponent(topic.slug)}`,
      visual: kind,
      seed,
    };
  });
}

function cardsFromDemo(): Card[] {
  return demoSimulationTopics.map((topic) => ({
    key: topic.id,
    title: topic.title,
    summary: topic.summary,
    href: topic.topicSlug ? `/products?topic=${encodeURIComponent(topic.topicSlug)}` : "/products",
    visual: topic.visual,
    seed: topic.seed,
  }));
}

export function SimulationTopics({ topics }: { topics: HomeTopic[] }) {
  const cards = topics.length ? cardsFromApi(topics) : cardsFromDemo();
  const demoMode = !topics.length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Link
          key={card.key}
          href={card.href}
          className="surface card-glow group relative flex flex-col overflow-hidden shadow-[0_1px_2px_0] shadow-navy/5 outline-none transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-22px] hover:shadow-navy/30 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-(--sim-bg)">
            <SimVisual
              kind={card.visual}
              seed={card.seed}
              label={false}
              decorative
              className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy/50 via-navy/10 to-transparent" />
            {demoMode ? <span className="badge absolute start-3 top-3 bg-card/95 text-foreground shadow-sm">{DEMO_BADGE}</span> : null}
          </div>
          <div className="flex flex-1 flex-col px-4 pt-3 pb-4">
            <h3 className="text-sm font-semibold tracking-tight transition-colors group-hover:text-primary">{card.title}</h3>
            <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-5 text-muted-foreground">{card.summary}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary/90">
              مشاهده محصولات
              <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
