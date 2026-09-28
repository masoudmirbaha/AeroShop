import { api } from "@/lib/api";

type Faq = { id: string; question: string; answer: string };

export default async function FaqPage() {
  const items = await api<Faq[]>("/faq");
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">پرسش‌های متداول</h1>
      {items.map((item) => (
        <section key={item.id} className="border-b py-4">
          <h2 className="font-medium">{item.question}</h2>
          <p className="mt-2 text-muted-foreground">{item.answer}</p>
        </section>
      ))}
    </main>
  );
}
