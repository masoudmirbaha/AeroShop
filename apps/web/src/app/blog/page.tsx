import { CalendarDays, NotebookPen } from "lucide-react";
import { Card, EmptyState, Page } from "@/components/page";
import { api } from "@/lib/api";
import { formatPostDate, latestPosts, type PageItem } from "@/lib/posts";

export default async function BlogPage() {
  const posts = latestPosts(await api<PageItem[]>("/pages"));
  return (
    <Page
      width="narrow"
      title="یادداشت‌ها"
      description="پایه‌ی مطالب از دیتابیس خوانده می‌شود. هنوز سامانه‌ی مدیریت محتوا نیست."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "یادداشت‌ها" }]}
    >
      {posts.length === 0 ? <EmptyState icon={NotebookPen} title="هنوز یادداشتی منتشر نشده است" /> : null}
      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.slug}>
            <article id={post.slug} className="scroll-mt-24">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="badge badge-muted">{post.category}</span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  <time dateTime={post.createdAt}>{formatPostDate(post.createdAt)}</time>
                </span>
              </p>
              <h2 className="mt-3 font-semibold">{post.title}</h2>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
            </article>
          </Card>
        ))}
      </div>
    </Page>
  );
}
