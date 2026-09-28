import { api } from "@/lib/api";

type PageItem = { title: string; slug: string; excerpt: string | null; kind: string };

export default async function BlogPage() {
  const pages = await api<PageItem[]>("/pages");
  const posts = pages.filter((page) => page.kind === "POST");
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">یادداشت‌ها</h1>
      <p className="mt-3 text-muted-foreground">پایه‌ی مطالب از دیتابیس خوانده می‌شود. هنوز سامانه‌ی مدیریت محتوا نیست.</p>
      {posts.length === 0 ? <p className="mt-6">هنوز یادداشتی منتشر نشده است.</p> : null}
      {posts.map((post) => (
        <article key={post.slug} className="mt-4">
          <h2 className="font-medium">{post.title}</h2>
          <p className="text-sm text-muted-foreground">{post.excerpt}</p>
        </article>
      ))}
    </main>
  );
}
