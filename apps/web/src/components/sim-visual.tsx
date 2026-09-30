import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SimKind =
  | "airfoil"
  | "pipe"
  | "thermal"
  | "combustion"
  | "particles"
  | "multiphase"
  | "mesh"
  | "fsi"
  | "acoustics"
  | "hvac"
  | "structure";

const meta: Record<SimKind, { label: string; alt: string }> = {
  airfoil: { label: "Pressure · streamlines", alt: "تصویرسازی خطوط جریان و میدان فشار اطراف ایرفویل" },
  pipe: { label: "Velocity profile", alt: "تصویرسازی پروفیل سرعت جریان داخل لوله" },
  thermal: { label: "Temperature contours", alt: "تصویرسازی کانتورهای دما در انتقال حرارت" },
  combustion: { label: "Reacting flow · T", alt: "تصویرسازی شعله و جریان واکنشی در احتراق" },
  particles: { label: "DPM trajectories", alt: "تصویرسازی مسیر ذرات در مدل فاز گسسته" },
  multiphase: { label: "VOF · phase interface", alt: "تصویرسازی سطح مشترک دو فاز در جریان چندفازی" },
  mesh: { label: "Dynamic mesh", alt: "تصویرسازی شبکه متحرک و تغییر شکل مش" },
  fsi: { label: "FSI · deformation", alt: "تصویرسازی اندرکنش سیال و سازه با تغییر شکل صفحه انعطاف‌پذیر" },
  acoustics: { label: "Acoustic pressure", alt: "تصویرسازی انتشار موج فشار آکوستیکی" },
  hvac: { label: "Room airflow", alt: "تصویرسازی جریان هوا و توزیع دما در فضای داخلی" },
  structure: { label: "FEA · stress", alt: "تصویرسازی مش المان محدود و توزیع تنش روی قطعه" },
};

const rules: [SimKind, RegExp][] = [
  ["acoustics", /آکوستیک|acoustic|صدا|نویز|noise/i],
  ["combustion", /احتراق|combust|شعله|flame/i],
  ["particles", /فاز گسسته|dpm|ذره|particle/i],
  ["multiphase", /چندفاز|multiphase|vof|دوفاز/i],
  ["fsi", /اندرکنش|fsi|سیال و سازه/i],
  ["mesh", /مش دینامیک|(^|\s)مش(\s|$)|mesh/i],
  ["hvac", /تهویه|hvac|ساختمان|اتاق/i],
  ["thermal", /حرارت|heat|thermal|دما/i],
  ["airfoil", /ایرفویل|airfoil|آیرودینامیک|aero|هواپیما|بال/i],
  ["pipe", /لوله|pipe|کانال|duct/i],
  ["structure", /سازه|تنش|fea|cae|structural/i],
];

type VisualSource = { slug: string; title: string; topic?: { name: string; slug: string } | null; category?: { name: string; slug: string } | null };

export function visualFor(source: VisualSource): { kind: SimKind; seed: number } {
  const candidates = [source.title, [source.topic?.name, source.topic?.slug].filter(Boolean).join(" "), source.category?.name ?? ""];
  for (const text of candidates) {
    const match = rules.find(([, pattern]) => pattern.test(text));
    if (match) return { kind: match[0], seed: hash(source.slug) };
  }
  return { kind: "airfoil", seed: hash(source.slug) };
}

function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (value: number) => Math.round(value * 10) / 10;
// Dense scenes are serialized into both HTML and the RSC payload, so polylines drop points that are
// exactly collinear after rounding and rely on implicit line-tos.
function poly(points: [number, number][]) {
  const rounded = points.map(([x, y]): [number, number] => [n(x), n(y)]);
  const kept = rounded.filter((point, i) => {
    const prev = rounded[i - 1];
    const next = rounded[i + 1];
    if (!prev || !next) return true;
    const cross = (point[0] - prev[0]) * (next[1] - point[1]) - (point[1] - prev[1]) * (next[0] - point[0]);
    const forward = (point[0] - prev[0]) * (next[0] - point[0]) + (point[1] - prev[1]) * (next[1] - point[1]) > 0;
    return Math.abs(cross) > 1e-9 || !forward;
  });
  return `M${kept.map(([x, y]) => `${x} ${y}`).join(" ")}`;
}

