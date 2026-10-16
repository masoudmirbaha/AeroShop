"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";

type Slide = {
  id: string;
  headline: string;
  description: string;
  cta: string;
  href: string;
  art: ReactNode;
};

const INTERVAL_MS = 4000;
const DRAG_THRESHOLD_PX = 56;
const AXIS_LOCK_PX = 10;
const SNAP_MS = 500;

const slides: Slide[] = [
  {
    id: "engineering",
    headline: "از ایده مهندسی تا شبیه‌سازی دقیق",
    description: "ابزارها و منابع تخصصی برای پیشبرد پروژه‌های مهندسی شما.",
    cta: "مشاهده محصولات",
    href: "/products",
    art: <ArtFlow />,
  },
  {
    id: "courses",
    headline: "دانش مهندسی را به مهارت تبدیل کن",
    description: "منابع آموزشی تخصصی را پیدا کن و مسیر یادگیری‌ات را هدفمند ادامه بده.",
    cta: "مشاهده دوره‌ها",
    href: "/courses",
    art: <ArtLearning />,
  },
  {
    id: "services",
    headline: "برای پروژه مهندسی‌ات راهکار پیدا کن",
    description: "خدمات و راهکارهای مهندسی AeroShop را بررسی کن.",
    cta: "مشاهده خدمات",
    href: "/services",
    art: <ArtServices />,
  },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function announce(liveRef: RefObject<HTMLParagraphElement | null>, next: number) {
  if (liveRef.current) {
    liveRef.current.textContent = `اسلاید ${next + 1} از ${slides.length}`;
  }
}

export function HeroCarousel() {
  const labelId = "home-promo-carousel-label";
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [interactionPause, setInteractionPause] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  const liveRef = useRef<HTMLParagraphElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const suppressClickRef = useRef(false);
  const settleTimerRef = useRef<number | null>(null);
  const indexRef = useRef(index);
  const busyRef = useRef(false);
  const reducedMotionRef = useRef(reducedMotion);
  const gestureRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    axisLocked: boolean | null;
    dragging: boolean;
  } | null>(null);

  const canAutoplay = autoplay && !interactionPause && !isDragging && !isAnimating && !reducedMotion;

  useEffect(() => {
    indexRef.current = index;
    busyRef.current = isDragging || isAnimating;
    reducedMotionRef.current = reducedMotion;
  }, [index, isDragging, isAnimating, reducedMotion]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const sync = () => setViewportWidth(node.getBoundingClientRect().width);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }
    };
  }, []);

  function clearSettleTimer() {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  }

  function measuredWidth() {
    return viewportWidth || viewportRef.current?.getBoundingClientRect().width || 1;
  }

  function finishSettle(nextIndex: number) {
    clearSettleTimer();
    indexRef.current = nextIndex;
    busyRef.current = false;
    setIndex(nextIndex);
    announce(liveRef, nextIndex);
    setDragOffset(0);
    setIsAnimating(false);
    setIsDragging(false);
  }

  function animateOffsetTo(target: number, onDone: () => void) {
    clearSettleTimer();
    busyRef.current = true;
    setIsAnimating(true);
    setIsDragging(false);
    // Enable transition on the next frame so the browser animates from the live drag offset.
    requestAnimationFrame(() => {
      setDragOffset(target);
      settleTimerRef.current = window.setTimeout(onDone, SNAP_MS);
    });
  }

  function advanceBy(delta: number) {
    if (busyRef.current) return;
    const fromIndex = indexRef.current;
    const nextIndex = (fromIndex + delta + slides.length) % slides.length;
    if (reducedMotionRef.current) {
      finishSettle(nextIndex);
      return;
    }
    const target = delta > 0 ? -measuredWidth() : measuredWidth();
    animateOffsetTo(target, () => finishSettle(nextIndex));
  }

  const advanceByRef = useRef(advanceBy);
  useEffect(() => {
    advanceByRef.current = advanceBy;
  });

  useEffect(() => {
    if (!canAutoplay) return;
    const timer = window.setInterval(() => {
      advanceByRef.current(1);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [canAutoplay, index]);

  function goTo(next: number) {
    if (busyRef.current) return;
    const current = indexRef.current;
    const resolved = ((next % slides.length) + slides.length) % slides.length;
    if (resolved === current) return;

    const forward = (resolved - current + slides.length) % slides.length;
    const backward = (current - resolved + slides.length) % slides.length;
    if (!reducedMotionRef.current && (forward === 1 || backward === 1)) {
      advanceBy(forward === 1 ? 1 : -1);
      return;
    }

    clearSettleTimer();
    indexRef.current = resolved;
    busyRef.current = false;
    setIndex(resolved);
    announce(liveRef, resolved);
    setDragOffset(0);
  }

  function step(delta: number) {
    advanceBy(delta);
  }

  function settleFromDrag(deltaX: number, fromIndex: number) {
    const measured = viewportWidth || viewportRef.current?.getBoundingClientRect().width || 1;
    const horizontal = Math.abs(deltaX) >= DRAG_THRESHOLD_PX;
    const commitNext = horizontal && deltaX < 0;
    const commitPrev = horizontal && deltaX > 0;

    if (!commitNext && !commitPrev) {
      if (reducedMotion || Math.abs(deltaX) < 1) {
        setDragOffset(0);
        setIsDragging(false);
        setIsAnimating(false);
        return;
      }
      animateOffsetTo(0, () => {
        clearSettleTimer();
        setIsAnimating(false);
      });
      return;
    }

    const target = commitNext ? -measured : measured;
    const nextIndex = commitNext
      ? (fromIndex + 1) % slides.length
      : (fromIndex - 1 + slides.length) % slides.length;

    if (reducedMotion) {
      finishSettle(nextIndex);
      return;
    }

    animateOffsetTo(target, () => finishSettle(nextIndex));
  }

  function isChromeControl(target: EventTarget | null) {
    return target instanceof Element && Boolean(target.closest("button, [role='tab']"));
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (!event.isPrimary) return;
    if (isAnimating) return;
    if (isChromeControl(event.target)) return;

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      axisLocked: null,
      dragging: false,
    };
    suppressClickRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    gesture.lastX = event.clientX;

    if (gesture.axisLocked === null) {
      if (Math.abs(deltaX) < AXIS_LOCK_PX && Math.abs(deltaY) < AXIS_LOCK_PX) return;
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        gesture.axisLocked = false;
        return;
      }
      gesture.axisLocked = true;
      gesture.dragging = true;
      busyRef.current = true;
      setIsDragging(true);
      suppressClickRef.current = true;
    }

    if (!gesture.axisLocked) return;

    event.preventDefault();
    setDragOffset(deltaX);
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const deltaX = gesture.lastX - gesture.startX;
    const wasDragging = gesture.dragging && gesture.axisLocked === true;
    gestureRef.current = null;

    if (!wasDragging) {
      setIsDragging(false);
      setDragOffset(0);
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
      return;
    }

    settleFromDrag(deltaX, index);
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, SNAP_MS + 80);
  }

  function onPointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    gestureRef.current = null;
    clearSettleTimer();
    setIsDragging(false);
    setIsAnimating(false);
    setDragOffset(0);
    suppressClickRef.current = false;
  }

  function onCtaClick(event: ReactMouseEvent<HTMLAnchorElement>) {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  const width = viewportWidth || 1;
  const baseOffset = -width;
  const translateX = baseOffset + dragOffset;
  const transitionEnabled = isAnimating && !isDragging && !reducedMotion;
  const prevIndex = (index - 1 + slides.length) % slides.length;
  const nextIndex = (index + 1) % slides.length;
  const windowSlides = [slides[prevIndex], slides[index], slides[nextIndex]];

  return (
    <section
      className="relative isolate w-full overflow-hidden bg-navy text-navy-foreground"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      onMouseEnter={() => setInteractionPause(true)}
      onMouseLeave={() => setInteractionPause(false)}
      onFocusCapture={() => setInteractionPause(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setInteractionPause(false);
        }
      }}
    >
      <h2 id={labelId} className="sr-only">
        پیشنهادهای ویژه AeroShop
      </h2>
      <p ref={liveRef} className="sr-only" aria-live="polite" />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-bl from-navy via-navy to-primary/40" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,color-mix(in_oklch,var(--brand-cyan)_10%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-cyan)_10%,transparent)_1px,transparent_1px)] [background-size:36px_36px] mask-[radial-gradient(ellipse_85%_75%_at_65%_45%,black,transparent)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 end-[-12%] size-[30rem] rounded-full bg-radial from-primary/30 from-30% to-transparent to-70%" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 start-[-10%] size-[24rem] rounded-full bg-radial from-brand-cyan/15 from-30% to-transparent to-70%" />

      <div
        ref={viewportRef}
        dir="ltr"
        className={`relative z-0 w-full touch-pan-y select-none overflow-hidden ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onDragStart={(event) => event.preventDefault()}
      >
        <div
          className="flex select-none will-change-transform"
          style={{
            width: width > 1 ? width * 3 : "300%",
            transform: `translate3d(${translateX}px, 0, 0)`,
            transition: transitionEnabled ? `transform ${SNAP_MS}ms ease-in-out` : "none",
          }}
        >
          {windowSlides.map((slide, position) => {
            const isCurrent = position === 1;
            return (
              <div
                key={`${slide.id}-${position}-${index}`}
                className="relative shrink-0"
                dir="rtl"
                style={{ width: width > 1 ? width : "33.333%" }}
                aria-hidden={!isCurrent}
              >
                <SlidePanel slide={slide} interactive={isCurrent} onCtaClick={onCtaClick} indexLabel={`${index + 1} از ${slides.length}`} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-30">
        <button
          type="button"
          className="pointer-events-auto absolute top-1/2 left-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white outline-none ring-1 ring-white/20 backdrop-blur-sm transition-[background-color,transform] hover:bg-white/20 focus-visible:ring-3 focus-visible:ring-brand-cyan/60 active:scale-95 sm:left-4 sm:size-14"
          aria-label="اسلاید قبلی"
          onClick={() => step(-1)}
        >
          <ChevronLeft className="pointer-events-none size-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="pointer-events-auto absolute top-1/2 right-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white outline-none ring-1 ring-white/20 backdrop-blur-sm transition-[background-color,transform] hover:bg-white/20 focus-visible:ring-3 focus-visible:ring-brand-cyan/60 active:scale-95 sm:right-4 sm:size-14"
          aria-label="اسلاید بعدی"
          onClick={() => step(1)}
        >
          <ChevronRight className="pointer-events-none size-6" aria-hidden="true" />
        </button>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-4 pb-5 md:pb-6">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-2 text-xs text-white/85 outline-none ring-1 ring-white/15 transition-colors hover:bg-white/14 hover:text-white focus-visible:ring-3 focus-visible:ring-brand-cyan/60"
          aria-label={autoplay ? "توقف چرخش خودکار" : "ادامه چرخش خودکار"}
          aria-pressed={!autoplay}
          onClick={() => setAutoplay((value) => !value)}
        >
          {autoplay ? <Pause className="size-3.5" aria-hidden="true" /> : <Play className="size-3.5" aria-hidden="true" />}
          <span>{autoplay ? "توقف" : "پخش"}</span>
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label="انتخاب اسلاید">
          {slides.map((slide, slideIndex) => {
            const selected = slideIndex === index;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-label={`رفتن به اسلاید ${slideIndex + 1}`}
                aria-selected={selected}
                className={`h-2.5 rounded-full outline-none transition-[width,background-color] duration-300 focus-visible:ring-3 focus-visible:ring-brand-cyan/60 ${
                  selected ? "w-8 bg-brand-cyan" : "w-2.5 bg-white/35 hover:bg-white/55"
                }`}
                onClick={() => goTo(slideIndex)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SlidePanel({
  slide,
  interactive,
  onCtaClick,
  indexLabel,
}: {
  slide: Slide;
  interactive: boolean;
  onCtaClick: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
  indexLabel: string;
}) {
  return (
    <div
      className="relative mx-auto grid min-h-[19rem] w-full max-w-6xl select-none items-center px-12 py-8 sm:px-14 md:min-h-[22rem] md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-8 md:px-8 md:py-10 lg:px-10"
      role={interactive ? "group" : undefined}
      aria-roledescription={interactive ? "slide" : undefined}
      aria-label={interactive ? indexLabel : undefined}
    >
      <div className={`relative z-10 select-none ${interactive ? "" : "pointer-events-none"}`}>
        <p className="text-xs font-medium tracking-wide text-brand-cyan">AeroShop</p>
        <h3 className="mt-2 max-w-xl text-[1.45rem] leading-[1.45] font-bold text-white sm:mt-3 sm:text-3xl md:text-[2.15rem] md:leading-[1.35]">
          {slide.headline}
        </h3>
        <p className="mt-3 max-w-lg text-sm leading-7 text-navy-foreground/78 md:mt-4 md:text-base md:leading-8">{slide.description}</p>
        <div className="mt-6 md:mt-8">
          <Link
            href={slide.href}
            tabIndex={interactive ? 0 : -1}
            draggable={false}
            onClick={onCtaClick}
            onDragStart={(event) => event.preventDefault()}
            className="btn btn-lg select-none bg-white text-navy shadow-lg shadow-black/25 hover:bg-secondary"
          >
            {slide.cta}
            <ArrowLeft aria-hidden="true" className="pointer-events-none" />
          </Link>
        </div>
      </div>

      <div
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute inset-x-0 bottom-0 top-10 select-none opacity-30 mask-[linear-gradient(to_bottom,transparent,black_35%,black)] md:relative md:inset-auto md:top-auto md:h-[19rem] md:opacity-100 md:mask-none lg:h-[21rem]"
      >
        <div className="absolute inset-0 select-none">{slide.art}</div>
      </div>
    </div>
  );
}

function ArtFlow() {
  return (
    <svg viewBox="0 0 640 420" className="pointer-events-none size-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="banner-flow" x1="0" x2="1">
          <stop offset="0" stopColor="var(--brand-cyan)" stopOpacity="0.12" />
          <stop offset="0.5" stopColor="var(--brand-cyan)" stopOpacity="0.95" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id="banner-glow-a" cx="68%" cy="38%" r="48%">
          <stop offset="0" stopColor="var(--primary)" stopOpacity="0.4" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="420" fill="url(#banner-glow-a)" />
      <g fill="none" stroke="url(#banner-flow)" strokeWidth="1.55">
        {[78, 108, 138, 168, 198, 228, 258, 288, 318].map((y) => {
          const bend = y < 210 ? y - 42 : y + 36;
          return <path key={y} d={`M20 ${y}C170 ${y} 230 ${bend} 340 ${bend}S500 ${y} 620 ${y}`} />;
        })}
      </g>
      <path d="M210 220 C 258 164, 390 164, 458 214 C 392 232, 278 240, 210 220 Z" fill="var(--navy-foreground)" opacity="0.95" />
      <g stroke="var(--brand-cyan)" strokeWidth="1.1" opacity="0.55">
        <path d="M120 96 H175 V150" fill="none" />
        <path d="M520 300 H465 V246" fill="none" />
      </g>
    </svg>
  );
}

function ArtLearning() {
  return (
    <svg viewBox="0 0 640 420" className="pointer-events-none size-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="banner-learn" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--brand-cyan)" stopOpacity="0.22" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect x="70" y="64" width="330" height="220" rx="16" fill="color-mix(in oklch, var(--navy) 68%, white 10%)" stroke="color-mix(in oklch, white 18%, transparent)" />
      <rect x="130" y="98" width="330" height="220" rx="16" fill="color-mix(in oklch, var(--navy) 52%, white 14%)" stroke="color-mix(in oklch, white 22%, transparent)" />
      <rect x="190" y="132" width="330" height="220" rx="16" fill="url(#banner-learn)" opacity="0.92" stroke="color-mix(in oklch, white 28%, transparent)" />
      <g stroke="var(--navy-foreground)" strokeWidth="1.35" opacity="0.72" fill="none">
        <path d="M224 188 H478" />
        <path d="M224 224 H430" />
        <path d="M224 260 H456" />
        <path d="M224 296 H400" />
      </g>
      <circle cx="500" cy="96" r="42" fill="none" stroke="var(--brand-cyan)" strokeWidth="1.6" opacity="0.75" />
      <circle cx="500" cy="96" r="22" fill="var(--brand-cyan)" opacity="0.28" />
      <path d="M60 350 C160 310, 260 360, 360 330 S520 290, 600 320" fill="none" stroke="var(--brand-cyan)" strokeWidth="1.3" opacity="0.45" />
    </svg>
  );
}

function ArtServices() {
  return (
    <svg viewBox="0 0 640 420" className="pointer-events-none size-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="banner-service" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="var(--primary)" stopOpacity="0.4" />
          <stop offset="1" stopColor="var(--brand-cyan)" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="color-mix(in oklch, white 15%, transparent)" strokeWidth="1">
        {[100, 170, 240, 310, 380, 450, 520].map((x) => (
          <path key={x} d={`M${x} 50 V370`} />
        ))}
        {[90, 160, 230, 300, 370].map((y) => (
          <path key={y} d={`M70 ${y} H580`} />
        ))}
      </g>
      <path
        d="M130 290 L230 130 L340 240 L440 100 L530 190"
        fill="none"
        stroke="url(#banner-service)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {[
        [130, 290],
        [230, 130],
        [340, 240],
        [440, 100],
        [530, 190],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="7" fill="var(--navy)" stroke="var(--brand-cyan)" strokeWidth="1.6" />
      ))}
      <rect x="86" y="286" width="96" height="54" rx="12" fill="color-mix(in oklch, var(--navy) 42%, white 12%)" stroke="color-mix(in oklch, white 20%, transparent)" />
      <rect x="292" y="236" width="96" height="54" rx="12" fill="color-mix(in oklch, var(--navy) 42%, white 12%)" stroke="color-mix(in oklch, white 20%, transparent)" />
    </svg>
  );
}
