"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddToCart({ productId }: { productId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function add() {
    const response = await fetch("/api/v1/cart/items", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    if (response.status === 401) {
      router.push("/login");
      return;
    }
    setMessage(response.ok ? "به سبد اضافه شد." : "افزودن به سبد انجام نشد.");
  }

  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={add} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
        افزودن به سبد
      </button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
