"use client";

import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";

export type FlipCardContent = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  cta: { label: string; href: string };
};

export function FlipCard({ feature, visual, icon, backIcon }: { feature: FlipCardContent; visual: ReactNode; icon: ReactNode; backIcon: ReactNode }) {
  const [hovered, setHovered] = useState(false);
  const [toggled, setToggled] = useState(false);
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const flipped = hovered || toggled;
  const backId = `flip-${feature.id}-back`;

  function onPointerEnter(event: PointerEvent) {
    if (event.pointerType === "mouse") setHovered(true);
  }

  function onPointerLeave(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    setHovered(false);
    setToggled(false);
  }

  function onClick(event: MouseEvent) {
    if ((event.target as HTMLElement).closest("a")) return;
    const next = !toggled;
    setToggled(next);
    // Keyboard-initiated clicks report detail 0; keep focus on the face that is now visible.
    if (event.detail === 0) {
      requestAnimationFrame(() => (next ? backButton : frontButton).current?.focus());
    }
  }

  return (
    <div
      className="flip-card group/flip h-[23rem] cursor-pointer select-none"
      data-flipped={flipped}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
    >
      <div className="flip-card-inner">
        <article inert={flipped} className="flip-card-face flip-card-front surface flex flex-col overflow-hidden transition-shadow duration-300 group-hover/flip:shadow-[0_18px_40px_-26px] group-hover/flip:shadow-navy/40">
          <div className="relative h-40 shrink-0 overflow-hidden">
            {visual}
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-navy/40 to-transparent" />
            <span className="absolute start-4 bottom-3 grid size-11 place-items-center rounded-xl border border-white/60 bg-card text-primary shadow-sm">
              {icon}
            </span>
          </div>
          <div className="flex flex-1 flex-col px-5 pt-5 pb-4">
            <h3 className="text-lg font-bold tracking-tight">{feature.title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{feature.subtitle}</p>
            <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-4">
              <span className="text-xs text-muted-foreground">
                <span className="hidden [@media(hover:hover)]:inline">نشانگر را روی کارت ببرید</span>
                <span className="[@media(hover:hover)]:hidden">برای جزئیات لمس کنید</span>
              </span>
              <button
                ref={frontButton}
                type="button"
                aria-expanded={flipped}
                aria-controls={backId}
                className="btn btn-ghost btn-sm h-9 text-primary"
              >
                جزئیات
                <RotateCcw aria-hidden="true" />
              </button>
            </div>
          </div>
        </article>

        <article
          id={backId}
          inert={!flipped}
          aria-label={feature.title}
          className="flip-card-face flip-card-back flex flex-col overflow-hidden rounded-2xl border border-navy bg-navy p-6 text-navy-foreground shadow-[0_18px_40px_-24px] shadow-navy/60"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,color-mix(in_oklch,var(--brand-cyan)_10%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-cyan)_10%,transparent)_1px,transparent_1px)] [background-size:24px_24px] mask-[linear-gradient(to_bottom,black,transparent_70%)]" />
          <div className="relative flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-white/8 text-brand-cyan ring-1 ring-white/12">{backIcon}</span>
            <h3 className="text-base font-bold text-white">{feature.title}</h3>
          </div>
          <p className="relative mt-4 text-sm leading-7 text-navy-foreground/80">{feature.description}</p>
          <ul className="relative mt-4 grid gap-2 text-sm">
            {feature.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2">
                <Check className="mt-1 size-3.5 shrink-0 text-brand-cyan" aria-hidden="true" />
                <span className="text-navy-foreground/90">{benefit}</span>
              </li>
            ))}
          </ul>
          <div className="relative mt-auto flex items-center gap-2 pt-5">
            <Link href={feature.cta.href} className="btn flex-1 bg-white text-navy hover:bg-secondary">
              {feature.cta.label}
              <ArrowLeft aria-hidden="true" />
            </Link>
            <button
              ref={backButton}
              type="button"
              aria-label={`بازگشت به روی کارت ${feature.title}`}
              className="btn size-10 border-white/15 px-0 text-navy-foreground hover:bg-white/10"
            >
              <RotateCcw aria-hidden="true" />
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