const C = {
  pale: "var(--navy-foreground)",
  cyan: "var(--brand-cyan)",
  blue: "var(--primary)",
  warm: "var(--sim-warm)",
  hot: "var(--sim-hot)",
};

function Airfoil({ id, seed }: { id: string; seed: number }) {
  const r = random(seed);
  const aoa = n(-9 + r() * 6);
  const lift = 0.8 + r() * 0.5;
  return (
    <>
      <radialGradient id={`${id}-p`} cx="0.3" cy="0.5" r="0.5">
        <stop offset="0" stopColor={C.cyan} stopOpacity="0.45" />
        <stop offset="1" stopColor={C.cyan} stopOpacity="0" />
      </radialGradient>
      <ellipse cx="118" cy="100" rx="90" ry="54" fill={`url(#${id}-p)`} />
      <g fill="none" stroke={`url(#${id}-line)`} strokeWidth="1.1">
        {Array.from({ length: 11 }, (_, i) => {
          const y = 22 + i * 15.5;
          const bump = 30 * lift * Math.exp(-(((y - 100) / 46) ** 2));
          const up = y < 100;
          const mid = up ? y - bump : y + bump * 0.55;
          return <path key={y} d={`M0 ${n(y)}C90 ${n(y)} 105 ${n(mid)} 165 ${n(mid)}S255 ${n(y + (up ? 6 : 3))} 320 ${n(y + (up ? 8 : 4))}`} />;
        })}
      </g>
      <path d="M86 100 C 110 78, 190 78, 236 99 C 190 105, 120 109, 86 100 Z" transform={`rotate(${aoa} 160 100)`} fill={C.pale} opacity="0.95" />
    </>
  );
}

function Pipe({ seed }: { seed: number }) {
  const r = random(seed);
  const stations = [95 + r() * 20, 200 + r() * 30];
  return (
    <>
      <rect x="0" y="52" width="320" height="96" fill={C.blue} opacity="0.18" />
      <rect x="0" y="80" width="320" height="40" fill={C.cyan} opacity="0.14" />
      <path d="M0 52 H320 M0 148 H320" stroke={C.pale} strokeWidth="2" opacity="0.55" />
      {stations.map((x0) => (
        <g key={x0} stroke={C.cyan} strokeWidth="1" opacity="0.85">
          <path
            d={poly(Array.from({ length: 21 }, (_, i) => {
              const y = 52 + i * 4.8;
              return [x0 + 58 * (1 - ((y - 100) / 48) ** 2), y];
            }))}
            fill="none"
          />
          <path d={`M${n(x0)} 52 V148`} opacity="0.4" />
          {[60, 72, 86, 100, 114, 128, 140].map((y) => {
            const len = 58 * (1 - ((y - 100) / 48) ** 2);
            return <path key={y} d={`M${n(x0)} ${y} h${n(len)} m-4 -2.5 l4 2.5 l-4 2.5`} fill="none" />;
          })}
        </g>
      ))}
    </>
  );
}

function Thermal({ id, seed }: { id: string; seed: number }) {
  const r = random(seed);
  const cx = 95 + r() * 50;
  return (
    <>
      <radialGradient id={`${id}-t`} cx="0.35" cy="0.5" r="0.65">
        <stop offset="0" stopColor={C.hot} stopOpacity="0.55" />
        <stop offset="0.3" stopColor={C.warm} stopOpacity="0.3" />
        <stop offset="0.65" stopColor={C.cyan} stopOpacity="0.2" />
        <stop offset="1" stopColor={C.blue} stopOpacity="0" />
      </radialGradient>
      <ellipse cx={n(cx + 60)} cy="100" rx="150" ry="80" fill={`url(#${id}-t)`} />
      {Array.from({ length: 7 }, (_, k) => (
        <ellipse
          key={k}
          cx={n(cx + (k + 1) * 11)}
          cy="100"
          rx={n(26 + (k + 1) * 17)}
          ry={n(24 + (k + 1) * 9)}
          fill="none"
          stroke={k < 2 ? C.warm : C.cyan}
          strokeWidth="0.9"
          opacity={n(0.75 - k * 0.08)}
        />
      ))}
      <circle cx={n(cx)} cy="100" r="22" fill={C.hot} opacity="0.75" />
      <circle cx={n(cx)} cy="100" r="22" fill="none" stroke={C.pale} strokeOpacity="0.6" />
    </>
  );
}

