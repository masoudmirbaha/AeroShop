"use client";

import { useEffect, useRef } from "react";

const digits = new Intl.NumberFormat("fa-IR");

/** Counts up once when visible. Frames write to the DOM directly so the counter never re-renders. */
export function AnimatedStat({ value, suffix = "+", duration = 1400 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const show = (n: number) => {
      node.textContent = `${digits.format(n)}${suffix}`;
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show(value);
      return;
    }
    let frame = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        show(Math.round(value * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, suffix, duration]);

  return (
    <>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {digits.format(0)}
        {suffix}
      </span>
      <span className="sr-only">
        {digits.format(value)}
        {suffix}
      </span>
    </>
  );
}
