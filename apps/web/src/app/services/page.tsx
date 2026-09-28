import Link from "next/link";
import { api } from "@/lib/api";

type Service = { id: string; title: string; slug: string; summary: string };

export default async function ServicesPage() {
  const services = await api<Service[]>("/services");
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">خدمات مهندسی</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <Link key={service.id} href={`/services/${service.slug}`} className="rounded-xl border p-5">
            <h2 className="text-xl font-semibold">{service.title}</h2>
            <p className="mt-2 text-muted-foreground">{service.summary}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
