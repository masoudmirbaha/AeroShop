import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoNotice } from "@/components/demo-notice";
import { Card, Page } from "@/components/page";
import { SimVisual, visualFor } from "@/components/sim-visual";
import { getDemoBlogPost } from "@/lib/catalog-demo";
import { demoCatalogEnabled } from "@/lib/demo-mode";
import { formatPostDate } from "@/lib/posts";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getDemoBlogPost((await params).slug);
  if (!post) return { title: "مطلب" };
  return { title: post.title, description: post.excerpt };
}

/**
 * Detail pages currently serve Development demo posts only.
 * Live API `GET /pages` does not expose full `content` per slug yet.
 */
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!demoCatalogEnabled()) notFound();
  const post = getDemoBlogPost(slug);
  if (!post) notFound();

  const { kind, seed } = visualFor({ slug: post.slug, title: post.title });

  return (
    <Page
      width="narrow"
      title={post.title}
      description={post.excerpt}
      breadcrumbs={[{ label: "خانه", href: "/" }, { label: "یادداشت‌ها", href: "/blog" }, { label: post.title }]}
    >
      <DemoNotice message="این مقاله نمونه نمایشی است و جایگزین مرجع علمی کامل نیست." />
      <Card className="overflow-hidden p-0">
        <div className="relative aspect-[16/9] w-full bg-(--sim-bg)">
          <SimVisual kind={kind} seed={seed} label={false} decorative className="absolute inset-0" />
        </div>
        <div className="p-6 md:p-8">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="badge badge-muted">{post.category}</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              <time dateTime={post.createdAt}>{formatPostDate(post.createdAt)}</time>
            </span>
          </p>
          <div className="mt-6 space-y-4 leading-8 whitespace-pre-wrap text-foreground/85">{post.content}</div>
          <Link href="/blog" className="btn btn-outline mt-8">
            بازگشت به یادداشت‌ها
          </Link>
        </div>
      </Card>
    </Page>
  );
}
