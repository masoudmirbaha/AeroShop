import type { Metadata } from "next";
import { ServiceRequestForm } from "@/components/service-request-form";

export const metadata: Metadata = {
  title: "درخواست مشاوره رایگان",
  description: "پیش از خرید یا سفارش پروژه، مسئله‌ی شبیه‌سازی خود را با یک مهندس مرور کنید.",
};

export default function ConsultationPage() {
  return <ServiceRequestForm serviceSlug="free-consultation" title="درخواست مشاوره رایگان" />;
}
