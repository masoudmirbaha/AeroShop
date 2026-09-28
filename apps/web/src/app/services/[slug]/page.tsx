import Link from "next/link";
import { api } from "@/lib/api";

type Service = { title: string; slug: string; summary: string; description: string };

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await api<Service>(`/services/${slug}`);
  const href = slug === "free-consultation" ? "/consultation" : "/request-project";
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">{service.title}</h1>
      <p className="mt-3 text-lg">{service.summary}</p>
      <p className="mt-6 leading-8">{service.description}</p>
      <Link href={`${href}?service=${service.slug}`} className="mt-8 inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground">
        ثبت درخواست
      </Link>
    </main>
  );
}
