import { APP_NAME } from "@aeroshop/shared";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">{APP_NAME}</h1>
      <p className="text-muted-foreground">
        محصولات آموزشی دیجیتال و خدمات مهندسی CFD — به‌زودی
      </p>
    </main>
  );
}
