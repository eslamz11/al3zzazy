import { useState, useRef } from "react";
import { Save, ArrowRight, Languages, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ImageUploader, type ManagedImage } from "./ImageUploader";
import { VariantEditor } from "./VariantEditor";
import type { CategoryHandle, Product, ProductVariant } from "@/lib/types";

export interface ProductFormValues {
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  descriptionAr: string;
  descriptionEn: string;
  slug: string;
  categoryId: CategoryHandle;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  barcode?: string;
  stock: number;
  lowStockThreshold: number;
  featured: boolean;
  active: boolean;
  tags: string[];
  brand: string;
  firmness: Product["firmness"];
  materialsAr: string;
  materialsEn: string;
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescAr: string;
  seoDescEn: string;
  images: ManagedImage[];
  variants: ProductVariant[];
  trust: {
    warranty10Years: boolean;
    freeShipping: boolean;
  };
  viewerCount: {
    enabled: boolean;
    mode: "random" | "fixed";
    min: number;
    max: number;
    fixed: number;
  };
}

interface ProductFormProps {
  initialValues?: Partial<ProductFormValues>;
  isEditing?: boolean;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

const CATEGORIES: Array<{ handle: CategoryHandle; nameAr: string }> = [
  { handle: "mattresses", nameAr: "المراتب" },
  { handle: "pillows", nameAr: "الوسائد" },
  { handle: "toppers", nameAr: "مراتب التطرية" },
];

export function ProductForm({ initialValues, isEditing = false, onSubmit }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nameAr, setNameAr] = useState(initialValues?.nameAr || "");
  const [nameEn, setNameEn] = useState(initialValues?.nameEn || "");
  const [taglineAr, setTaglineAr] = useState(initialValues?.taglineAr || "");
  const [taglineEn, setTaglineEn] = useState(initialValues?.taglineEn || "");
  const [descriptionAr, setDescriptionAr] = useState(initialValues?.descriptionAr || "");
  const [descriptionEn, setDescriptionEn] = useState(initialValues?.descriptionEn || "");
  const [slug, setSlug] = useState(initialValues?.slug || "");
  const [categoryId, setCategoryId] = useState<CategoryHandle>(
    initialValues?.categoryId || "mattresses",
  );
  const [price, setPrice] = useState<number>(initialValues?.price || 0);
  const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>(
    initialValues?.compareAtPrice,
  );
  const [costPrice, setCostPrice] = useState<number | undefined>(initialValues?.costPrice);
  const [sku, setSku] = useState(initialValues?.sku || "");
  const skuRef = useRef<HTMLInputElement>(null);
  const [stock, setStock] = useState<number>(initialValues?.stock || 0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(
    initialValues?.lowStockThreshold || 5,
  );
  const [featured, setFeatured] = useState<boolean>(initialValues?.featured || false);
  const [active, setActive] = useState<boolean>(initialValues?.active !== false);
  const [tagsInput, setTagsInput] = useState<string>((initialValues?.tags || []).join(", "));
  const [brand, setBrand] = useState<string>(initialValues?.brand || "سليب هاي");
  const [firmness, setFirmness] = useState<Product["firmness"]>(
    initialValues?.firmness || "medium",
  );
  const [materialsAr, setMaterialsAr] = useState(initialValues?.materialsAr || "");
  const [materialsEn, setMaterialsEn] = useState(initialValues?.materialsEn || "");
  const [seoTitleAr, setSeoTitleAr] = useState(initialValues?.seoTitleAr || "");
  const [seoTitleEn, setSeoTitleEn] = useState(initialValues?.seoTitleEn || "");
  const [seoDescAr, setSeoDescAr] = useState(initialValues?.seoDescAr || "");
  const [seoDescEn, setSeoDescEn] = useState(initialValues?.seoDescEn || "");

  const [images, setImages] = useState<ManagedImage[]>(initialValues?.images || []);
  const [variants, setVariants] = useState<ProductVariant[]>(initialValues?.variants || []);
  const [trustWarranty, setTrustWarranty] = useState<boolean>(
    initialValues?.trust?.warranty10Years ?? true,
  );
  const [trustShipping, setTrustShipping] = useState<boolean>(
    initialValues?.trust?.freeShipping ?? true,
  );
  const [viewerCountEnabled, setViewerCountEnabled] = useState<boolean>(
    initialValues?.viewerCount?.enabled ?? true,
  );
  const [viewerCountMode, setViewerCountMode] = useState<"random" | "fixed">(
    initialValues?.viewerCount?.mode || "random",
  );
  const [viewerCountMin, setViewerCountMin] = useState<number>(
    initialValues?.viewerCount?.min ?? 8,
  );
  const [viewerCountMax, setViewerCountMax] = useState<number>(
    initialValues?.viewerCount?.max ?? 25,
  );
  const [viewerCountFixed, setViewerCountFixed] = useState<number>(
    initialValues?.viewerCount?.fixed ?? 15,
  );

  const generateSku = () => {
    const ts = Date.now().toString().slice(-6);
    const prefix = nameAr.trim().slice(0, 3).toUpperCase() || "SKU";
    const newSku = `${prefix}-${ts}`;
    setSku(newSku);
  };

  const [translating, setTranslating] = useState(false);
  const handleAutoTranslate = async () => {
    setTranslating(true);
    try {
      const translate = async (text: string) => {
        if (!text.trim()) return "";
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const json = await res.json();
        return json[0].map((x: any) => x[0]).join("");
      };

      if (nameAr && !nameEn) setNameEn(await translate(nameAr));
      if (taglineAr && !taglineEn) setTaglineEn(await translate(taglineAr));
      if (descriptionAr && !descriptionEn) setDescriptionEn(await translate(descriptionAr));
      if (materialsAr && !materialsEn) setMaterialsEn(await translate(materialsAr));
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الترجمة.");
    } finally {
      setTranslating(false);
    }
  };

  const handleAutoSEO = () => {
    if (!seoTitleAr) setSeoTitleAr(`شراء ${nameAr} بأفضل سعر`);
    if (!seoTitleEn && nameEn) setSeoTitleEn(`Buy ${nameEn} at the best price`);
    if (!seoDescAr)
      setSeoDescAr(descriptionAr.substring(0, 150) || `تسوق ${nameAr} من سليب هاي مصر`);
    if (!seoDescEn && descriptionEn)
      setSeoDescEn(descriptionEn.substring(0, 150) || `Shop ${nameEn} from SleepHigh Egypt`);
  };

  const handleNameArChange = (val: string) => {
    setNameAr(val);
    if (!isEditing && !slug) {
      const generatedSlug = val
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u0621-\u064A-]+/g, "");
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) {
      setError("اسم المنتج باللغة العربية مطلوب");
      return;
    }
    if (!price || price <= 0) {
      setError("السعر يجب أن يكون أكبر من صفر");
      return;
    }
    if (!sku.trim()) {
      setError("رمز SKU مطلوب");
      return;
    }

