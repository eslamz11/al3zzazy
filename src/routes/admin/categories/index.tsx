import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Edit2, Trash2, FolderTree, ChevronDown, ChevronUp } from "lucide-react";
import {
  adminListCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/services/firebase/categoryService";
import {
  adminListSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "@/lib/services/firebase/subcategoryService";
import type { Category, CategoryHandle, Subcategory } from "@/lib/types";

export const Route = createFileRoute("/admin/categories/")({
  component: AdminCategoriesPage,
});

type ModalMode = "category-create" | "category-edit" | "subcategory-create" | "subcategory-edit";

function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("category-create");

  // Category form states
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [handle, setHandle] = useState<CategoryHandle>("mattresses");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [image, setImage] = useState("");
  const [order, setOrder] = useState(0);
  const [active, setActive] = useState(true);

  // Subcategory form states
  const [subNameAr, setSubNameAr] = useState("");
  const [subNameEn, setSubNameEn] = useState("");
  const [subHandle, setSubHandle] = useState("");
  const [subDescriptionAr, setSubDescriptionAr] = useState("");
  const [subDescriptionEn, setSubDescriptionEn] = useState("");
  const [subParentCategoryId, setSubParentCategoryId] = useState("");
  const [subOrder, setSubOrder] = useState(0);
  const [subActive, setSubActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [cats, subs] = await Promise.all([adminListCategories(), adminListSubcategories()]);
    setCategories(cats);
    setSubcategories(subs);
    setLoading(false);
  }

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleOpenCreateCategory = () => {
    setModalMode("category-create");
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

  const handleOpenEditCategory = (cat: Category) => {
    setModalMode("category-edit");
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

  const handleOpenCreateSubcategory = (parentCategoryId: string) => {
    setModalMode("subcategory-create");
    setEditingSubcategory(null);
    setSubNameAr("");
    setSubNameEn("");
    setSubHandle("");
    setSubDescriptionAr("");
    setSubDescriptionEn("");
    setSubParentCategoryId(parentCategoryId);
    const subsForParent = subcategories.filter((s) => s.parentCategoryId === parentCategoryId);
    setSubOrder(subsForParent.length);
    setSubActive(true);
    setShowModal(true);
  };

  const handleOpenEditSubcategory = (sub: Subcategory) => {
    setModalMode("subcategory-edit");
    setEditingSubcategory(sub);
    setSubNameAr(sub.name.ar);
    setSubNameEn(sub.name.en);
    setSubHandle(sub.handle);
    setSubDescriptionAr(sub.description.ar);
    setSubDescriptionEn(sub.description.en);
    setSubParentCategoryId(sub.parentCategoryId);
    setSubOrder(sub.order || 0);
    setSubActive(sub.active !== false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (modalMode === "category-create" || modalMode === "category-edit") {
      if (modalMode === "category-edit" && editingCategory?.id) {
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
    } else if (modalMode === "subcategory-create" || modalMode === "subcategory-edit") {
      if (modalMode === "subcategory-edit" && editingSubcategory?.id) {
        await updateSubcategory(editingSubcategory.id, {
          nameAr: subNameAr,
          nameEn: subNameEn,
          descriptionAr: subDescriptionAr,
          descriptionEn: subDescriptionEn,
          handle: subHandle,
          slug: subHandle,
          parentCategoryId: subParentCategoryId,
          order: subOrder,
          active: subActive,
        });
      } else {
        await createSubcategory({
          nameAr: subNameAr,
          nameEn: subNameEn,
          descriptionAr: subDescriptionAr,
          descriptionEn: subDescriptionEn,
          handle: subHandle,
          slug: subHandle,
          parentCategoryId: subParentCategoryId,
          order: subOrder,
          active: subActive,
        });
      }
    }

    setSaving(false);
    setShowModal(false);
    await load();
  };

  const handleDeleteCategory = async (id: string) => {
    const subsForCategory = subcategories.filter((s) => s.parentCategoryId === id);
    if (subsForCategory.length > 0) {
      alert("لا يمكن حذف هذا التصنيف لأنه يحتوي على تصنيفات فرعية. قم بحذف التصنيفات الفرعية أولاً.");
      return;
    }
    if (window.confirm("هل أنت متأكد من حذف هذا التصنيف؟")) {
      await deleteCategory(id);
      await load();
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا التصنيف الفرعي؟")) {
      await deleteSubcategory(id);
      await load();
    }
  };

  const getSubcategoriesForCategory = (categoryId: string) => {
    return subcategories.filter((sub) => sub.parentCategoryId === categoryId);
  };

  return (
    <div className="space-y-6 text-foreground dir-rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            إدارة التصنيفات ({categories.length} رئيسي، {subcategories.length} فرعي)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            إضافة وتعديل التصنيفات الرئيسية والفرعية ديناميكياً
          </p>
        </div>

        <button
          onClick={handleOpenCreateCategory}
          className="inline-flex items-center space-x-1.5 space-x-reverse rounded-xl bg-brand px-4 py-2 text-xs font-bold text-brand-foreground hover:bg-brand-hover transition-colors shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة تصنيف رئيسي</span>
        </button>
      </div>

      {/* Categories with Subcategories */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          جاري تحميل التصنيفات...
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => {
            const subs = getSubcategoriesForCategory(cat.id || "");
            const isExpanded = expandedCategories.has(cat.id || "");

            return (
              <div
                key={cat.id || cat.handle}
                className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden"
              >
                {/* Main Category Header */}
                <div className="p-5">
                  <div className="flex space-x-4 space-x-reverse items-start">
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
                      <div className="flex items-center justify-between mb-1">
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

                      <h3 className="text-sm font-bold text-foreground">{cat.name.ar}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {cat.description.ar}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          className="rounded-lg border border-input bg-background px-3 py-1.5 text-foreground hover:bg-accent text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>تعديل</span>
                        </button>

                        {cat.id && (
                          <button
                            onClick={() => handleDeleteCategory(cat.id!)}
                            className="rounded-lg bg-destructive/10 px-3 py-1.5 text-destructive hover:bg-destructive/20 text-xs font-semibold inline-flex items-center gap-1.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>حذف</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenCreateSubcategory(cat.id || "")}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-blue-700 hover:bg-blue-100 text-xs font-semibold inline-flex items-center gap-1.5 mr-auto"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>إضافة تصنيف فرعي</span>
                        </button>

                        {subs.length > 0 && (
                          <button
                            onClick={() => toggleCategoryExpansion(cat.id || "")}
                            className="rounded-lg border border-input bg-background px-3 py-1.5 text-foreground hover:bg-accent text-xs font-semibold inline-flex items-center gap-1.5"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-3.5 w-3.5" />
                                <span>إخفاء ({subs.length})</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3.5 w-3.5" />
                                <span>عرض ({subs.length})</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subcategories */}
                {isExpanded && subs.length > 0 && (
                  <div className="border-t border-border bg-muted/30 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {subs.map((sub) => (
                        <div
                          key={sub.id}
                          className="rounded-xl border border-border bg-card p-3 shadow-xs"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-xs font-bold text-foreground">{sub.name.ar}</h4>
                                <span
                                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                                    sub.active !== false
                                      ? "bg-success/15 text-success"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {sub.active !== false ? "مفعل" : "معطل"}
                                </span>
                              </div>
                              <p className="text-[10px] font-mono text-muted-foreground">
                                {sub.handle}
                              </p>
                              {sub.description.ar && (
                                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                                  {sub.description.ar}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pt-2 border-t border-border">
                            <button
                              onClick={() => handleOpenEditSubcategory(sub)}
                              className="rounded-lg border border-input bg-background p-1.5 text-foreground hover:bg-accent"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            {sub.id && (
                              <button
                                onClick={() => handleDeleteSubcategory(sub.id!)}
                                className="rounded-lg bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                            <span className="text-[10px] font-semibold text-muted-foreground mr-auto">
                              ترتيب: {sub.order || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 text-foreground max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold">
              {modalMode === "category-create" && "إضافة تصنيف رئيسي جديد"}
              {modalMode === "category-edit" && "تعديل التصنيف الرئيسي"}
              {modalMode === "subcategory-create" && "إضافة تصنيف فرعي جديد"}
              {modalMode === "subcategory-edit" && "تعديل التصنيف الفرعي"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {(modalMode === "category-create" || modalMode === "category-edit") && (
                <>
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
                </>
              )}

              {(modalMode === "subcategory-create" || modalMode === "subcategory-edit") && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="font-bold block mb-1">الاسم بالعربية *</label>
                      <input
                        type="text"
                        required
                        value={subNameAr}
                        onChange={(e) => setSubNameAr(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">الاسم بالإنجليزية</label>
                      <input
                        type="text"
                        value={subNameEn}
                        onChange={(e) => setSubNameEn(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 dir-ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">المعرف (Handle) *</label>
                    <input
                      type="text"
                      required
                      value={subHandle}
                      onChange={(e) => setSubHandle(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 dir-ltr"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">التصنيف الرئيسي *</label>
                    <select
                      required
                      value={subParentCategoryId}
                      onChange={(e) => setSubParentCategoryId(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                    >
                      <option value="">اختر التصنيف الرئيسي</option>
                      {categories.map((cat) => (
                        <option key={cat.id || cat.handle} value={cat.id || ""}>
                          {cat.name.ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">الوصف بالعربية</label>
                    <textarea
                      rows={2}
                      value={subDescriptionAr}
                      onChange={(e) => setSubDescriptionAr(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background p-2.5"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="font-bold block mb-1">ترتيب العرض</label>
                      <input
                        type="number"
                        value={subOrder}
                        onChange={(e) => setSubOrder(Number(e.target.value))}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center space-x-2 space-x-reverse cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={subActive}
                          onChange={(e) => setSubActive(e.target.checked)}
                          className="h-4 w-4 rounded-md border-input text-brand"
                        />
                        <span>مفعل في المتجر</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

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
