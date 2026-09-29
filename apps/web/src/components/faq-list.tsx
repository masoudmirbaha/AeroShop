import { ChevronDown } from "lucide-react";

export type FaqEntry = { id: string; question: string; answer: string };

export function FaqList({ items }: { items: FaqEntry[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <details key={item.id} className="surface group p-0 transition-colors open:border-primary/20">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-medium outline-none transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p className="border-t border-border/70 px-5 py-4 text-sm leading-7 text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
