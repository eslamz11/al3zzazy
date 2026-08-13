import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getHomepageSections } from "@/lib/services/firebase/homepageService";
import { useT, useDir, useLocalizedField } from "@/lib/locale";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const t = useT();
  const dir = useDir();
  const LF = useLocalizedField();

  useEffect(() => {
    getHomepageSections().then((sections) => {
      const barSection = sections.find((s) => s.id === "announcement_bar" && s.active);
      if (barSection) {
        setContent(barSection.content as Record<string, unknown>);
      } else {
        setVisible(false);
      }
    });
  }, []);

  // Locale-aware text: falls back to the other locale when one side is empty.
  const text = LF(content, "text");

  if (!visible) return null;

  return (
    <div
      dir={dir}
      className="bg-[#FFC700] text-black py-2.5 px-4 text-xs md:text-sm font-bold tracking-wide shadow-xs transition-all relative"
    >
      <div className="container-page flex items-center justify-center relative">
        <button
          onClick={() => setVisible(false)}
          className="absolute right-0 p-1 hover:bg-black/10 rounded-full transition-colors"
          aria-label={t("announce.close")}
        >
          <X className="h-4 w-4 text-black" />
        </button>
        <span className="text-center font-black">{text}</span>
      </div>
    </div>
  );
}
