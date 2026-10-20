import { getDemoProduct, type DemoProductDetail } from "@/lib/catalog-demo";
import { demoCatalogEnabled } from "@/lib/demo-mode";
import type { ProductCard } from "@/lib/api";

export type ProductDetailData = ProductCard & {
  description: string;
  files: { id: string; filename: string }[];
  sections: { id: string; title: string; lessons: { id: string; title: string; durationMinutes: number | null }[] }[];
  bundleItems: ProductCard[];
  related: ProductCard[];
  contentStatus?: string;
};

export type ResolvedProduct =
  | { status: "ok"; product: ProductDetailData; source: "api" }
  | { status: "ok"; product: DemoProductDetail; source: "demo"; apiError?: boolean }
  | { status: "missing" }
  | { status: "error"; message: string };

const apiOrigin = process.env.API_URL ?? "http://localhost:4000";

function isNextControlFlow(error: unknown) {
  return Boolean(error && typeof error === "object" && "digest" in error);
}

/**
 * Resolves a product/course detail without calling notFound() internally.
 *
 * - HTTP 404 → `missing` (caller may notFound), unless a Dev demo slug matches.
 * - Network / non-404 failures → `error` (service failure), never treated as missing.
 * - Matching demo slug in Development → demo detail (optionally with apiError).
 */
export async function resolveProductDetail(slug: string): Promise<ResolvedProduct> {
  const demo = getDemoProduct(slug);
  try {
    const response = await fetch(`${apiOrigin}/api/v1/products/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (response.status === 404) {
      if (demoCatalogEnabled() && demo) return { status: "ok", product: demo, source: "demo" };
      return { status: "missing" };
    }
    if (!response.ok) {
      if (demoCatalogEnabled() && demo) return { status: "ok", product: demo, source: "demo", apiError: true };
      return { status: "error", message: `API ${response.status} for /products/${slug}` };
    }
    return { status: "ok", product: (await response.json()) as ProductDetailData, source: "api" };
  } catch (error) {
    // Preserve Next.js control-flow (e.g. notFound) if it ever surfaces here.
    if (isNextControlFlow(error)) throw error;
    if (demoCatalogEnabled() && demo) {
      return {
        status: "ok",
        product: demo,
        source: "demo",
        apiError: true,
      };
    }
    // Connection / fetch failure for an unknown slug stays a service error, not 404.
    const message = error instanceof Error ? error.message : "بارگذاری محصول انجام نشد.";
    return { status: "error", message };
  }
}
