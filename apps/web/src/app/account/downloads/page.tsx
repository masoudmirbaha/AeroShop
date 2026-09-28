"use client";

import { useEffect, useState } from "react";

type Grant = { id: string; filename: string; productTitle: string };

export default function DownloadsPage() {
  const [grants, setGrants] = useState<Grant[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetch("/api/v1/downloads", { credentials: "include" }).then(async (response) => {
        if (response.ok) setGrants(await response.json());
      });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">دانلودها</h1>
      {grants.map((grant) => (
        <a key={grant.id} href={`/api/v1/downloads/${grant.id}`} className="mb-3 block rounded-xl border p-4">
          <p className="font-medium">{grant.productTitle}</p>
          <p className="text-sm text-muted-foreground">{grant.filename}</p>
        </a>
      ))}
    </main>
  );
}
