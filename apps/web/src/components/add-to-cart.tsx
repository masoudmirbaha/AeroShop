"use client";

import { CheckCircle2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";

export function AddToCart({ productId }: { productId: string }) {
  const router = useRouter();
  const { refreshCart } = useSession();
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function add() {
    setPending(true);
    const response = await fetch("/api/v1/cart/items", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    setPending(false);
    if (response.status === 401) {
      router.push("/login");
      return;
    }
    setOk(response.ok);
    setMessage(response.ok ? "به سبد اضافه شد." : "افزودن به سبد انجام نشد.");
    if (response.ok) await refreshCart();
  }

  return (
    <div className="grid gap-2">
      <button type="button" onClick={add} disabled={pending} className="btn btn-primary btn-lg w-full">
        <ShoppingCart aria-hidden="true" />
        افزودن به سبد
      </button>
      {message ? (
        <p role="status" className={`flex items-center justify-center gap-1.5 text-sm ${ok ? "text-accent-foreground" : "text-destructive"}`}>
          {ok ? <CheckCircle2 className="size-4" aria-hidden="true" /> : null}
          {message}
        </p>
      ) : null}
    </div>
  );
}
