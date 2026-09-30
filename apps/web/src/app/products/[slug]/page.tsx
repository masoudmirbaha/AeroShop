import { ProductDetail, productMetadata } from "@/components/product-detail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return productMetadata((await params).slug);
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetail slug={slug} section="products" />;
}
