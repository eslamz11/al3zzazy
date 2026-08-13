import { useEffect, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Plus, Search, Filter } from "lucide-react";
import { ProductTable } from "@/components/admin/ProductTable";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import {
  adminListProducts,
  updateProduct,
  hardDeleteProduct,
  createProduct,
} from "@/lib/services/firebase/productService";
import type { CategoryHandle, Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products/")({
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryHandle | "all">("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  // Deletion modal
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const { products: data } = await adminListProducts({ limit_: 200 });
    setProducts(data);
    setLoading(false);
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    await updateProduct(id, { active });
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active } : p)));
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    await updateProduct(id, { featured });
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured } : p)));
  };

  const handleDuplicate = async (p: Product) => {
    const duplicateData = {
      nameAr: `${p.name.ar} (نسخة)`,
      nameEn: `${p.name.en} (Copy)`,
      taglineAr: p.tagline.ar,
      taglineEn: p.tagline.en,
      descriptionAr: p.description.ar,
      descriptionEn: p.description.en,
      slug: `${p.slug}-copy-${Date.now().toString().slice(-4)}`,
      categoryId: p.category,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      costPrice: p.costPrice,
      sku: `${p.sku}-COPY`,
      barcode: p.barcode,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      featured: false,
      active: true,
      tags: p.tags,
      images: p.images,
      variants: p.variants,
      options: p.options,
      materials: p.materials,
      features: p.features,
      usage: p.usage,
      care: p.care,
      firmness: p.firmness,
      brand: p.brand,
      seo: p.seo,
    };
    await createProduct(duplicateData as any);
    await loadProducts();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const result = await hardDeleteProduct(deletingProduct.id);
      if (!result.ok) {
        setDeleteError("فشل حذف المنتج. يرجى المحاولة مرة أخرى.");
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setDeletingProduct(null);
    } catch (err) {
      console.error("Failed to delete product:", err);
      setDeleteError("حدث خطأ أثناء حذف المنتج. يرجى المحاولة مرة أخرى.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.ar.toLowerCase().includes(q) ||
      p.name.en.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;

    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" && p.active !== false) ||
      (activeFilter === "inactive" && p.active === false);

    return matchesSearch && matchesCategory && matchesActive;
  });

  return (
    <div className="space-y-6 dir-rtl">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e5dfd7] shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#1a1c1c] margin-0">
            إدارة المنتجات
          </h1>
          <p className="text-xs md:text-sm text-gray-500 margin-0 mt-1">
            عرض، تعديل، إضافة وإدارة كافة منتجات متجر سليب هاي ({products.length} منتج)
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#c8102e] px-4 py-2.5 text-xs md:text-sm font-bold text-white shadow-xs hover:bg-[#a50b23] transition-colors min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          <span>منتج جديد</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-[#e5dfd7] shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المنتج أو الـ SKU..."
            className="w-full rounded-xl border border-[#e5dfd7] bg-[#fbf9f5] pr-9 pl-3 py-2 text-xs focus:bg-white focus:border-[#c8102e] outline-none"
          />
        </div>

        {/* Category filter */}
        <div className="w-40">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryHandle | "all")}
            className="w-full rounded-xl border border-[#e5dfd7] bg-[#fbf9f5] px-3 py-2 text-xs font-medium"
          >
            <option value="all">كل الفئات</option>
            <option value="mattresses">المراتب</option>
            <option value="pillows">الوسائد</option>
            <option value="toppers">مراتب التطرية</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="w-36">
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as "all" | "active" | "inactive")}
            className="w-full rounded-xl border border-[#e5dfd7] bg-[#fbf9f5] px-3 py-2 text-xs font-medium"
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط فقط</option>
            <option value="inactive">معطل فقط</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">جاري تحميل المنتجات...</div>
      ) : (
        <ProductTable
          products={filteredProducts}
          onToggleActive={handleToggleActive}
          onToggleFeatured={handleToggleFeatured}
          onDuplicate={handleDuplicate}
          onDelete={(p) => setDeletingProduct(p)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        isOpen={Boolean(deletingProduct)}
        title="هل أنت متأكد من حذف هذا المنتج؟"
        description={`سيتم حذف المنتج "${deletingProduct?.name.ar}" نهائياً من قاعدة البيانات ولا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف المنتج نهائياً"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeletingProduct(null);
          setDeleteError(null);
        }}
      />

      {/* Deletion error toast */}
      {deleteError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl bg-destructive px-5 py-3 text-sm font-semibold text-white shadow-lg">
          <span>{deleteError}</span>
          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="text-white/80 hover:text-white font-bold ml-2"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
