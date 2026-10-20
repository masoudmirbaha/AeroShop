import { api } from "@/lib/api";

export type ApiLoad<T> = { status: "ok"; data: T } | { status: "error"; message: string };

/**
 * Loads a public API path without failing the whole page.
 * Re-throws Next.js control-flow errors (e.g. notFound) so they stay intact.
 */
export async function tryApi<T>(path: string): Promise<ApiLoad<T>> {
  try {
    return { status: "ok", data: await api<T>(path) };
  } catch (error) {
    if (isNextControlFlow(error)) throw error;
    const message = error instanceof Error ? error.message : "بارگذاری انجام نشد.";
    return { status: "error", message };
  }
}

function isNextControlFlow(error: unknown) {
  return Boolean(error && typeof error === "object" && "digest" in error);
}
