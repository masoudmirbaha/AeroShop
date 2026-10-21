"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductForm } from "@/components/admin/product-form";

function NewProductForm() {
  const search = useSearchParams();
  const type = search.get("type");
  const defaultType = type === "COURSE" || type === "BUNDLE" || type === "FREE" || type === "SINGLE_PRODUCT" ? type : undefined;
  const isCourse = defaultType === "COURSE";

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">{isCourse ? "دوره جدید" : "محصول جدید"}</h1>
      <ProductForm defaultType={defaultType} cancelHref={isCourse ? "/admin/courses" : "/admin/products"} />
    </>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">در حال بارگذاری...</p>}>
      <NewProductForm />
    </Suspense>
  );
}
