import { ArrowLeft, CalendarDays, NotebookPen } from "lucide-react";
import Link from "next/link";
import { Section } from "@/components/page";
import { SimVisual, visualFor } from "@/components/sim-visual";
import { formatPostDate, type Post } from "@/lib/posts";

function PostCard({ post }: { post: Post }) {
  const href = `/blog#${post.slug}`;
  return (
    <article className="surface card-glow group relative flex flex-col overflow-hidden">
      <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-t-[inherit] md:h-48">
        <SimVisual kind={post.visual} seed={visualFor({ slug: post.slug, title: post.title }).seed} label={false} className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy/35 via-transparent to-transparent" />
        <span className="badge absolute start-3 top-3 bg-card/90 text-foreground shadow-sm backdrop-blur">{post.category}</span>
      </div>
      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          <time dateTime={post.createdAt}>{formatPostDate(post.createdAt)}</time>
        </p>
        <h3 className="mt-2 line-clamp-2 min-h-14 text-base leading-7 font-semibold transition-colors group-hover:text-primary">
          <Link href={href} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 border-t border-border/70 pt-4 text-sm font-medium text-primary/90">
          ادامه مطلب
          <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

export function LatestPosts({ posts }: { posts: Post[] }) {
  return (
    <Section title="جدیدترین مطالب" description="مطالب فنی، آموزشی و کاربردی در حوزه شبیه‌سازی و مهندسی">
      {posts.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="surface flex flex-col items-center px-6 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary ring-1 ring-primary/10 ring-inset">
            <NotebookPen className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-4 font-semibold">هنوز مطلبی منتشر نشده است</p>
          <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">نخستین مطالب فنی AeroShop به‌زودی در همین بخش قرار می‌گیرند.</p>
        </div>
      )}
      <div className="mt-8 flex justify-center">
        <Link href="/blog" className="btn btn-outline">
          مشاهده همه مطالب
          <ArrowLeft aria-hidden="true" />
        </Link>
      </div>
    </Section>
  );
}
