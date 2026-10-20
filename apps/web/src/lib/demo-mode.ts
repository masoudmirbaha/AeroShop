/**
 * Demo catalog / content fallbacks are for local Development showcase only.
 * Production must never silently replace a failed API with invented catalog data.
 */
export function demoCatalogEnabled() {
  return process.env.NODE_ENV === "development";
}
