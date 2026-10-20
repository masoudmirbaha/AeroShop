import { getDemoService, type DemoService } from "@/lib/catalog-demo";
import { demoCatalogEnabled } from "@/lib/demo-mode";

export type ServiceDetail = { title: string; slug: string; summary: string; description: string };

export type ResolvedService =
  | { status: "ok"; service: ServiceDetail; source: "api" }
  | { status: "ok"; service: DemoService; source: "demo"; apiError?: boolean }
  | { status: "missing" }
  | { status: "error"; message: string };

const apiOrigin = process.env.API_URL ?? "http://localhost:4000";

export async function resolveService(slug: string): Promise<ResolvedService> {
  const demo = getDemoService(slug);
  try {
    const response = await fetch(`${apiOrigin}/api/v1/services/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (response.status === 404) {
      if (demoCatalogEnabled() && demo) return { status: "ok", service: demo, source: "demo" };
      return { status: "missing" };
    }
    if (!response.ok) {
      if (demoCatalogEnabled() && demo) return { status: "ok", service: demo, source: "demo", apiError: true };
      return { status: "error", message: `API ${response.status}` };
    }
    return { status: "ok", service: (await response.json()) as ServiceDetail, source: "api" };
  } catch {
    if (demoCatalogEnabled() && demo) return { status: "ok", service: demo, source: "demo", apiError: true };
    return { status: "error", message: "بارگذاری خدمت انجام نشد." };
  }
}
