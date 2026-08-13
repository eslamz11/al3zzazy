import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ImageOff } from "lucide-react";

type ObjectFit = "cover" | "contain";

interface SmartImageProps {
  src: string | undefined | null;
  alt: string;
  /** Fallback URL tried once if `src` fails. */
  fallbackSrc?: string;
  /** Reserve space with a CSS aspect-ratio (e.g. "4 / 3"), preventing layout shift. */
  aspectRatio?: string;
  /** Absolutely fill the nearest positioned ancestor (for hero/background images). */
  fill?: boolean;
  /** Above-the-fold image: load eagerly with high priority. */
  priority?: boolean;
  objectFit?: ObjectFit;
  sizes?: string;
  width?: number;
  height?: number;
  /** Classes for the wrapper element. */
  className?: string;
  /** Classes for the <img> element (e.g. hover transforms). */
  imgClassName?: string;
  /** Background color while loading / on error (defaults to the muted token). */
  placeholderClassName?: string;
  onLoad?: () => void;
}

/**
 * Resilient image for external/CDN sources.
 *
 * - Reserves space (via `aspectRatio` or `fill`) so images can't shift layout.
 * - Shows a shimmering skeleton until the image decodes, then fades it in.
 * - Falls back gracefully on error and renders a branded placeholder instead of
 *   the browser's broken-image icon — a failed external image never blocks or
 *   uglifies the page.
 * - Lazy-loads by default; pass `priority` for above-the-fold images.
 * - Relies on the browser's built-in dedup of identical URLs (no extra request).
 */
export function SmartImage({
  src,
  alt,
  fallbackSrc,
  aspectRatio,
  fill = false,
  priority = false,
  objectFit = "cover",
  sizes,
  width,
  height,
  className = "",
  imgClassName = "",
  placeholderClassName = "",
  onLoad,
}: SmartImageProps) {
  const initialSrc = src || fallbackSrc || "";
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    initialSrc ? "loading" : "error",
  );
  const triedFallback = useRef(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset when the source prop changes (e.g. slider swaps images).
  useEffect(() => {
    const next = src || fallbackSrc || "";
    triedFallback.current = false;
    setCurrentSrc(next);
    setStatus(next ? "loading" : "error");
  }, [src, fallbackSrc]);

  // Images restored from cache may already be complete before React attaches
  // the onLoad handler — detect that so the skeleton doesn't linger.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setStatus("loaded");
      onLoad?.();
    }
    // Only needs to run when the resolved source changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSrc]);

  const handleError = () => {
    if (!triedFallback.current && fallbackSrc && currentSrc !== fallbackSrc) {
      triedFallback.current = true;
      setCurrentSrc(fallbackSrc);
      setStatus("loading");
      return;
    }
    setStatus("error");
  };

  const positioned = fill || !!aspectRatio;
  const wrapperStyle: CSSProperties = {};
  if (aspectRatio && !fill) wrapperStyle.aspectRatio = aspectRatio;

  const wrapperClass = [
    fill ? "absolute inset-0" : "relative",
    "overflow-hidden",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const imgClass = [
    positioned ? "absolute inset-0 h-full w-full" : "block h-full w-full",
    objectFit === "contain" ? "object-contain" : "object-cover",
    "shg-img",
    status === "loaded" ? "shg-img--ready" : "",
    imgClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      {status !== "error" && currentSrc ? (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          {...(width ? { width } : {})}
          {...(height ? { height } : {})}
          {...(sizes ? { sizes } : {})}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className={imgClass}
          onLoad={() => {
            setStatus("loaded");
            onLoad?.();
          }}
          onError={handleError}
        />
      ) : null}

      {/* Loading skeleton */}
      {status === "loading" && (
        <div
          aria-hidden="true"
          className={`shg-skel absolute inset-0 ${placeholderClassName}`}
        />
      )}

      {/* Graceful error placeholder — never a broken-image icon */}
      {status === "error" && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 flex items-center justify-center bg-muted ${placeholderClassName}`}
        >
          <ImageOff className="h-6 w-6 text-muted-foreground/40" />
        </div>
      )}
    </div>
  );
}
