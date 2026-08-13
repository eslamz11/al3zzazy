import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEFAULT_LOCALE } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    let savedLocale = DEFAULT_LOCALE;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("Al3azzazy_locale");
      if (stored === "ar" || stored === "en") {
        savedLocale = stored;
      }
    }
    throw redirect({
      to: `/$locale`,
      params: { locale: savedLocale },
    });
  },
});
