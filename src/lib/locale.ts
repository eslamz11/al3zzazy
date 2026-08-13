import { useParams, useRouterState } from "@tanstack/react-router";
import { DEFAULT_LOCALE, isLocale, translator, type Translate } from "./i18n";
import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatPrice,
  formatShortDate,
  formatVariantOptions,
  formatVariantValues,
  pickLocalized,
  pickLocalizedField,
} from "./format";
import type { Locale, Localized, Product, VariantOptionValues } from "./types";

/** Current locale from the URL, falling back to Arabic. */
export function useLocale(): Locale {
  const params = useParams({ strict: false }) as { locale?: string };
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (isLocale(params.locale)) return params.locale;
  const segment = pathname.split("/").filter(Boolean)[0];
  return isLocale(segment) ? segment : DEFAULT_LOCALE;
}

export function useT(): Translate {
  const locale = useLocale();
  return translator(locale);
}

/**
 * Resolve a `Localized` value for the active locale, falling back to the other
 * locale when the requested translation is empty (common for CMS content).
 */
export function useLocalized() {
  const locale = useLocale();
  return (value: Localized | undefined | null) => pickLocalized(value, locale);
}

/**
 * Resolve Firestore-style `<field>Ar` / `<field>En` pairs for the active locale.
 */
export function useLocalizedField() {
  const locale = useLocale();
  return (source: Record<string, unknown> | undefined | null, field: string) =>
    pickLocalizedField(source, field, locale);
}

/** Locale-aware currency / number / date formatters. */
export function useFormatters() {
  const locale = useLocale();
  return {
    locale,
    price: (amount: number) => formatPrice(amount, locale),
    number: (value: number) => formatNumber(value, locale),
    date: (iso: string) => formatDate(iso, locale),
    shortDate: (iso: string) => formatShortDate(iso, locale),
    dateTime: (iso: string) => formatDateTime(iso, locale),
    variantOptions: (options: VariantOptionValues | undefined, product?: Product | null) =>
      formatVariantOptions(options, locale, product),
    variantValues: (options: VariantOptionValues | undefined, product?: Product | null) =>
      formatVariantValues(options, locale, product),
  };
}

/** Build a locale-prefixed href, e.g. href("/cart") -> "/ar/cart" */
export function localeHref(locale: Locale, path: string) {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

export function useHref() {
  const locale = useLocale();
  return (path: string) => localeHref(locale, path);
}

export function useDir(): "rtl" | "ltr" {
  const locale = useLocale();
  return locale === "ar" ? "rtl" : "ltr";
}

export function swapLocaleInPath(pathname: string, next: Locale) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length && isLocale(segments[0])) {
    segments[0] = next;
    return `/${segments.join("/")}`;
  }
  return `/${next}`;
}
