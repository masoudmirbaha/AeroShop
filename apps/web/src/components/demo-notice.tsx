import { FlaskConical } from "lucide-react";
import { DEMO_CATALOG_NOTICE } from "@/lib/catalog-demo";

export function DemoNotice({ message = DEMO_CATALOG_NOTICE }: { message?: string }) {
  return (
    <p
      role="status"
      className="mb-6 flex items-start gap-2.5 rounded-lg border border-primary/20 bg-secondary/70 px-4 py-3 text-sm leading-6 text-secondary-foreground"
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

export function ApiErrorNotice({ message }: { message: string }) {
  return (
    <p role="alert" className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      {message}
    </p>
  );
}
