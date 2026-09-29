import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">ویرایش محصول</h1>
      <ProductForm id={id} />
    </>
  );
}