function Combustion({ seed }: { seed: number }) {
  const r = random(seed);
  const x = 150 + r() * 20;
  const flames: [number, number, string, number][] = [
    [66, 172, C.warm, 0.18],
    [50, 140, C.warm, 0.3],
    [34, 104, C.hot, 0.45],
    [16, 62, C.pale, 0.55],
  ];
  return (
    <>
      {[40, 80, 240, 280].map((sx) => (
        <path key={sx} d={`M${sx} 200 C ${sx} 140, ${n((sx + x) / 2)} 90, ${n(x + (sx < x ? -8 : 8))} 10`} fill="none" stroke={C.cyan} strokeWidth="1" opacity="0.4" />
      ))}
      {flames.map(([w, h, color, opacity]) => (
        <path
          key={w}
          d={`M${n(x - w)} 200 C ${n(x - w)} ${n(200 - h * 0.55)}, ${n(x - w * 0.25)} ${n(200 - h * 0.85)}, ${n(x)} ${n(200 - h)} C ${n(x + w * 0.25)} ${n(200 - h * 0.85)}, ${n(x + w)} ${n(200 - h * 0.55)}, ${n(x + w)} 200 Z`}
          fill={color}
          opacity={opacity}
        />
      ))}
      <rect x={n(x - 22)} y="192" width="44" height="8" fill={C.pale} opacity="0.7" />
    </>
  );
}

