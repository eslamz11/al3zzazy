/**
 * Server-side Image Upload Handler.
 * Executes on the server / Cloudflare worker.
 * Reads IMGBB_API_KEY & FREEIMAGE_API_KEY from environment variables / secrets.
 * Implements fallback: ImgBB -> Freeimage.host -> Error.
 * NEVER exposes API keys to client JavaScript.
 */

export interface ImageUploadResponse {
  url: string;
  provider: "imgbb" | "freeimage";
  originalName: string;
  mimeType: string;
  size: number;
}

/**
 * Upload image to ImgBB (Primary Provider).
 * API Endpoint: https://api.imgbb.com/1/upload
 */
async function uploadToImgBB(
  fileBuffer: ArrayBuffer,
  fileName: string,
  apiKey: string,
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("key", apiKey);
    formData.append("image", new Blob([fileBuffer]), fileName);

    const res = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error(`[ImgBB] Upload failed with status ${res.status}`);
      return null;
    }

    const data = (await res.json()) as {
      success?: boolean;
      data?: { url?: string; display_url?: string };
    };

    if (data.success && data.data?.url) {
      return data.data.url;
    }
    return null;
  } catch (err) {
    console.error("[ImgBB] Error:", err);
    return null;
  }
}

/**
 * Upload image to Freeimage.host (Fallback Provider).
 * API Endpoint: https://freeimage.host/api/1/upload/
 */
async function uploadToFreeimage(
  fileBuffer: ArrayBuffer,
  fileName: string,
  apiKey: string,
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("key", apiKey);
    formData.append("action", "upload");
    formData.append("source", new Blob([fileBuffer]), fileName);
    formData.append("format", "json");

    const res = await fetch("https://freeimage.host/api/1/upload/", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error(`[Freeimage] Upload failed with status ${res.status}`);
      return null;
    }

    const data = (await res.json()) as {
      status_code?: number;
      image?: { url?: string; display_url?: string };
    };

    if ((data.status_code === 200 || data.image) && data.image?.url) {
      return data.image.url;
    }
    return null;
  } catch (err) {
    console.error("[Freeimage] Error:", err);
    return null;
  }
}

/**
 * Main server handler for processing multipart image upload.
 */
export async function processImageUpload(
  request: Request,
  env?: Record<string, string>,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get environment variables (supports Node process.env & Cloudflare env)
    const imgbbKey =
      env?.["IMGBB_API_KEY"] ||
      (typeof process !== "undefined" ? process.env?.["IMGBB_API_KEY"] : "") ||
      "4928381d580067cef94fe8759d7cf536";
    const freeimageKey =
      env?.["FREEIMAGE_API_KEY"] ||
      (typeof process !== "undefined" ? process.env?.["FREEIMAGE_API_KEY"] : "") ||
      "6d207e02198a847aa98d0a2a901485a5";

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({
          error: "Invalid content type",
          arabicError: "طلب غير صالح.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const originalName = (formData.get("originalName") as string) || file?.name || "image.jpg";

    if (!file || typeof file === "string") {
      return new Response(
        JSON.stringify({
          error: "No image file provided",
          arabicError: "لم يتم تقديم أي صورة.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const fileBuffer = await file.arrayBuffer();

    // 1. Try ImgBB (Primary)
    if (imgbbKey) {
      const imgbbUrl = await uploadToImgBB(fileBuffer, originalName, imgbbKey);
      if (imgbbUrl) {
        const result: ImageUploadResponse = {
          url: imgbbUrl,
          provider: "imgbb",
          originalName,
          mimeType: file.type || "image/jpeg",
          size: file.size,
        };
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      console.warn("[Upload] IMGBB_API_KEY is missing, trying fallback...");
    }

    // 2. Try Freeimage.host (Fallback)
    if (freeimageKey) {
      const freeimageUrl = await uploadToFreeimage(fileBuffer, originalName, freeimageKey);
      if (freeimageUrl) {
        const result: ImageUploadResponse = {
          url: freeimageUrl,
          provider: "freeimage",
          originalName,
          mimeType: file.type || "image/jpeg",
          size: file.size,
        };
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      console.warn("[Upload] FREEIMAGE_API_KEY is missing.");
    }

    // 3. Both failed
    return new Response(
      JSON.stringify({
        error: "All image providers failed to upload.",
        arabicError: "تعذر رفع الصورة. حاول مرة أخرى.",
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[Upload] Server error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        arabicError: "حدث خطأ في الخادم أثناء رفع الصورة.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
