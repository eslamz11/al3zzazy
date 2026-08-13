import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ProductForm, type ProductFormValues } from "@/components/admin/ProductForm";
import { createProduct, generateOptionsFromVariants } from "@/lib/services/firebase/productService";

export const Route = createFileRoute("/admin/products/new")({
  component: AdminNewProductPage,
});

function AdminNewProductPage() {
  const navigate = useNavigate();

  const handleSubmit = async (values: ProductFormValues) => {
    const input = {
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
      features: [{ ar: "خامات مختارة بعناية", en: "Carefully selected materials" }],
      usage: { ar: "استخدم المنتج مع مفرش نظيف", en: "Use with clean cover" },
      care: { ar: "يُغسل على درجة 30", en: "Wash at 30°C" },
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

    const res = await createProduct(
      input as unknown as import("@/lib/services/firebase/productService").ProductInput,
    );
    if (res.ok) {
      navigate({ to: "/admin/products" });
    } else {
      throw new Error(res.error);
    }
  };

  return <ProductForm onSubmit={handleSubmit} />;
}
