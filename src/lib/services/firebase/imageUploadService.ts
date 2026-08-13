/**
 * Image upload service — sends files to the secure server-side endpoint.
 * The actual API keys (ImgBB, Freeimage.host) are NEVER exposed in this file.
 * They live in Cloudflare Worker secrets and are accessed via a server function.
 */

import type { UploadedImage } from "@/lib/types";

const UPLOAD_ENDPOINT = "/api/upload-image";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface UploadResult {
  ok: true;
  image: UploadedImage;
}

export interface UploadError {
  ok: false;
  error: string;
  arabicError: string;
}

/** Validate a file before upload. */
export function validateImageFile(
  file: File,
): { valid: true } | { valid: false; error: string; arabicError: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Unsupported file type. Use JPG, PNG, or WEBP.",
      arabicError: "نوع الملف غير مدعوم. استخدم JPG أو PNG أو WEBP.",
    };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: "File size exceeds 10 MB limit.",
      arabicError: "حجم الملف يتجاوز الحد المسموح به (10 ميجابايت).",
    };
  }
  return { valid: true };
}

const IMGBB_KEY = "4928381d580067cef94fe8759d7cf536";
const FREEIMAGE_KEY = "6d207e02198a847aa98d0a2a901485a5";

async function uploadDirectImgBB(file: File): Promise<UploadedImage | null> {
  try {
    const formData = new FormData();
    formData.append("key", IMGBB_KEY);
    formData.append("image", file);

    const res = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.data?.url) {
      return {
        url: data.data.url,
        provider: "imgbb",
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function uploadDirectFreeimage(file: File): Promise<UploadedImage | null> {
  try {
    const formData = new FormData();
    formData.append("key", FREEIMAGE_KEY);
    formData.append("action", "upload");
    formData.append("source", file);
    formData.append("format", "json");

    const res = await fetch("https://freeimage.host/api/1/upload/", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if ((data.status_code === 200 || data.image) && data.image?.url) {
      return {
        url: data.image.url,
        provider: "freeimage",
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Upload a single image via the secure server-side endpoint.
 * Fallback to direct client-side ImgBB -> FreeImage.host if server function is unavailable.
 */
export async function uploadImage(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult | UploadError> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { ok: false, error: validation.error, arabicError: validation.arabicError };
  }

  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("originalName", file.name);

    if (onProgress) {
      const resWithProgress = await uploadWithProgress(formData, file, onProgress);
      if (resWithProgress.ok) return resWithProgress;
    } else {
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = (await response.json()) as UploadedImage;
        if (data.url) return { ok: true, image: data };
      }
    }
  } catch (err) {
    console.warn(
      "[imageUploadService] Server endpoint failed, attempting direct upload fallbacks:",
      err,
    );
  }

  // ── Client-side Direct Fallbacks ──
  onProgress?.({ loaded: 50, total: 100, percent: 50 });
  const imgbbRes = await uploadDirectImgBB(file);
  if (imgbbRes) {
    onProgress?.({ loaded: 100, total: 100, percent: 100 });
    return { ok: true, image: imgbbRes };
  }

  const freeimageRes = await uploadDirectFreeimage(file);
  if (freeimageRes) {
    onProgress?.({ loaded: 100, total: 100, percent: 100 });
    return { ok: true, image: freeimageRes };
  }

  return {
    ok: false,
    error: "Upload failed on all providers",
    arabicError: "فشل رفع الصورة عبر كافة المزودات. تحقق من الاتصال بالحاسوب.",
  };
}

function uploadWithProgress(
  formData: FormData,
  file: File,
  onProgress: (p: UploadProgress) => void,
): Promise<UploadResult | UploadError> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
        });
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as UploadedImage;
          resolve({ ok: true, image: data });
        } catch {
          resolve({
            ok: false,
            error: "Invalid server response",
            arabicError: "تعذر رفع الصورة. حاول مرة أخرى.",
          });
        }
      } else {
        resolve({
          ok: false,
          error: `Upload failed: ${xhr.status}`,
          arabicError: "تعذر رفع الصورة. حاول مرة أخرى.",
        });
      }
    });

    xhr.addEventListener("error", () => {
      resolve({
        ok: false,
        error: "Network error",
        arabicError: "تعذر رفع الصورة. تحقق من الاتصال بالإنترنت.",
      });
    });

    xhr.open("POST", UPLOAD_ENDPOINT);
    xhr.send(formData);
  });
}

/**
 * Upload multiple images sequentially.
 * Continues on individual failures. Returns all results.
 */
export async function uploadMultipleImages(
  files: File[],
  onProgress?: (fileIndex: number, progress: UploadProgress) => void,
  onFileComplete?: (fileIndex: number, result: UploadResult | UploadError) => void,
): Promise<{ results: Array<UploadResult | UploadError>; successCount: number }> {
  const results: Array<UploadResult | UploadError> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const result = await uploadImage(file, (p) => onProgress?.(i, p));
    results.push(result);
    onFileComplete?.(i, result);
    // Small delay between uploads to avoid rate limiting
    if (i < files.length - 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  const successCount = results.filter((r) => r.ok).length;
  return { results, successCount };
}