    setLoading(true);
    setError(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: ProductFormValues = {
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim() || nameAr.trim(),
      taglineAr: taglineAr.trim(),
      taglineEn: taglineEn.trim(),
      descriptionAr: descriptionAr.trim(),
      descriptionEn: descriptionEn.trim(),
      slug: slug.trim() || `product-${Date.now()}`,
      categoryId,
      price,
      sku: sku.trim(),
      stock,
      lowStockThreshold,
      featured,
      active,
      tags,
      brand: brand.trim(),
      firmness,
      materialsAr: materialsAr.trim(),
      materialsEn: materialsEn.trim(),
      seoTitleAr: seoTitleAr.trim(),
      seoTitleEn: seoTitleEn.trim(),
      seoDescAr: seoDescAr.trim(),
      seoDescEn: seoDescEn.trim(),
      images,
      variants,
      trust: {
        warranty10Years: trustWarranty,
        freeShipping: trustShipping,
      },
      viewerCount: {
        enabled: viewerCountEnabled,
        mode: viewerCountMode,
        min: Math.max(1, viewerCountMin),
        max: Math.max(viewerCountMin, viewerCountMax),
        fixed: Math.max(1, viewerCountFixed),
      },
    };

    if (compareAtPrice !== undefined) payload.compareAtPrice = compareAtPrice;
    if (costPrice !== undefined) payload.costPrice = costPrice;

    try {
      await onSubmit(payload);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء حفظ المنتج. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 dir-rtl text-foreground">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Link
            to="/admin/products"
            className="rounded-lg border border-input p-2 hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isEditing ? "تعديل المنتج" : "إضافة منتج جديد"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              قم بملء كافة البيانات التالية لإنشاء منتج متكامل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoTranslate}
            disabled={translating || !nameAr}
            className="inline-flex items-center space-x-2 space-x-reverse rounded-xl bg-blue-50 text-blue-600 border border-blue-200 px-5 py-2.5 text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm disabled:opacity-50"
            title="ترجمة النصوص العربية إلى الإنجليزية تلقائياً"
          >
            <Languages className="h-4 w-4" />
            <span>{translating ? "جاري الترجمة..." : "ترجمة تلقائية"}</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 space-x-reverse rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-brand-foreground hover:bg-brand-hover transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "جاري الحفظ..." : "حفظ المنتج"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              البيانات الأساسية
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-foreground">الاسم بالعربية *</label>
                <input
                  type="text"
                  required
                  value={nameAr}
                  onChange={(e) => handleNameArChange(e.target.value)}
                  placeholder="مثال: مرتبة بوكيت بلس"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">الاسم بالإنجليزية</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Example: Pocket+ Mattress"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs dir-ltr"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-foreground">
                  الرابط اللطيف (Slug) بالعربية *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="pocket-plus"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs dir-ltr"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">
                  العلامة التجارية (Brand)
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="سليب هاي"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-foreground">
                  الشعار الترويجي بالعربية
                </label>
                <input
                  type="text"
                  value={taglineAr}
                  onChange={(e) => setTaglineAr(e.target.value)}
                  placeholder="دعم دقيق لكل منطقة في الجسم"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">
                  الشعار الترويجي بالإنجليزية
                </label>
                <input
                  type="text"
                  value={taglineEn}
                  onChange={(e) => setTaglineEn(e.target.value)}
                  placeholder="Independent pocket springs for precise support"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs dir-ltr"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">الوصف بالعربية</label>
              <textarea
                rows={4}
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder="اكتب وصفاً مفصلاً للمنتج ومميزاته..."
                className="mt-1 w-full rounded-xl border border-input bg-background p-3 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">الوصف بالإنجليزية</label>
              <textarea
                rows={4}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Write a detailed product description..."
                className="mt-1 w-full rounded-xl border border-input bg-background p-3 text-xs dir-ltr"
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              الأسعار والمخزون
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-bold text-foreground">السعر (ج.م) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={price || ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="6500"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">السعر قبل الخصم (ج.م)</label>
                <input
                  type="number"
                  min={0}
                  value={compareAtPrice || ""}
                  onChange={(e) =>
                    setCompareAtPrice(e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="7500"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">سعر التكلفة (ج.م)</label>
                <input
                  type="number"
                  min={0}
                  value={costPrice || ""}
                  onChange={(e) =>
                    setCostPrice(e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="4200"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-bold text-foreground">المخزون الإجمالي</label>
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  placeholder="25"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">حد التنبيه المنخفض</label>
                <input
                  type="number"
                  min={1}
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  placeholder="5"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">SKU *</label>
              <div className="mt-1 flex gap-2">
                <input
                  ref={skuRef}
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SH-M-POCKET"
                  className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs dir-ltr"
                />
                <button
                  type="button"
                  onClick={generateSku}
                  className="rounded-xl border border-input px-3 py-2 text-xs font-bold hover:bg-accent"
                >
                  توليد تلقائي
                </button>
              </div>
            </div>
          </div>

          {/* Product Images Uploader */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <ImageUploader images={images} onChange={setImages} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              متغيرات المنتج
            </h3>
            <VariantEditor
              variants={variants}
              basePrice={price}
              skuPrefix={sku}
              onChange={setVariants}
            />
          </div>

          {/* Materials & Firmness */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              الخامات والدعم
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-foreground">الخامات بالعربية</label>
                <input
                  type="text"
                  value={materialsAr}
                  onChange={(e) => setMaterialsAr(e.target.value)}
                  placeholder="نوابض منفصلة، فوم عالي الكثافة..."
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">درجة الصلابة (Firmness)</label>
                <select
                  value={firmness}
                  onChange={(e) => setFirmness(e.target.value as Product["firmness"])}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="soft">ناعمة (Soft)</option>
                  <option value="medium">متوسطة (Medium)</option>
                  <option value="medium-firm">متوسطة الصلابة (Medium-Firm)</option>
                  <option value="firm">صلبة (Firm)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar 1 column */}
        <div className="space-y-6">
          {/* Status & Categorization */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              التنظيم والحالة
            </h3>

            <div>
              <label className="text-xs font-bold text-foreground">الفئة الرئيسية *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value as CategoryHandle)}
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.handle} value={c.handle}>
                    {c.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">
                الوسوم (Tags - مفصولة بفواصل)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="بوكيت, مراتب, نوابض"
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
              />
            </div>

            <div className="pt-2 space-y-3">
              <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded-md border-input text-brand focus:ring-brand"
                />
                <span className="text-xs font-bold text-foreground">نشط (يعرض للمشترين)</span>
              </label>

              <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded-md border-input text-brand focus:ring-brand"
                />
                <span className="text-xs font-bold text-foreground">
                  منتج مميز (Hero / Featured)
                </span>
              </label>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-foreground">تحسين محركات البحث (SEO)</h3>
              <button
                type="button"
                onClick={handleAutoSEO}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand bg-brand/10 hover:bg-brand/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>تعبئة تلقائية (Automate)</span>
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">
                عنوان الصفحة بالعربية (Title)
              </label>
              <input
                type="text"
                value={seoTitleAr}
                onChange={(e) => setSeoTitleAr(e.target.value)}
                placeholder="مرتبة بوكيت بلس | سليب هاي"
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">عنوان الصفحة بالإنجليزية</label>
              <input
                type="text"
                value={seoTitleEn}
                onChange={(e) => setSeoTitleEn(e.target.value)}
                placeholder="Pocket+ Mattress | SleepHigh"
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs dir-ltr"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">
                الوصف الميتا بالعربية (Description)
              </label>
              <textarea
                rows={3}
                value={seoDescAr}
                onChange={(e) => setSeoDescAr(e.target.value)}
                placeholder="اشترِ مرتبة بوكيت بلس بأفضل سعر وتوصيل مجاني..."
                className="mt-1 w-full rounded-xl border border-input bg-background p-2.5 text-xs"
              />
            </div>
          </div>

          {/* Special Settings (Trust & Viewer Count) */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              مميزات إضافية (Trust & Viewers)
            </h3>

            <div className="pt-2 space-y-3 border-b border-border pb-4">
              <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={trustWarranty}
                  onChange={(e) => setTrustWarranty(e.target.checked)}
                  className="h-4 w-4 rounded-md border-input text-brand focus:ring-brand"
                />
                <span className="text-xs font-bold text-foreground">ضمان 10 سنوات</span>
              </label>

              <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={trustShipping}
                  onChange={(e) => setTrustShipping(e.target.checked)}
                  className="h-4 w-4 rounded-md border-input text-brand focus:ring-brand"
                />
                <span className="text-xs font-bold text-foreground">شحن مجاني</span>
              </label>
            </div>

            <div className="pt-4 space-y-4">
              <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={viewerCountEnabled}
                  onChange={(e) => setViewerCountEnabled(e.target.checked)}
                  className="h-4 w-4 rounded-md border-input text-brand focus:ring-brand"
                />
                <span className="text-xs font-bold text-foreground">
                  تفعيل عداد المشاهدات الوهمي
                </span>
              </label>

              {viewerCountEnabled && (
                <div className="space-y-4 pr-7">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-2">
                      نوع العداد
                    </label>
                    <select
                      value={viewerCountMode}
                      onChange={(e) => setViewerCountMode(e.target.value as "random" | "fixed")}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                    >
                      <option value="random">عشوائي (بين رقمين)</option>
                      <option value="fixed">رقم ثابت</option>
                    </select>
                  </div>

                  {viewerCountMode === "random" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-foreground">الحد الأدنى</label>
                        <input
                          type="number"
                          min={1}
                          value={viewerCountMin}
                          onChange={(e) => setViewerCountMin(Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-foreground">الحد الأقصى</label>
                        <input
                          type="number"
                          min={viewerCountMin}
                          value={viewerCountMax}
                          onChange={(e) => setViewerCountMax(Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-bold text-foreground">رقم ثابت</label>
                      <input
                        type="number"
                        min={1}
                        value={viewerCountFixed}
                        onChange={(e) => setViewerCountFixed(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
