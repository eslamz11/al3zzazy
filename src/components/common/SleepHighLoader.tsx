import { Sparkles } from "lucide-react";
import { useT } from "@/lib/locale";

interface Al3azzazyLoaderProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function Al3azzazyLoader({
  fullScreen = false,
  size = "md",
  label,
  className = "",
}: Al3azzazyLoaderProps) {
  const t = useT();
  const loaderLabel = label || t("common.loading");
  const logoSizes = {
    sm: "h-6 w-auto",
    md: "h-10 w-auto",
    lg: "h-14 w-auto",
  };

  const containerSizes = {
    sm: "p-4 space-y-2",
    md: "p-6 space-y-3",
    lg: "p-8 space-y-4",
  };

  const storeLogo = "https://i.ibb.co/Z5Sxv6K/Chat-GPT-Image-Aug-13-2026-06-46-12-PM.png";

  const content = (
    <div
      className={`flex flex-col items-center justify-center text-center ${containerSizes[size]} ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-xl animate-pulse" />
        <div className="relative bg-white p-3 rounded-2xl border border-sky-100 shadow-md flex items-center justify-center space-x-2 space-x-reverse">
          <img
            src={storeLogo}
            alt="العزازي مول Al3azzazy"
            className={`${logoSizes[size]} object-contain animate-pulse`}
          />
          <Sparkles className="h-4 w-4 text-amber-500 animate-bounce" />
        </div>
      </div>

      <div className="w-24 h-1 bg-sky-100 rounded-full overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-sky-500 via-amber-400 to-sky-500 rounded-full animate-[shimmer_1.5s_infinite]" />
      </div>

      {loaderLabel && (
        <p className="text-xs md:text-sm font-bold text-slate-600 tracking-tight animate-pulse">
          {loaderLabel}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md transition-opacity">
        {content}
      </div>
    );
  }

  return content;
}
