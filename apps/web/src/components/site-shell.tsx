import Link from "next/link";
import { APP_NAME } from "@aeroshop/shared";

const links = [
  ["محصولات", "/products"],
  ["خدمات", "/services"],
  ["درباره ما", "/about"],
  ["پرسش‌ها", "/faq"],
  ["تماس", "/contact"],
];

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          {APP_NAME}
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="text-muted-foreground hover:text-foreground">
              {label}
            </Link>
          ))}
          <Link href="/cart" className="font-medium">
            سبد
          </Link>
          <Link href="/login" className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground">
            ورود
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground">
        <p>AeroShop — آموزش و خدمات شبیه‌سازی جریان برای مهندسان.</p>
        <p>محصولات دیجیتال هستند و ارسال پستی ندارند.</p>
      </div>
    </footer>
  );
}
