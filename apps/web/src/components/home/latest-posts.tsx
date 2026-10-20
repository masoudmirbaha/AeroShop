import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { ApiErrorNotice } from "@/components/demo-notice";
import { Section } from "@/components/page";
import { SimVisual, visualFor } from "@/components/sim-visual";
import { demoBlogPosts, getDemoBlogPost } from "@/lib/catalog-demo";
import { DEMO_POST_BADGE, demoPosts } from "@/lib/home-demo";
import { demoCatalogEnabled } from "@/lib/demo-mode";
import { formatPostDate, toPost, type Post } from "@/lib/posts";

function PostCard({ post }: { post: Post }) {
  const demoDetail = getDemoBlogPost(post.slug);
  const href = demoCatalogEnabled() && demoDetail ? `/blog/${post.slug}` : `/blog#${post.slug}`;
  const { seed } = visualFor({ slug: post.slug, title: post.title });
  return (
    <article className="surface card-glow group relative flex flex-col overflow-hidden">
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-t-[inherit] bg-(--sim-bg)">
        <SimVisual
          kind={post.visual}
          seed={seed}
          label={false}
          decorative
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy/35 via-transparent to-transparent" />
        <span className="badge absolute start-3 top-3 bg-card/95 text-foreground shadow-sm">{post.category}</span>
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

function DemoPostCard({ title, excerpt, visual, seed, category, slug }: (typeof demoPosts)[number] & { slug?: string }) {
  const href = slug ? `/blog/${slug}` : "/blog";
  return (
    <article className="surface group relative flex flex-col overflow-hidden shadow-[0_1px_2px_0] shadow-navy/5">
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-t-[inherit] bg-(--sim-bg)">
        <SimVisual
          kind={visual}
          seed={seed}
          label={false}
          decorative
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy/35 via-transparent to-transparent" />
        <span className="badge absolute start-3 top-3 bg-card/95 text-foreground shadow-sm">{DEMO_POST_BADGE}</span>
      </div>
      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <p className="text-xs font-medium text-primary/80">{category}</p>
        <h3 className="mt-2 line-clamp-2 min-h-14 text-base leading-7 font-semibold">
          <Link href={href} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50">
            {title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">{excerpt}</p>
        <p className="mt-4 border-t border-border/70 pt-4 text-xs leading-5 text-muted-foreground">محتوای نمایشی برای دموی صفحه اصلی.</p>
      </div>
    </article>
  );
}

function DemoPostGrid() {
  const linked = demoBlogPosts.slice(0, 6).map((post, index) => {
    const legacy = demoPosts[index];
    return {
      id: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      visual: legacy?.visual ?? toPost(post).visual,
      seed: legacy?.seed ?? 200 + index,
      category: post.category,
      slug: post.slug,
    };
  });
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {linked.map((post) => (
        <DemoPostCard key={post.id} {...post} />
      ))}
    </div>
  );
}

export function LatestPosts({ posts, error }: { posts: Post[]; error?: string }) {
  const showDemoOnError = demoCatalogEnabled();

  return (
    <Section title="جدیدترین مطالب" description="مطالب فنی، آموزشی و کاربردی در حوزه شبیه‌سازی و مهندسی">
      {error ? (
        <div className="grid gap-6">
          <ApiErrorNotice message="بارگذاری مطالب انجام نشد. لطفاً بعداً دوباره تلاش کنید." />
          {showDemoOnError ? <DemoPostGrid /> : null}
        </div>
      ) : posts.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <DemoPostGrid />
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
