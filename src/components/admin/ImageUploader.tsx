import { useState, useRef } from "react";
import {
  Upload,
  X,
  Star,
  MoveUp,
  MoveDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Plus,
} from "lucide-react";
import {
  uploadMultipleImages,
  type UploadProgress,
} from "@/lib/services/firebase/imageUploadService";
import type { ProductImage } from "@/lib/types";

export interface ManagedImage extends ProductImage {
  id: string;
  provider: string;
  isPrimary: boolean;
}

interface ImageUploaderProps {
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    setError(null);
    setStatusMessage("جاري رفع الصورة...");
    setProgress(0);

    const { results, successCount } = await uploadMultipleImages(
      fileArray,
      (_idx: number, p: UploadProgress) => {
        setProgress(p.percent);
      },
    );

    const newImages: ManagedImage[] = [];

    results.forEach((res, i) => {
      if (res.ok) {
        newImages.push({
          id: `img-${Date.now()}-${i}`,
          src: res.image.url,
          provider: res.image.provider,
          alt: { ar: "صورة المنتج", en: "Product image" },
          isPrimary: images.length === 0 && newImages.length === 0,
        });
      }
    });

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
      setStatusMessage(`تم رفع ${successCount} صورة بنجاح.`);
      setTimeout(() => setStatusMessage(null), 4000);
    }

    if (successCount < fileArray.length) {
      setError("تعذر رفع بعض الصور. حاول مرة أخرى.");
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0]!.isPrimary = true;
    }
    onChange(updated);
  };

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (
      !url.startsWith("http://") &&
      !url.startsWith("https://") &&
      !url.startsWith("data:image/")
    ) {
      setError("الرجاء إدخال رابط صورة صحيح يبدأ بـ http:// أو https://");
      return;
    }
    const newImg: ManagedImage = {
      id: `img-url-${Date.now()}`,
      src: url,
      provider: "external",
      alt: { ar: "صورة المنتج", en: "Product image" },
      isPrimary: images.length === 0,
    };
    onChange([...images, newImg]);
    setUrlInput("");
    setError(null);
    setStatusMessage("تم إضافة الصورة عبر الرابط بنجاح.");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    const copy = [...images];
    const temp = copy[index]!;
    copy[index] = copy[newIdx]!;
    copy[newIdx] = temp;
    onChange(copy);
  };

  return (
    <div className="space-y-4 dir-rtl">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-foreground">صور المنتج ({images.length})</label>
        <span className="text-[11px] text-muted-foreground">رفع ملـف أو لصق رابط مباشر</span>
      </div>

      {/* Drag & Drop Target */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          uploading
            ? "border-brand/50 bg-brand/5"
            : "border-border hover:border-brand hover:bg-accent/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand mb-3">
          <Upload className="h-6 w-6" />
        </div>

        <p className="text-xs font-semibold text-foreground">
          اضغط هنا لاختيار الصور أو قم بسحبها وإفلاتها هنا
        </p>
        <p className="text-[11px] text-muted-foreground mt-1">
          يتم رفع الصور تلقائياً عبر ملقم ImgBB / FreeImage السحابي
        </p>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-4 w-full max-w-xs space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-foreground">
              <span>جاري رفع الصورة...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-brand transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Direct Image URL Input Option */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="أو ألصق رابط الصورة مباشرة هنا (https://example.com/image.jpg)..."
            className="w-full rounded-xl border border-input bg-background pr-9 pl-3 py-2 text-xs focus:border-brand outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-brand-foreground shadow-xs hover:bg-brand/90 disabled:opacity-40 transition-colors min-h-[38px]"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة الرابط</span>
        </button>
      </div>

      {/* Status & Error Feedback */}
      {statusMessage && (
        <div className="flex items-center space-x-2 space-x-reverse rounded-lg bg-success/15 p-3 text-xs text-success-foreground font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 space-x-reverse rounded-lg bg-destructive/15 p-3 text-xs text-destructive font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Images Grid & Reorder List */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-4">
          {images.map((img, idx) => (
            <div
              key={img.id || idx}
              className={`group relative rounded-xl border bg-card overflow-hidden transition-all shadow-xs ${
                img.isPrimary ? "border-brand ring-2 ring-brand/20" : "border-border"
              }`}
            >
              <div className="aspect-square relative bg-muted">
                <img
                  src={img.src}
                  alt={img.alt.ar || `صورة ${idx + 1}`}
                  className="h-full w-full object-cover"
                />

                {/* Primary Badge */}
                {img.isPrimary && (
                  <span className="absolute top-2 right-2 rounded-md bg-brand px-2 py-0.5 text-[10px] font-bold text-brand-foreground shadow-xs">
                    الصورة الرئيسية
                  </span>
                )}

                {/* Provider Tag */}
                <span className="absolute bottom-2 right-2 rounded-md bg-black/60 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-mono text-white">
                  {img.provider}
                </span>

                {/* Controls overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1.5 space-x-reverse">
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      title="تعيين كصورة رئيسية"
                      className="rounded-lg bg-card/90 p-1.5 text-foreground hover:bg-card hover:text-brand"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleMove(idx, "up")}
                    disabled={idx === 0}
                    title="تحريك لأعلى"
                    className="rounded-lg bg-card/90 p-1.5 text-foreground hover:bg-card disabled:opacity-30"
                  >
                    <MoveUp className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMove(idx, "down")}
                    disabled={idx === images.length - 1}
                    title="تحريك لأسفل"
                    className="rounded-lg bg-card/90 p-1.5 text-foreground hover:bg-card disabled:opacity-30"
                  >
                    <MoveDown className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    title="حذف الصورة"
                    className="rounded-lg bg-destructive p-1.5 text-destructive-foreground hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
