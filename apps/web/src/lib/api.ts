import { notFound } from "next/navigation";

const apiOrigin = process.env.API_URL ?? "http://localhost:4000";

export async function api<T>(path: string): Promise<T> {
  const response = await fetch(`${apiOrigin}/api/v1${path}`, { cache: "no-store" });
  if (response.status === 404) {
    notFound();
  }
  if (!response.ok) {
    throw new Error(`API ${response.status} for ${path}`);
  }
  return response.json() as Promise<T>;
}

export type ProductCard = {
  id: string;
  type: "SINGLE_PRODUCT" | "BUNDLE" | "COURSE" | "FREE";
  title: string;
  slug: string;
  summary: string;
  price: number;
  comparePrice: number | null;
  isDigital: boolean;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | null;
  isFeatured: boolean;
  category: { name: string; slug: string } | null;
  topic: { name: string; slug: string } | null;
  image: string | null;
};

export type ProductList = {
  items: ProductCard[];
  page: number;
  pageSize: number;
  total: number;
};
