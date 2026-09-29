"use client";

import { Menu } from "@base-ui/react/menu";
import { ChevronDown, Download, LayoutDashboard, LogOut, Menu as MenuIcon, Package, Search, ShoppingCart, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { useSession, type SessionUser } from "@/components/session-provider";

const focusRing = "outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

const navItems = [
  { label: "محصولات", href: "/products", match: ["/products", "/categories"] },
  { label: "دوره‌ها", href: "/courses", match: ["/courses"] },
  { label: "خدمات", href: "/services", match: ["/services", "/request-project", "/consultation"] },
  { label: "درباره ما", href: "/about", match: ["/about"] },
  { label: "پرسش‌ها", href: "/faq", match: ["/faq"] },
  { label: "تماس", href: "/contact", match: ["/contact"] },
];

const accountLinks: { label: string; href: string; icon: ComponentType<{ className?: string }>; adminOnly?: boolean }[] = [
  { label: "مدیریت", href: "/admin", icon: LayoutDashboard, adminOnly: true },
  { label: "حساب کاربری", href: "/account", icon: UserRound },
  { label: "سفارش‌های من", href: "/account/orders", icon: Package },
  { label: "دانلودهای من", href: "/account/downloads", icon: Download },
];

function isActive(pathname: string, match: string[]) {
  return match.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function displayName(user: SessionUser) {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name || user.email;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen && !searchOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, searchOpen]);

  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const onScroll = () => {
      header.dataset.scrolled = window.scrollY > 4 ? "true" : "false";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className="group/header sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md transition-shadow duration-300 supports-[backdrop-filter]:bg-background/70 data-[scrolled=true]:shadow-[0_4px_20px_-12px] data-[scrolled=true]:shadow-navy/15"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-linear-to-l from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-data-[scrolled=true]/header:opacity-100"
      />
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Logo />

        <DesktopNav pathname={pathname} />

        <div className="ms-auto flex items-center gap-1 lg:ms-0">
          <SearchForm className="hidden w-52 xl:block" />
          <button
            type="button"
            aria-label="جستجو"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((open) => !open)}
            className={`hidden size-9 place-items-center rounded-lg text-foreground/70 transition-colors hover:bg-muted hover:text-foreground lg:grid xl:hidden ${focusRing}`}
          >
            <Search className="size-5" />
          </button>
          <span aria-hidden="true" className="mx-1.5 hidden h-5 w-px bg-border lg:block" />
          <CartLink active={isActive(pathname, ["/cart", "/checkout"])} />
          <UserArea />
          <button
            type="button"
            aria-label={mobileOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
            className={`grid size-9 place-items-center rounded-lg text-foreground/80 transition-colors hover:bg-muted lg:hidden ${focusRing}`}
          >
            {mobileOpen ? <X className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div className="hidden border-t lg:block xl:hidden">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <SearchForm autoFocus onDone={() => setSearchOpen(false)} />
          </div>
        </div>
      ) : null}

      {mobileOpen ? <MobileMenu pathname={pathname} onClose={() => setMobileOpen(false)} /> : null}
    </header>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const activeIndex = navItems.findIndex((item) => isActive(pathname, item.match));

  useLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;

    const place = () => {
      const link = activeIndex >= 0 ? nav.querySelectorAll<HTMLElement>("[data-nav-link]")[activeIndex] : undefined;
      if (!link || link.offsetWidth === 0) {
        indicator.style.opacity = "0";
        if (link) delete indicator.dataset.ready;
        return;
      }
      const inset = parseFloat(getComputedStyle(link).paddingLeft) || 0;
      // Jump into place on first paint; slide only between later positions.
      const firstPlacement = indicator.dataset.ready !== "true";
      if (firstPlacement) indicator.style.transition = "none";
      indicator.style.width = `${link.offsetWidth - inset * 2}px`;
      indicator.style.transform = `translateX(${link.offsetLeft + inset}px)`;
      indicator.style.opacity = "1";
      if (firstPlacement) {
        void indicator.offsetWidth;
        indicator.style.transition = "";
        indicator.dataset.ready = "true";
      }
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [activeIndex]);

  return (
    <nav ref={navRef} aria-label="منوی اصلی" className="relative mx-auto hidden h-full items-center gap-0.5 lg:flex xl:gap-1.5">
      {navItems.map((item, index) => {
        const active = index === activeIndex;
        return (
          <Link
            key={item.href}
            href={item.href}
            data-nav-link
            aria-current={active ? "page" : undefined}
            className={`relative whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium tracking-tight xl:px-3 transition-colors duration-200 ${focusRing} ${
              active ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-linear-to-l from-primary to-brand-cyan opacity-0 shadow-[0_0_8px] shadow-primary/40 transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      />
    </nav>
  );
}

export function Logo() {
  return (
    <Link href="/" aria-label="AeroShop، صفحه اصلی" className={`flex shrink-0 items-center gap-2.5 rounded-lg ${focusRing}`}>
      <span className="grid size-9 place-items-center rounded-lg bg-linear-to-br from-navy to-primary shadow-sm">
        <svg viewBox="0 0 32 32" className="size-6" aria-hidden="true">
          <path d="M5 11.5c7-3.2 15-3.2 22 0" fill="none" stroke="var(--brand-cyan)" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 18.5c4.5-5 12.5-6.8 24-3.3-9.5.4-17 1.7-24 3.3z" fill="white" />
          <path d="M5 23.5c7 1.8 15 1.4 22-1.6" fill="none" stroke="var(--brand-cyan)" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
        </svg>
      </span>
      <span dir="ltr" className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight text-foreground">
          Aero<span className="text-primary">Shop</span>
        </span>
        <span className="mt-1 hidden text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase sm:block">
          Engineering &amp; Simulation
        </span>
      </span>
    </Link>
  );
}

function SearchForm({ className = "", autoFocus, onDone }: { className?: string; autoFocus?: boolean; onDone?: () => void }) {
  const router = useRouter();
  return (
    <form
      role="search"
      className={`relative ${className}`}
      action={(formData) => {
        const q = String(formData.get("q") ?? "").trim();
        router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
        onDone?.();
      }}
    >
      <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        name="q"
        type="search"
        autoFocus={autoFocus}
        placeholder="جستجوی محصول و دوره…"
        aria-label="جستجوی محصولات"
        className="h-9 w-full rounded-lg border border-input bg-muted/60 ps-9 pe-3 text-sm transition-colors placeholder:text-muted-foreground hover:bg-muted focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
      />
    </form>
  );
}

function CartLink({ active }: { active: boolean }) {
  const { cartCount } = useSession();
  return (
    <Link
      href="/cart"
      aria-label={cartCount ? `سبد خرید، ${cartCount} کالا` : "سبد خرید"}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium transition-colors md:px-2.5 ${focusRing} ${
        active ? "bg-secondary text-primary" : "text-foreground/70 hover:bg-muted hover:text-foreground"
      }`}
    >
      <ShoppingCart className="size-5" aria-hidden="true" />
      <span className="hidden md:inline">سبد</span>
      {cartCount > 0 ? (
        <span
          data-testid="cart-count"
          className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground tabular-nums ring-2 ring-background md:static md:ring-0"
        >
          {cartCount.toLocaleString("fa-IR")}
        </span>
      ) : null}
    </Link>
  );
}

function Avatar({ user, size = "size-8" }: { user: SessionUser; size?: string }) {
  const initial = (user.firstName || user.email).trim().charAt(0).toUpperCase();
  return (
    <span aria-hidden="true" className={`grid ${size} shrink-0 place-items-center rounded-full bg-linear-to-br from-primary to-brand-cyan text-sm font-semibold text-primary-foreground`}>
      {initial}
    </span>
  );
}

function UserArea() {
  const { status, user } = useSession();
  if (status === "loading") return <span aria-hidden="true" className="size-9 animate-pulse rounded-full bg-muted" />;
  if (!user) {
    return (
      <>
        <Link href="/login" className={`hidden h-9 items-center rounded-lg px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground sm:inline-flex ${focusRing}`}>
          ورود
        </Link>
        <Link href="/register" className={`hidden h-9 items-center rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex ${focusRing}`}>
          ثبت‌نام
        </Link>
        <Link href="/login" aria-label="ورود" className={`grid size-9 place-items-center rounded-lg text-foreground/80 transition-colors hover:bg-muted sm:hidden ${focusRing}`}>
          <UserRound className="size-5" />
        </Link>
      </>
    );
  }
  return <UserMenu user={user} />;
}

const menuItemClass =
  "group/item flex w-full cursor-default items-center gap-3 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground/85 outline-none select-none transition-colors duration-150 data-[highlighted]:bg-secondary/80 data-[highlighted]:text-primary";
const menuIconClass =
  "grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border/70 transition-colors duration-150 ring-inset group-data-[highlighted]/item:bg-card group-data-[highlighted]/item:text-primary group-data-[highlighted]/item:ring-primary/15";

function UserMenu({ user }: { user: SessionUser }) {
  const { logout } = useSession();
  const isAdmin = user.role === "ADMIN";
  const personal = accountLinks.filter((link) => !link.adminOnly);
  const admin = isAdmin ? accountLinks.filter((link) => link.adminOnly) : [];
  const renderLink = ({ label, href, icon: Icon }: (typeof accountLinks)[number]) => (
    <Menu.LinkItem key={href} closeOnClick render={<Link href={href} />} className={menuItemClass}>
      <span className={menuIconClass}>
        <Icon className="size-4" />
      </span>
      {label}
    </Menu.LinkItem>
  );

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="منوی حساب کاربری"
        className={`inline-flex h-9 items-center gap-2 rounded-full border border-transparent ps-0.5 pe-0.5 transition-colors hover:border-border hover:bg-muted/70 data-[popup-open]:border-border data-[popup-open]:bg-muted/70 md:pe-2.5 ${focusRing}`}
      >
        <Avatar user={user} />
        <span className="hidden max-w-32 truncate text-sm font-medium md:inline">{displayName(user)}</span>
        <ChevronDown
          className="hidden size-4 text-muted-foreground transition-transform duration-200 in-data-[popup-open]:rotate-180 md:block"
          aria-hidden="true"
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={10} collisionPadding={12} className="z-50 outline-none">
          <Menu.Popup className="w-[min(18rem,calc(100vw-1.5rem))] origin-[var(--transform-origin)] overflow-hidden rounded-2xl border border-border/80 bg-popover text-popover-foreground shadow-[0_16px_40px_-18px] shadow-navy/25 outline-none transition-[opacity,scale,translate] duration-150 ease-out data-[ending-style]:-translate-y-1 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:-translate-y-1 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 motion-reduce:transition-none">
            <div className="relative flex items-center gap-3 border-b border-border/70 bg-linear-to-b from-secondary/70 to-transparent px-4 py-4">
              <Avatar user={user} size="size-11" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{displayName(user)}</p>
                  {isAdmin ? <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground ring-1 ring-accent-foreground/15 ring-inset">مدیر سایت</span> : null}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground" dir="ltr">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="p-1.5">
              <Menu.Group>{personal.map(renderLink)}</Menu.Group>
              {admin.length ? (
                <>
                  <Menu.Separator className="mx-2 my-1.5 h-px bg-border/70" />
                  <Menu.Group>
                    <Menu.GroupLabel className="px-2 pt-1 pb-1.5 text-[11px] font-medium text-muted-foreground">مدیریت سایت</Menu.GroupLabel>
                    {admin.map(renderLink)}
                  </Menu.Group>
                </>
              ) : null}
              <Menu.Separator className="mx-2 my-1.5 h-px bg-border/70" />
              <Menu.Item
                onClick={() => void logout()}
                className={`${menuItemClass} text-destructive data-[highlighted]:bg-destructive/8 data-[highlighted]:text-destructive`}
              >
                <span className={`${menuIconClass} bg-destructive/8 text-destructive ring-destructive/10 group-data-[highlighted]/item:bg-card group-data-[highlighted]/item:text-destructive group-data-[highlighted]/item:ring-destructive/20`}>
                  <LogOut className="size-4" />
                </span>
                خروج
              </Menu.Item>
            </div>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const { user, logout } = useSession();
  const links = user ? accountLinks.filter((link) => !link.adminOnly || user.role === "ADMIN") : [];
  const linkClass = `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${focusRing}`;

  return (
    <div id="mobile-nav" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t bg-background lg:hidden">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4">
        <SearchForm onDone={onClose} />
        <nav aria-label="منوی موبایل" className="grid gap-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`${linkClass} relative ${
                  active
                    ? "bg-secondary text-primary before:absolute before:inset-y-2 before:start-0 before:w-0.5 before:rounded-full before:bg-primary"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t pt-4">
          {user ? (
            <div className="grid gap-1">
              <div className="flex items-center gap-3 px-3 pb-2">
                <Avatar user={user} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{displayName(user)}</p>
                  <p className="truncate text-xs text-muted-foreground" dir="ltr">
                    {user.email}
                  </p>
                </div>
              </div>
              {links.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} onClick={onClose} className={`${linkClass} text-foreground/80 hover:bg-muted`}>
                  <Icon className="size-4 text-muted-foreground" />
                  {label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  void logout();
                }}
                className={`${linkClass} text-destructive hover:bg-destructive/10`}
              >
                <LogOut className="size-4" />
                خروج
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" onClick={onClose} className={`inline-flex h-10 items-center justify-center rounded-lg border text-sm font-medium hover:bg-muted ${focusRing}`}>
                ورود
              </Link>
              <Link href="/register" onClick={onClose} className={`inline-flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 ${focusRing}`}>
                ثبت‌نام
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
