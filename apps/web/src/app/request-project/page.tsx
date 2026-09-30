import type { Metadata } from "next";
import { ServiceRequestForm } from "@/components/service-request-form";

export const metadata: Metadata = {
  title: "ثبت درخواست پروژه",
  description: "درخواست انجام پروژه شبیه‌سازی CFD و CAE را ثبت کنید و وضعیت آن را از حساب کاربری پیگیری کنید.",
};

export default async function RequestProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  return <ServiceRequestForm serviceSlug={service ?? "project-order"} title="ثبت درخواست پروژه" />;
}
