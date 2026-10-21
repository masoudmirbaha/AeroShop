"use client";

import { useState } from "react";
import { AdminError, adminFetch, inputClass, Notice, primaryButton, sendJson, useAdminData } from "@/components/admin/admin-client";

type Lesson = {
  id: string;
  sectionId: string;
  title: string;
  sortOrder: number;
  durationMinutes: number | null;
};

type Section = {
  id: string;
  productId: string;
  title: string;
  sortOrder: number;
  lessons: Lesson[];
};

export function CourseCurriculumPanel({ productId, enabled }: { productId: string; enabled: boolean }) {
  const { data, error, reload } = useAdminData<Section[]>(enabled ? `/admin/products/${productId}/sections` : null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [lessonDrafts, setLessonDrafts] = useState<Record<string, { title: string; duration: string }>>({});

  if (!enabled) {
    return (
      <section className="mt-10 max-w-2xl border-t pt-8">
        <h2 className="mb-2 text-xl font-bold">سرفصل‌ها و درس‌ها</h2>
        <p className="text-sm text-muted-foreground">برای مدیریت سرفصل، نوع محصول را روی «دوره» بگذارید و ذخیره کنید.</p>
      </section>
    );
  }

  async function run(action: () => Promise<unknown>, done: string) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await action();
      setMessage(done);
      reload();
    } catch (reason) {
      setMessage(reason instanceof AdminError ? reason.message : "انجام نشد.");
    } finally {
      setBusy(false);
    }
  }

  function draft(sectionId: string) {
    return lessonDrafts[sectionId] ?? { title: "", duration: "" };
  }

  async function addSection() {
    const title = sectionTitle.trim();
    if (title.length < 2) {
      setMessage("عنوان سرفصل باید حداقل ۲ نویسه باشد.");
      return;
    }
    await run(() => adminFetch(`/admin/products/${productId}/sections`, sendJson("POST", { title })), "سرفصل اضافه شد.");
    setSectionTitle("");
  }

  async function renameSection(section: Section, title: string) {
    const next = title.trim();
    if (next.length < 2 || next === section.title) return;
    await run(
      () => adminFetch(`/admin/products/${productId}/sections/${section.id}`, sendJson("PATCH", { title: next })),
      "سرفصل به‌روز شد.",
    );
  }

  async function moveSection(sectionId: string, direction: -1 | 1) {
    if (!data?.length) return;
    const index = data.findIndex((item) => item.id === sectionId);
    const swapWith = index + direction;
    if (index < 0 || swapWith < 0 || swapWith >= data.length) return;
    const next = data.map((item) => item.id);
    const temp = next[index]!;
    next[index] = next[swapWith]!;
    next[swapWith] = temp;
    const payload = next.map((id, sortOrder) => ({ id, sortOrder }));
    await run(
      () => adminFetch(`/admin/products/${productId}/sections/order`, sendJson("PATCH", payload)),
      "ترتیب سرفصل‌ها به‌روز شد.",
    );
  }

  async function addLesson(sectionId: string) {
    const { title, duration } = draft(sectionId);
    const trimmed = title.trim();
    if (trimmed.length < 2) {
      setMessage("عنوان درس باید حداقل ۲ نویسه باشد.");
      return;
    }
    const durationMinutes = duration.trim() === "" ? null : Number(duration);
    if (durationMinutes !== null && (!Number.isInteger(durationMinutes) || durationMinutes < 0)) {
      setMessage("مدت درس باید عدد صحیح صفر یا بیشتر باشد.");
      return;
    }
    await run(
      () =>
        adminFetch(
          `/admin/products/${productId}/sections/${sectionId}/lessons`,
          sendJson("POST", { title: trimmed, durationMinutes }),
        ),
      "درس اضافه شد.",
    );
    setLessonDrafts((prev) => ({ ...prev, [sectionId]: { title: "", duration: "" } }));
  }

  async function renameLesson(sectionId: string, lesson: Lesson, title: string) {
    const next = title.trim();
    if (next.length < 2 || next === lesson.title) return;
    await run(
      () =>
        adminFetch(
          `/admin/products/${productId}/sections/${sectionId}/lessons/${lesson.id}`,
          sendJson("PATCH", { title: next }),
        ),
      "درس به‌روز شد.",
    );
  }

  async function moveLesson(section: Section, lessonId: string, direction: -1 | 1) {
    const index = section.lessons.findIndex((item) => item.id === lessonId);
    const swapWith = index + direction;
    if (index < 0 || swapWith < 0 || swapWith >= section.lessons.length) return;
    const next = section.lessons.map((item) => item.id);
    const temp = next[index]!;
    next[index] = next[swapWith]!;
    next[swapWith] = temp;
    const payload = next.map((id, sortOrder) => ({ id, sortOrder }));
    await run(
      () =>
        adminFetch(
          `/admin/products/${productId}/sections/${section.id}/lessons/order`,
          sendJson("PATCH", payload),
        ),
      "ترتیب درس‌ها به‌روز شد.",
    );
  }

  if (!data && !error) {
    return <Notice text="در حال بارگذاری سرفصل‌ها..." />;
  }

  return (
    <section className="mt-10 max-w-2xl border-t pt-8">
      <h2 className="mb-4 text-xl font-bold">سرفصل‌ها و درس‌ها</h2>
      <Notice text={message || error} />

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="grid min-w-[14rem] flex-1 gap-1 text-sm">
          سرفصل جدید
          <input
            value={sectionTitle}
            onChange={(event) => setSectionTitle(event.target.value)}
            maxLength={160}
            disabled={busy}
            className={inputClass}
            placeholder="مثلاً فصل ۱ — مقدمه"
          />
        </label>
        <button type="button" disabled={busy} onClick={() => void addSection()} className={primaryButton}>
          افزودن سرفصل
        </button>
      </div>

      {!data?.length ? (
        <p className="text-sm text-muted-foreground">هنوز سرفصلی برای این دوره ثبت نشده است.</p>
      ) : (
        <ul className="grid gap-4">
          {data.map((section, sectionIndex) => {
            const lessonForm = draft(section.id);
            return (
              <li key={section.id} className="rounded-lg border border-border/80 p-4">
                <div className="mb-3 flex flex-wrap items-start gap-2">
                  <input
                    key={`${section.id}:${section.title}`}
                    defaultValue={section.title}
                    disabled={busy}
                    maxLength={160}
                    className={`${inputClass} min-w-[12rem] flex-1 font-medium`}
                    onBlur={(event) => void renameSection(section, event.target.value)}
                    aria-label="عنوان سرفصل"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy || sectionIndex === 0}
                      className="rounded-md border px-2 py-1 text-xs"
                      onClick={() => void moveSection(section.id, -1)}
                    >
                      بالا
                    </button>
                    <button
                      type="button"
                      disabled={busy || sectionIndex === data.length - 1}
                      className="rounded-md border px-2 py-1 text-xs"
                      onClick={() => void moveSection(section.id, 1)}
                    >
                      پایین
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      className="rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive"
                      onClick={() => {
                        if (confirm(`سرفصل «${section.title}» و درس‌هایش حذف شوند؟`)) {
                          void run(
                            () => adminFetch(`/admin/products/${productId}/sections/${section.id}`, { method: "DELETE" }),
                            "سرفصل حذف شد.",
                          );
                        }
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </div>

                <ul className="mb-3 grid gap-2">
                  {section.lessons.map((lesson, lessonIndex) => (
                    <li key={lesson.id} className="flex flex-wrap items-center gap-2 rounded-md bg-muted/40 px-2 py-2">
                      <input
                        key={`${lesson.id}:${lesson.title}`}
                        defaultValue={lesson.title}
                        disabled={busy}
                        maxLength={160}
                        className={`${inputClass} min-w-[10rem] flex-1`}
                        onBlur={(event) => void renameLesson(section.id, lesson, event.target.value)}
                        aria-label="عنوان درس"
                      />
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {lesson.durationMinutes != null ? `${lesson.durationMinutes} دقیقه` : "بدون مدت"}
                      </span>
                      <button
                        type="button"
                        disabled={busy || lessonIndex === 0}
                        className="rounded-md border px-2 py-1 text-xs"
                        onClick={() => void moveLesson(section, lesson.id, -1)}
                      >
                        بالا
                      </button>
                      <button
                        type="button"
                        disabled={busy || lessonIndex === section.lessons.length - 1}
                        className="rounded-md border px-2 py-1 text-xs"
                        onClick={() => void moveLesson(section, lesson.id, 1)}
                      >
                        پایین
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        className="text-xs text-destructive underline"
                        onClick={() => {
                          if (confirm(`درس «${lesson.title}» حذف شود؟`)) {
                            void run(
                              () =>
                                adminFetch(
                                  `/admin/products/${productId}/sections/${section.id}/lessons/${lesson.id}`,
                                  { method: "DELETE" },
                                ),
                              "درس حذف شد.",
                            );
                          }
                        }}
                      >
                        حذف
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-end gap-2">
                  <label className="grid min-w-[10rem] flex-1 gap-1 text-xs">
                    درس جدید
                    <input
                      value={lessonForm.title}
                      disabled={busy}
                      maxLength={160}
                      className={inputClass}
                      onChange={(event) =>
                        setLessonDrafts((prev) => ({
                          ...prev,
                          [section.id]: { ...draft(section.id), title: event.target.value },
                        }))
                      }
                    />
                  </label>
                  <label className="grid w-28 gap-1 text-xs">
                    مدت (دقیقه)
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={lessonForm.duration}
                      disabled={busy}
                      className={inputClass}
                      onChange={(event) =>
                        setLessonDrafts((prev) => ({
                          ...prev,
                          [section.id]: { ...draft(section.id), duration: event.target.value },
                        }))
                      }
                    />
                  </label>
                  <button type="button" disabled={busy} className="rounded-md border px-3 py-2 text-sm" onClick={() => void addLesson(section.id)}>
                    افزودن درس
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
