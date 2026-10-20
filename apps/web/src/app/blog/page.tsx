import { CalendarDays, NotebookPen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ApiErrorNotice, DemoNotice } from "@/components/demo-notice";
import { Card, EmptyState, Page } from "@/components/page";
import { demoBlogPosts, getDemoBlogPost } from "@/lib/catalog-demo";
import { demoCatalogEnabled } from "@/lib/demo-mode";
import { formatPostDate, latestPosts, toPost, type PageItem, type Post } from "@/lib/posts";
import { tryApi } from "@/lib/try-api";

export const metadata: Metadata = {
  title: "یادداشت‌ها",
  description: "مطالب فنی، آموزشی و کاربردی در حوزه شبیه‌سازی و مهندسی CFD.",
};

export default async function BlogPage() {
  const load = await tryApi<PageItem[]>("/pages");
  const demoEnabled = demoCatalogEnabled();

  let posts: Post[] = [];
  let usingDemo = false;
  let apiFailed = false;

  if (load.status === "ok") {
    posts = latestPosts(load.data);
    if (!posts.length && demoEnabled) {
      posts = demoBlogPosts.map((post) => toPost(post));
      usingDemo = true;
    }
  } else {
    apiFailed = true;
    if (demoEnabled) {
      posts = demoBlogPosts.map((post) => toPost(post));
      usingDemo = true;
    } else {
      throw new Error(load.message);
    }
  }

  return (
    <Page
      width="narrow"
      title="یادداشت‌ها"
      description="مطالب فنی و آموزشی در حوزه شبیه‌سازی عددی و مهندسی."
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "یادداشت‌ها" }]}
    >
      {apiFailed ? <ApiErrorNotice message="بارگذاری مطالب از سرور انجام نشد." /> : null}
      {usingDemo ? <DemoNotice message="مقالات نمایشی برای دمو — محتوای نمونه هستند و مرجع علمی کامل محسوب نمی‌شوند." /> : null}
      {posts.length === 0 ? <EmptyState icon={NotebookPen} title="هنوز یادداشتی منتشر نشده است" /> : null}
      <div className="grid gap-4">
        {posts.map((post) => {
          const hasDemoDetail = Boolean(getDemoBlogPost(post.slug));
          const href = demoEnabled && hasDemoDetail ? `/blog/${post.slug}` : `/blog#${post.slug}`;
          return (
            <Card key={post.slug}>
              <article id={post.slug} className="scroll-mt-24">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="badge badge-muted">{post.category}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    <time dateTime={post.createdAt}>{formatPostDate(post.createdAt)}</time>
                  </span>
                </p>
                <h2 className="mt-3 font-semibold">
                  <Link href={href} className="text-link">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
              </article>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}
