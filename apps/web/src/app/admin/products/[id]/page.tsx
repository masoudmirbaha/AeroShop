"use client";

import { use } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { ProductFilesPanel } from "@/components/admin/product-files-panel";
import { ProductImagesPanel } from "@/components/admin/product-images-panel";
import { CourseCurriculumPanel } from "@/components/admin/course-curriculum-panel";
import { Notice, useAdminData } from "@/components/admin/admin-client";

type ProductTypeInfo = { type: string };

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = useAdminData<ProductTypeInfo>(`/admin/products/${id}`);
  const isCourse = product.data?.type === "COURSE";

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">{isCourse ? "ویرایش دوره" : "ویرایش محصول"}</h1>
      {!product.data && !product.error ? <Notice text="در حال بارگذاری..." /> : null}
      {product.error ? <Notice text={product.error} /> : null}
      {product.data ? (
        <>
          <ProductForm id={id} onSaved={product.reload} cancelHref={isCourse ? "/admin/courses" : "/admin/products"} />
          <ProductImagesPanel productId={id} />
          <CourseCurriculumPanel productId={id} enabled={isCourse} />
          <ProductFilesPanel productId={id} />
        </>
      ) : null}
    </>
  );
}
