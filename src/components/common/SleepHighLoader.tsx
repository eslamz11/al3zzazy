import { Moon } from "lucide-react";
import { useT } from "@/lib/locale";

interface SleepHighLoaderProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function SleepHighLoader({
  fullScreen = false,
  size = "md",
  label,
  className = "",
}: SleepHighLoaderProps) {
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

  const content = (
    <div
      className={`flex flex-col items-center justify-center text-center ${containerSizes[size]} ${className}`}
    >
      {/* Brand Icon/Logo Box with soft pulsing glow */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#c8102e]/20 blur-xl animate-pulse" />
        <div className="relative bg-white p-3 rounded-2xl border border-gray-100 shadow-md flex items-center justify-center space-x-2 space-x-reverse">
          <img
            src="https://sleephigh-eg.myshopify.com/cdn/shop/files/h_logo_250x.png?v=1697100417"
            alt="سليب هاي SLEEP HIGH"
            className={`${logoSizes[size]} object-contain animate-pulse`}
          />
          <Moon className="h-4 w-4 text-[#c8102e] animate-bounce" />
        </div>
      </div>

      {/* Subtle indicator line */}
      <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-[#c8102e] via-[#e63950] to-[#c8102e] rounded-full animate-[shimmer_1.5s_infinite]" />
      </div>

      {/* Calm label */}
           {loaderLabel && (
         <p className="text-xs md:text-sm font-bold text-gray-600 tracking-tight animate-pulse">
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
