import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Save, MoveUp, MoveDown, Eye, CheckCircle2, Plus, Trash2 } from "lucide-react";
import {
  getHomepageSections,
  updateHomepageSection,
  reorderHomepageSections,
} from "@/lib/services/firebase/homepageService";
import type { HomepageSection, HeroSlide } from "@/lib/types";

export const Route = createFileRoute("/admin/homepage/")({
  component: AdminHomepageEditorPage,
});

function AdminHomepageEditorPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getHomepageSections();
    // Sort by order just in case
    setSections(data.sort((a, b) => a.order - b.order));
    setLoading(false);
  }

  const handleToggleActive = (id: string, current: boolean) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, active: !current } : s)));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const copy = [...sections];
    const temp = copy[index]!;
    copy[index] = copy[targetIdx]!;
    copy[targetIdx] = temp;

    // re-assign orders
    copy.forEach((item, idx) => {
      item.order = idx;
    });
    setSections(copy);
  };

  const handleContentChange = (id: string, fieldKey: string, val: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content: { ...s.content, [fieldKey]: val } } : s)),
    );
  };

  const handleSlideChange = (
    sectionId: string,
    slideIndex: number,
    fieldKey: string,
    val: string,
  ) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const slides = [...((s.content["slides"] as any[]) || [])];
        if (slides[slideIndex]) {
          slides[slideIndex] = { ...slides[slideIndex], [fieldKey]: val };
        }
        return { ...s, content: { ...s.content, slides } };
      }),
    );
  };

  const handleAddSlide = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const slides = [...((s.content["slides"] as any[]) || [])];
        slides.push({
          id: `slide_${Date.now()}`,
          image: "",
          headingAr: "شريحة جديدة",
          headingEn: "New Slide",
          descriptionAr: "",
          descriptionEn: "",
          buttonTextAr: "تسوق",
          buttonTextEn: "Shop",
          buttonLink: "/ar/collections",
        });
        return { ...s, content: { ...s.content, slides } };
      }),
    );
  };

  const handleRemoveSlide = (sectionId: string, slideIndex: number) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const slides = [...((s.content["slides"] as any[]) || [])];
        slides.splice(slideIndex, 1);
        return { ...s, content: { ...s.content, slides } };
      }),
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    for (const sec of sections) {
      await updateHomepageSection(sec.id, {
        active: sec.active,
        order: sec.order,
        content: sec.content,
      });
    }
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6 text-foreground dir-rtl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">إدارة محتوى الصفحة الرئيسية (CMS)</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            التحكم في ترتيب الأقسام والنصوص والصور الترويجية بدون تعديل الكود
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center space-x-1.5 space-x-reverse rounded-xl bg-brand px-5 py-2 text-xs font-bold text-brand-foreground hover:bg-brand-hover transition-colors shadow-xs disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
        </button>
      </div>

      {savedMsg && (
        <div className="flex items-center space-x-2 space-x-reverse rounded-xl bg-success/15 p-3 text-xs font-bold text-success font-medium">
          <CheckCircle2 className="h-4 w-4" />
          <span>تم حفظ ترتيب وتفاصيل أقسام الصفحة الرئيسية بنجاح.</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          جاري تحميل أقسام الصفحة الرئيسية...
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`rounded-2xl border bg-card p-6 shadow-xs transition-all space-y-4 ${
                sec.active ? "border-border" : "border-border/40 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10 text-brand font-bold text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-foreground uppercase">{sec.id}</h3>
                    <p className="text-[11px] text-muted-foreground">نوع القسم: {sec.type}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleToggleActive(sec.id, sec.active)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                      sec.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {sec.active ? "قسم مفعل" : "قسم معطل"}
                  </button>

                  <button
                    onClick={() => handleMove(idx, "up")}
                    disabled={idx === 0}
                    className="rounded-lg border border-input p-1.5 hover:bg-accent disabled:opacity-30"
                  >
                    <MoveUp className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleMove(idx, "down")}
                    disabled={idx === sections.length - 1}
                    className="rounded-lg border border-input p-1.5 hover:bg-accent disabled:opacity-30"
                  >
                    <MoveDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Editable Fields based on section */}
              {sec.id === "announcement_bar" && (
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="font-bold block mb-1">نص الشريط (عربي)</label>
                    <input
                      type="text"
                      value={(sec.content["textAr"] as string) || ""}
                      onChange={(e) => handleContentChange(sec.id, "textAr", e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">نص الشريط (إنجليزي)</label>
                    <input
                      type="text"
                      value={(sec.content["textEn"] as string) || ""}
                      onChange={(e) => handleContentChange(sec.id, "textEn", e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 dir-ltr"
                    />
                  </div>
                </div>
              )}

              {sec.id === "hero" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">شرائح العرض (Slides)</h4>
                    <button
                      onClick={() => handleAddSlide(sec.id)}
                      className="inline-flex items-center space-x-1.5 space-x-reverse rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand/20 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>إضافة شريحة</span>
                    </button>
                  </div>

                  {((sec.content["slides"] as HeroSlide[]) || []).map((slide, sIdx) => (
                    <div
                      key={slide.id || sIdx}
                      className="p-4 border border-input rounded-xl bg-background space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-input pb-2">
                        <span className="font-bold text-xs">شريحة #{sIdx + 1}</span>
                        <button
                          onClick={() => handleRemoveSlide(sec.id, sIdx)}
                          className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 text-xs">
                        <div className="sm:col-span-2">
                          <label className="font-bold block mb-1">رابط الصورة (Image URL)</label>
                          <input
                            type="text"
                            value={slide.image || ""}
                            onChange={(e) =>
                              handleSlideChange(sec.id, sIdx, "image", e.target.value)
                            }
                            className="w-full rounded-xl border border-input bg-background px-3 py-2 dir-ltr"
                          />
                        </div>
                        <div>
                          <label className="font-bold block mb-1">العنوان الرئيسي (Ar)</label>
                          <input
                            type="text"
                            value={slide.headingAr || ""}
                            onChange={(e) =>
                              handleSlideChange(sec.id, sIdx, "headingAr", e.target.value)
                            }
                            className="w-full rounded-xl border border-input bg-background px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="font-bold block mb-1">العنوان الرئيسي (En)</label>
                          <input
                            type="text"
                            value={slide.headingEn || ""}
                            onChange={(e) =>
                              handleSlideChange(sec.id, sIdx, "headingEn", e.target.value)
                            }
                            className="w-full rounded-xl border border-input bg-background px-3 py-2 dir-ltr"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="font-bold block mb-1">الوصف الفرعي (Ar)</label>
                          <textarea
                            rows={2}
                            value={slide.descriptionAr || ""}
                            onChange={(e) =>
                              handleSlideChange(sec.id, sIdx, "descriptionAr", e.target.value)
                            }
                            className="w-full rounded-xl border border-input bg-background p-2.5"
                          />
                        </div>
                        <div>
                          <label className="font-bold block mb-1">نص الزر (Ar)</label>
                          <input
                            type="text"
                            value={slide.buttonTextAr || ""}
                            onChange={(e) =>
                              handleSlideChange(sec.id, sIdx, "buttonTextAr", e.target.value)
                            }
                            className="w-full rounded-xl border border-input bg-background px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="font-bold block mb-1">رابط الزر (Link)</label>
                          <input
                            type="text"
                            value={slide.buttonLink || ""}
                            onChange={(e) =>
                              handleSlideChange(sec.id, sIdx, "buttonLink", e.target.value)
                            }
                            className="w-full rounded-xl border border-input bg-background px-3 py-2 dir-ltr"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sec.id === "promo_banner" && (
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="font-bold block mb-1">عنوان البانر بالعربية</label>
                    <input
                      type="text"
                      value={(sec.content["headingAr"] as string) || ""}
                      onChange={(e) => handleContentChange(sec.id, "headingAr", e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">الوصف الترويجي</label>
                    <input
                      type="text"
                      value={(sec.content["descriptionAr"] as string) || ""}
                      onChange={(e) => handleContentChange(sec.id, "descriptionAr", e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