function Particles({ seed }: { seed: number }) {
  const r = random(seed);
  const tracks = Array.from({ length: 8 }, (_, i) => ({ spread: -60 + i * 16 + r() * 8, drop: 20 + r() * 40 }));
  return (
    <>
      {[40, 80, 120, 160].map((y) => (
        <path key={y} d={`M0 ${y} C 120 ${y - 6}, 200 ${y + 6}, 320 ${y}`} fill="none" stroke={C.pale} strokeWidth="0.6" opacity="0.12" />
      ))}
      {tracks.map(({ spread, drop }, i) => {
        const p0: [number, number] = [26, 100];
        const p1: [number, number] = [130, 100 + spread * 0.6];
        const p2: [number, number] = [330, 100 + spread * 1.2 + drop];
        const at = (t: number): [number, number] => [
          (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
          (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
        ];
        return (
          <g key={i}>
            <path d={`M${p0[0]} ${p0[1]} Q ${n(p1[0])} ${n(p1[1])}, ${n(p2[0])} ${n(p2[1])}`} fill="none" stroke={C.cyan} strokeWidth="0.7" opacity="0.35" />
            {[0.18, 0.34, 0.5, 0.66, 0.82].map((t, j) => {
              const [px, py] = at(t);
              return <circle key={t} cx={n(px)} cy={n(py)} r={n(1.2 + ((i + j) % 3) * 0.8)} fill={j % 2 ? C.cyan : C.pale} opacity="0.85" />;
            })}
          </g>
        );
      })}
      <rect x="12" y="92" width="16" height="16" rx="2" fill={C.pale} opacity="0.8" />
    </>
  );
}

function Multiphase({ id, seed }: { id: string; seed: number }) {
  const r = random(seed);
  const phase = r() * Math.PI * 2;
  const surface = Array.from({ length: 33 }, (_, i): [number, number] => {
    const x = i * 10;
    return [x, 108 + 14 * Math.sin(x / 38 + phase) + 6 * Math.sin(x / 13 + phase * 2)];
  });
  const bubbles = Array.from({ length: 9 }, () => [r() * 320, 135 + r() * 55, 2 + r() * 5]);
  return (
    <>
      <linearGradient id={`${id}-w`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.cyan} stopOpacity="0.55" />
        <stop offset="1" stopColor={C.blue} stopOpacity="0.25" />
      </linearGradient>
      <path d={`${poly(surface)} L320 200 L0 200 Z`} fill={`url(#${id}-w)`} />
      <path d={poly(surface)} fill="none" stroke={C.pale} strokeWidth="1.4" opacity="0.85" />
      {bubbles.map(([x, y, radius], i) => (
        <circle key={i} cx={n(x)} cy={n(y)} r={n(radius)} fill="none" stroke={C.pale} strokeWidth="0.8" opacity="0.5" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={n(60 + i * 70 + r() * 20)} cy={n(50 + r() * 30)} r="1.8" fill={C.cyan} opacity="0.7" />
      ))}
    </>
  );
}

function DynamicMesh({ seed }: { seed: number }) {
  const r = random(seed);
  const cx = 140 + r() * 40;
  const cy = 100;
  const warp = (x: number, y: number): [number, number] => {
    const dx = x - cx;
    const dy = y - cy;
    const d = Math.hypot(dx, dy) || 1;
    const push = 16 * Math.exp(-((d / 55) ** 2));
    return [x + (dx / d) * push, y + (dy / d) * push];
  };
  const cols = Array.from({ length: 21 }, (_, i) => poly(Array.from({ length: 13 }, (_, j) => warp(i * 16, (j * 200) / 12))));
  const rows = Array.from({ length: 14 }, (_, i) => poly(Array.from({ length: 21 }, (_, j) => warp(j * 16, i * 16))));
  // Lines within one family never cross, so merging them keeps the crossings' opacity identical.
  const families = [cols, rows].flatMap((lines) => [
    { d: lines.filter((_, i) => i % 4).join(""), stroke: C.pale, opacity: 0.22 },
    { d: lines.filter((_, i) => !(i % 4)).join(""), stroke: C.cyan, opacity: 0.5 },
  ]);
  return (
    <>
      {families.map(({ d, stroke, opacity }, i) => (
        <path key={i} d={d} fill="none" stroke={stroke} strokeWidth="0.6" opacity={opacity} />
      ))}
      <circle cx={n(cx)} cy={cy} r="18" fill={C.pale} opacity="0.92" />
      <path d={`M${n(cx - 6)} ${cy} h12 m-4 -3 l4 3 l-4 3`} fill="none" stroke={C.blue} strokeWidth="1.4" />
    </>
  );
}

function Fsi({ id, seed }: { id: string; seed: number }) {
  const r = random(seed);
  const bend = 14 + r() * 16;
  return (
    <>
      <linearGradient id={`${id}-s`} x1="0" x2="1">
        <stop offset="0" stopColor={C.warm} />
        <stop offset="1" stopColor={C.cyan} />
      </linearGradient>
      <g fill="none" stroke={C.cyan} strokeWidth="0.9">
        {Array.from({ length: 9 }, (_, i) => {
          const y = 28 + i * 18;
          const points = Array.from({ length: 33 }, (_, j): [number, number] => {
            const x = j * 10;
            const amp = x > 110 ? ((x - 110) / 210) * 9 * Math.exp(-(((y - 100) / 70) ** 2)) : 0;
            const avoid = 18 * Math.exp(-(((x - 88) / 30) ** 2)) * Math.exp(-(((y - 100) / 26) ** 2)) * Math.sign(y - 100);
            return [x, y + avoid + amp * Math.sin(x / 16)];
          });
          return <path key={y} d={poly(points)} opacity="0.5" />;
        })}
      </g>
      {[200, 245, 290].map((x, i) => (
        <ellipse key={x} cx={x} cy={i % 2 ? 118 : 82} rx="12" ry="7" fill="none" stroke={C.pale} strokeWidth="0.8" opacity="0.35" />
      ))}
      <path d={`M104 97 Q 150 ${n(97 + bend * 0.2)}, 196 ${n(97 + bend)} L196 ${n(103 + bend)} Q 150 ${n(103 + bend * 0.2)}, 104 103 Z`} fill={`url(#${id}-s)`} />
      <circle cx="88" cy="100" r="17" fill={C.pale} opacity="0.95" />
    </>
  );
}

function Acoustics({ seed }: { seed: number }) {
  const r = random(seed);
  const sx = 70 + r() * 40;
  const decay = (x: number) => 20 * Math.exp(-(x - sx) / 180);
  return (
    <>
      {Array.from({ length: 13 }, (_, k) => (
        <circle key={k} cx={n(sx)} cy="92" r={18 + k * 22} fill="none" stroke={k % 2 ? C.pale : C.cyan} strokeWidth={k % 2 ? 0.6 : 1.2} opacity={n(0.7 - k * 0.045)} />
      ))}
      <path
        d={poly(Array.from({ length: 41 }, (_, i): [number, number] => {
          const x = sx + i * 6;
          return [x, 172 + decay(x) * Math.sin((x - sx) / 11) * -1];
        }))}
        fill="none"
        stroke={C.cyan}
        strokeWidth="1.2"
        opacity="0.8"
      />
      <path d="M0 172 H320" stroke={C.pale} strokeWidth="0.5" opacity="0.25" />
      <circle cx={n(sx)} cy="92" r="7" fill={C.pale} />
    </>
  );
}

function Hvac({ id, seed }: { id: string; seed: number }) {
  const r = random(seed);
  const inlet = 50 + r() * 40;
  return (
    <>
      <linearGradient id={`${id}-h`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.warm} stopOpacity="0.28" />
        <stop offset="1" stopColor={C.blue} stopOpacity="0.2" />
      </linearGradient>
      <rect x="28" y="28" width="264" height="146" fill={`url(#${id}-h)`} stroke={C.pale} strokeOpacity="0.45" />
      <rect x={n(inlet)} y="26" width="44" height="5" fill={C.cyan} />
      <rect x="252" y="166" width="30" height="5" fill={C.pale} opacity="0.6" />
      {[0, 1, 2].map((i) => {
        const s = i * 16;
        return (
          <path
            key={i}
            d={`M${n(inlet + 22)} ${34 + s * 0.4} C ${n(inlet + 10)} ${110 + s}, ${80 + s} ${160 - s * 0.6}, ${170} ${150 - s} S ${270 - s} ${110 + s}, ${250 - s * 1.2} ${60 + s} S ${150 + s} ${50 + s}, ${130 + s} ${90 + s}`}
            fill="none"
            stroke={C.cyan}
            strokeWidth="1.1"
            opacity={0.8 - i * 0.2}
            markerMid={`url(#${id}-arrow)`}
          />
        );
      })}
      <marker id={`${id}-arrow`} viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M0 0 L6 3 L0 6 Z" fill={C.cyan} />
      </marker>
      <rect x="120" y="150" width="70" height="24" fill={C.pale} opacity="0.12" />
    </>
  );
}

function Structure({ id, seed }: { id: string; seed: number }) {
  const r = random(seed);
  const hole = 20 + r() * 20;
  const shape = "M60 40 H130 V120 H270 V170 H60 Z";
  return (
    <>
      <radialGradient id={`${id}-st`} cx="0.3" cy="0.6" r="0.6">
        <stop offset="0" stopColor={C.hot} stopOpacity="0.8" />
        <stop offset="0.35" stopColor={C.warm} stopOpacity="0.6" />
        <stop offset="0.7" stopColor={C.cyan} stopOpacity="0.45" />
        <stop offset="1" stopColor={C.blue} stopOpacity="0.4" />
      </radialGradient>
      {/* One triangulated 15×13 cell; edges are drawn on both sides so neighbouring tiles form full-width strokes. */}
      <pattern id={`${id}-tri`} x="60" y="40" width="15" height="13" patternUnits="userSpaceOnUse">
        <path d="M0 0H15V13H0ZM15 0L0 13" fill="none" stroke={C.pale} strokeWidth="0.4" />
      </pattern>
      <path d={shape} fill={`url(#${id}-st)`} />
      <path d={shape} fill={`url(#${id}-tri)`} opacity="0.35" />
      <path d={shape} fill="none" stroke={C.pale} strokeWidth="1.2" opacity="0.8" />
      <circle cx="95" cy={n(60 + hole)} r="10" fill="var(--sim-bg)" stroke={C.pale} strokeOpacity="0.8" />
    </>
  );
}

function Scene({ kind, id, seed }: { kind: SimKind; id: string; seed: number }): ReactNode {
  switch (kind) {
    case "airfoil":
      return <Airfoil id={id} seed={seed} />;
    case "pipe":
      return <Pipe seed={seed} />;
    case "thermal":
      return <Thermal id={id} seed={seed} />;
    case "combustion":
      return <Combustion seed={seed} />;
    case "particles":
      return <Particles seed={seed} />;
    case "multiphase":
      return <Multiphase id={id} seed={seed} />;
    case "mesh":
      return <DynamicMesh seed={seed} />;
    case "fsi":
      return <Fsi id={id} seed={seed} />;
    case "acoustics":
      return <Acoustics seed={seed} />;
    case "hvac":
      return <Hvac id={id} seed={seed} />;
    case "structure":
      return <Structure id={id} seed={seed} />;
  }
}

const legends: Partial<Record<SimKind, string[]>> = {
  airfoil: [C.pale, C.cyan, C.blue],
  thermal: [C.hot, C.warm, C.cyan, C.blue],
  combustion: [C.pale, C.hot, C.warm, C.blue],
  structure: [C.hot, C.warm, C.cyan, C.blue],
  acoustics: [C.cyan, C.pale, C.blue],
};

export function SimVisual({ kind, seed, className, label = true, decorative = false }: { kind: SimKind; seed: number; className?: string; label?: boolean; decorative?: boolean }) {
  const id = `sim-${kind}-${seed.toString(36)}`;
  const legend = legends[kind];
  return (
    <div className={cn("relative isolate overflow-hidden bg-(--sim-bg)", className)}>
      <svg
        viewBox="0 0 320 200"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : meta[kind].alt}
        aria-hidden={decorative || undefined}
      >
        <defs>
          <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--sim-bg)" />
            <stop offset="1" stopColor="var(--sim-bg-2)" />
          </linearGradient>
          <linearGradient id={`${id}-line`} x1="0" x2="1">
            <stop offset="0" stopColor={C.pale} stopOpacity="0.15" />
            <stop offset="0.55" stopColor={C.cyan} stopOpacity="0.9" />
            <stop offset="1" stopColor={C.blue} stopOpacity="0.55" />
          </linearGradient>
          <pattern id={`${id}-grid`} width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0H0V16" fill="none" stroke={C.pale} strokeWidth="0.5" opacity="0.07" />
          </pattern>
        </defs>
        <rect width="320" height="200" fill={`url(#${id}-bg)`} />
        <rect width="320" height="200" fill={`url(#${id}-grid)`} />
        <Scene kind={kind} id={id} seed={seed} />
      </svg>
      {legend ? (
        <span aria-hidden="true" className="absolute top-1/2 right-3 flex h-16 w-1.5 -translate-y-1/2 flex-col overflow-hidden rounded-full ring-1 ring-white/15">
          {legend.map((color) => (
            <span key={color} className="flex-1" style={{ background: color }} />
          ))}
        </span>
      ) : null}
      {label ? (
        <span dir="ltr" aria-hidden="true" className="absolute bottom-2.5 left-2.5 rounded bg-black/35 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white/80">
          {meta[kind].label}
        </span>
      ) : null}
    </div>
  );
}
