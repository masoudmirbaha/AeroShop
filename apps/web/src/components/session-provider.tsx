"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN";
};

type SessionStatus = "loading" | "authenticated" | "anonymous";

type SessionContextValue = {
  status: SessionStatus;
  user: SessionUser | null;
  cartCount: number;
  refresh: () => Promise<void>;
  refreshCart: () => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

let pendingRefresh: Promise<boolean> | null = null;

// Parallel 401s share one refresh call so a rotated refresh token is never replayed.
function refreshTokens() {
  pendingRefresh ??= fetch("/api/v1/auth/refresh", { method: "POST", credentials: "include" })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      pendingRefresh = null;
    });
  return pendingRefresh;
}

/** Same-origin API fetch that renews an expired access token once before giving up. */
export async function authFetch(input: string, init: RequestInit = {}) {
  const send = () => fetch(input, { ...init, credentials: "include" });
  const response = await send();
  if (response.status !== 401 || !(await refreshTokens())) return response;
  return send();
}

async function fetchMe() {
  const response = await authFetch("/api/v1/auth/me");
  if (!response.ok) return null;
  const body = (await response.json()) as { user: SessionUser };
  return body.user;
}

async function fetchCartCount() {
  const response = await fetch("/api/v1/cart", { credentials: "include" });
  if (!response.ok) return 0;
  const cart = (await response.json()) as { items: { quantity: number }[] };
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

async function loadSession() {
  const user = await fetchMe().catch(() => null);
  const cartCount = user ? await fetchCartCount().catch(() => 0) : 0;
  return { user, cartCount };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    setCartCount(await fetchCartCount().catch(() => 0));
  }, []);

  const apply = useCallback((session: Awaited<ReturnType<typeof loadSession>>) => {
    setUser(session.user);
    setStatus(session.user ? "authenticated" : "anonymous");
    setCartCount(session.cartCount);
  }, []);

  const refresh = useCallback(async () => {
    apply(await loadSession());
  }, [apply]);

  const logout = useCallback(async () => {
    await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    setUser(null);
    setStatus("anonymous");
    setCartCount(0);
    router.push("/");
    router.refresh();
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    loadSession().then((session) => {
      if (!cancelled) apply(session);
    });
    return () => {
      cancelled = true;
    };
  }, [apply]);

  const value = useMemo(
    () => ({ status, user, cartCount, refresh, refreshCart, logout }),
    [status, user, cartCount, refresh, refreshCart, logout],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  return context;
}

/**
 * Guards a signed-in page: anonymous visitors go to /login. Logging out from the page is left to
 * `logout`, which navigates home. Call `expired` when an API request still returns 401.
 */
export function useRequireAuth() {
  const router = useRouter();
  const session = useSession();
  const { status, refresh } = session;
  const signedIn = useRef(false);

  useEffect(() => {
    if (status === "authenticated") signedIn.current = true;
    else if (status === "anonymous" && !signedIn.current) router.replace("/login");
  }, [status, router]);

  const expired = useCallback(() => {
    router.replace("/login");
    void refresh();
  }, [router, refresh]);

  return { ...session, expired };
}
