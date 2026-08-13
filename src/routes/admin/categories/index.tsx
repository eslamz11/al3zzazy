import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Edit2, Trash2, FolderTree } from "lucide-react";
import {
  adminListCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/services/firebase/categoryService";
import type { Category, CategoryHandle } from "@/lib/types";

export const Route = createFileRoute("/admin/categories/")({
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [handle, setHandle] = useState<CategoryHandle>("mattresses");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [image, setImage] = useState("");
  const [order, setOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await adminListCategories();
    setCategories(data);
    setLoading(false);
  }

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setNameAr("");
    setNameEn("");
    setHandle("mattresses");
    setDescriptionAr("");
    setDescriptionEn("");
    setImage("");
    setOrder(categories.length);
    setActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setNameAr(cat.name.ar);
    setNameEn(cat.name.en);
    setHandle(cat.handle);
    setDescriptionAr(cat.description.ar);
    setDescriptionEn(cat.description.en);
    setImage(cat.image);
    setOrder(cat.order || 0);
    setActive(cat.active !== false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingCategory?.id) {
      await updateCategory(editingCategory.id, {
        nameAr,
        nameEn,
        descriptionAr,
        descriptionEn,
        handle,
        slug: handle,
        image,
        order,
        active,
      });
    } else {
      await createCategory({
        nameAr,
        nameEn,
        descriptionAr,
        descriptionEn,
        handle,
        slug: handle,
        image,
        order,
        active,
      });
    }

    setSaving(false);
    setShowModal(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا التصنيف؟")) {
      await deleteCategory(id);
      await load();
    }
  };

  return (
    <div className="space-y-6 text-foreground dir-rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            إدارة التصنيفات ({categories.length})
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            إضافة وتعديل وترتيب أقسام المتجر الرئيسية
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-1.5 space-x-reverse rounded-xl bg-brand px-4 py-2 text-xs font-bold text-brand-foreground hover:bg-brand-hover transition-colors shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة تصنيف جديد</span>
        </button>
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          جاري تحميل التصنيفات...
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id || cat.handle}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="flex space-x-4 space-x-reverse">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name.ar}
                    className="h-16 w-16 rounded-xl object-cover border border-border bg-muted shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-xl shrink-0">
                    <FolderTree className="h-8 w-8" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {cat.handle}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        cat.active !== false
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {cat.active !== false ? "مفعل" : "معطل"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground truncate mt-1">{cat.name.ar}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {cat.description.ar}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs font-semibold text-muted-foreground">
                  الترتيب: {cat.order || 0}
                </span>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="rounded-lg border border-input bg-background p-1.5 text-foreground hover:bg-accent text-xs font-semibold"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  {cat.id && (
                    <button
                      onClick={() => handleDelete(cat.id!)}
                      className="rounded-lg bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 text-foreground">
            <h3 className="text-base font-bold">
              {editingCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold block mb-1">الاسم بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 dir-ltr"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">المعرف (Handle) *</label>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value as CategoryHandle)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 dir-ltr"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">الوصف بالعربية</label>
                <textarea
                  rows={2}
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-2.5"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">رابط صورة التصنيف</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 dir-ltr"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold block mb-1">ترتيب العرض</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center space-x-2 space-x-reverse cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="h-4 w-4 rounded-md border-input text-brand"
                    />
                    <span>مفعل في المتجر</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-input bg-background px-4 py-2 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-brand px-5 py-2 font-bold text-brand-foreground hover:bg-brand-hover"
                >
                  {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
