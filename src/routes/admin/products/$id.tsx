import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ProductForm, type ProductFormValues } from "@/components/admin/ProductForm";
import {
  getProductById,
  updateProduct,
  generateOptionsFromVariants,
} from "@/lib/services/firebase/productService";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products/$id")({
  component: AdminEditProductPage,
});

function AdminEditProductPage() {
  const { id } = useParams({ from: "/admin/products/$id" });
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-muted-foreground dir-rtl">
        جاري تحميل بيانات المنتج...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-16 text-center text-xs text-muted-foreground dir-rtl">
        المنتج غير موجود أو تم حذفه.
      </div>
    );
  }

  const initialValues: Partial<ProductFormValues> = {
    nameAr: product.name.ar,
    nameEn: product.name.en,
    taglineAr: product.tagline.ar,
    taglineEn: product.tagline.en,
    descriptionAr: product.description.ar,
    descriptionEn: product.description.en,
    slug: product.slug,
    categoryId: product.category,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    costPrice: product.costPrice,
    sku: product.sku,
    barcode: product.barcode,
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold || 5,
    featured: product.featured,
    active: product.active !== false,
    tags: product.tags,
    brand: product.brand || "سليب هاي",
    firmness: product.firmness,
    materialsAr: product.materials.ar,
    materialsEn: product.materials.en,
    seoTitleAr: product.seo?.titleAr || "",
    seoTitleEn: product.seo?.titleEn || "",
    seoDescAr: product.seo?.descriptionAr || "",
    seoDescEn: product.seo?.descriptionEn || "",
    images: product.images.map((img, idx) => ({
      id: `img-${idx}`,
      src: img.src,
      provider: "external",
      alt: img.alt,
      isPrimary: idx === 0,
    })),
    variants: product.variants,
    trust: product.trust,
    viewerCount: product.viewerCount,
  } as unknown as Partial<ProductFormValues>;

  const handleSubmit = async (values: ProductFormValues) => {
    const payload = {
      nameAr: values.nameAr,
      nameEn: values.nameEn,
      taglineAr: values.taglineAr,
      taglineEn: values.taglineEn,
      descriptionAr: values.descriptionAr,
      descriptionEn: values.descriptionEn,
      slug: values.slug,
      categoryId: values.categoryId,
      price: values.price,
      compareAtPrice: values.compareAtPrice,
      costPrice: values.costPrice,
      sku: values.sku,
      barcode: values.barcode,
      stock: values.stock,
      lowStockThreshold: values.lowStockThreshold,
      featured: values.featured,
      active: values.active,
      tags: values.tags,
      brand: values.brand,
      firmness: values.firmness,
      materials: { ar: values.materialsAr, en: values.materialsEn },
      seo: {
        titleAr: values.seoTitleAr,
        titleEn: values.seoTitleEn,
        descriptionAr: values.seoDescAr,
        descriptionEn: values.seoDescEn,
      },
      images: values.images.map((img, idx) => ({
        url: img.src,
        provider: img.provider,
        altAr: img.alt.ar,
        altEn: img.alt.en,
        position: idx,
        isPrimary: img.isPrimary,
      })),
      variants: values.variants,
      options: values.variants.length > 0 ? generateOptionsFromVariants(values.variants) : [],
      trust: values.trust,
      viewerCount: values.viewerCount,
    };
    const res = await updateProduct(
      id,
      payload as unknown as import("@/lib/services/firebase/productService").ProductInput,
    );

    if (res.ok) {
      navigate({ to: "/admin/products" });
    }
  };

  return <ProductForm initialValues={initialValues} isEditing onSubmit={handleSubmit} />;
}
