import { ServiceRequestForm } from "@/components/service-request-form";

export default async function RequestProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  return <ServiceRequestForm serviceSlug={service ?? "project-order"} title="ثبت درخواست پروژه" />;
}
