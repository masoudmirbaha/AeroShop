"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedStat({ value, suffix = "+", duration = 1400 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = reduced ? 1 : Math.min(1, (now - start) / duration);
        setCurrent(Math.round(value * (1 - Math.pow(1 - progress, 3))));
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
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {current.toLocaleString("fa-IR")}
      {suffix}
    </span>
  );
}
