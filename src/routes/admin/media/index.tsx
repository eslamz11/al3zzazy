import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Image as ImageIcon, Copy, Check, Filter } from "lucide-react";
import { ImageUploader, type ManagedImage } from "@/components/admin/ImageUploader";

export const Route = createFileRoute("/admin/media/")({
  component: AdminMediaPage,
});

function AdminMediaPage() {
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [providerFilter, setProviderFilter] = useState<"all" | "imgbb" | "freeimage">("all");

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredImages = images.filter((img) => {
    if (providerFilter !== "all" && img.provider !== providerFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-foreground dir-rtl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            مكتبة الوسائط والصور ({images.length})
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            عرض وتصفح وحفظ صور المنتجات المرفوعة عبر ImgBB و Freeimage.host
          </p>
        </div>

        <div className="w-44">
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value as "all" | "imgbb" | "freeimage")}
            className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-semibold"
          >
            <option value="all">كل مزودي الصور</option>
            <option value="imgbb">ImgBB (الأساسي)</option>
            <option value="freeimage">Freeimage.host (الاحتياطي)</option>
          </select>
        </div>
      </div>

      {/* Upload area */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <ImageUploader images={images} onChange={setImages} />
      </div>

      {/* Grid view with URL copy */}
      {filteredImages.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground">الصور المرفوعة مؤخراً</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                className="rounded-xl border border-border bg-card overflow-hidden group shadow-xs"
              >
                <div className="aspect-square relative bg-muted">
                  <img src={img.src} alt="Uploaded" className="h-full w-full object-cover" />
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/70 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-mono text-white">
                    {img.provider}
                  </span>
                </div>
                <div className="p-2 flex items-center justify-between bg-card text-xs">
                  <button
                    onClick={() => handleCopy(img.id, img.src)}
                    className="flex items-center space-x-1 space-x-reverse text-[11px] font-bold text-brand hover:underline"
                  >
                    {copiedId === img.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-success" />
                        <span className="text-success">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
