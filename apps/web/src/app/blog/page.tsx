import { NotebookPen } from "lucide-react";
import { Card, EmptyState, Page } from "@/components/page";
import { api } from "@/lib/api";

type PageItem = { title: string; slug: string; excerpt: string | null; kind: string };

export default async function BlogPage() {
  const pages = await api<PageItem[]>("/pages");
  const posts = pages.filter((page) => page.kind === "POST");
  return (
    <Page
      width="narrow"
      eyebrow="یادداشت‌ها"
      title="یادداشت‌ها"
      description="پایه‌ی مطالب از دیتابیس خوانده می‌شود. هنوز سامانه‌ی مدیریت محتوا نیست."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "یادداشت‌ها" }]}
    >
      {posts.length === 0 ? <EmptyState icon={NotebookPen} title="هنوز یادداشتی منتشر نشده است" /> : null}
      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.slug}>
            <h2 className="font-semibold">{post.title}</h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
          </Card>
        ))}
      </div>
    </Page>
  );
}
