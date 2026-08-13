import { t } from "./i18n";
import type { Locale, Localized, Product, VariantOptionValues } from "./types";

/**
 * Read a localized value, falling back to the other locale when a translation is
 * missing. Database content is often Arabic-only, so we must never render an
 * empty string just because the English field has not been filled in yet.
 */
export function pickLocalized(value: Localized | undefined | null, locale: Locale): string {
  if (!value) return "";
  const preferred = value[locale];
  if (preferred && preferred.trim().length > 0) return preferred;
  const fallback = locale === "ar" ? value.en : value.ar;
  return fallback ?? "";
}

/** Backwards-compatible alias used across the codebase. */
export function pick(value: Localized, locale: Locale) {
  return pickLocalized(value, locale);
}

/**
 * Read a pair of `<field>Ar` / `<field>En` properties (the shape Firestore
 * documents use) and fall back to the populated one.
 */
export function pickLocalizedField(
  source: Record<string, unknown> | undefined | null,
  field: string,
  locale: Locale,
): string {
  if (!source) return "";
  const ar = typeof source[`${field}Ar`] === "string" ? (source[`${field}Ar`] as string) : "";
  const en = typeof source[`${field}En`] === "string" ? (source[`${field}En`] as string) : "";
  const preferred = locale === "ar" ? ar : en;
  if (preferred && preferred.trim().length > 0) return preferred;
  return (locale === "ar" ? en : ar) ?? "";
}

/** Egyptian pound formatting. Arabic uses Arabic-Indic digits + ج.م, English uses EGP. */
export function formatPrice(amount: number, locale: Locale) {
  if (locale === "ar") {
    const digits = new Intl.NumberFormat("ar-EG", {
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
    return `${digits} ج.م`;
  }
  const digits = new Intl.NumberFormat("en-EG", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `${digits} EGP`;
}

export function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(value);
}

export function formatDate(iso: string, locale: Locale) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatShortDate(iso: string, locale: Locale) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB").format(date);
}

export function formatDateTime(iso: string, locale: Locale) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function discountPercent(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** Well-known variant option keys that have a translated label. */
const OPTION_LABEL_KEYS = {
  length: "option.length",
  width: "option.width",
  height: "option.height",
  size: "option.size",
  color: "option.color",
  colour: "option.color",
  upgrade: "option.upgrade",
} as const;

function optionKeyLabel(key: string, locale: Locale) {
  const dictKey = OPTION_LABEL_KEYS[key.toLowerCase() as keyof typeof OPTION_LABEL_KEYS];
  return dictKey ? t(locale, dictKey) : key;
}

/**
 * Human-readable variant summary (e.g. "Length: 195 · Width: 150").
 *
 * When the parent product is available we use its own localized option labels
 * and value labels; otherwise (order history) we fall back to the known keys.
 */
export function formatVariantOptions(
  options: VariantOptionValues | undefined,
  locale: Locale,
  product?: Product | null,
  separator = " · ",
): string {
  if (!options) return "";
  const entries = Object.entries(options).filter(([, value]) => value !== undefined && value !== "");
  if (entries.length === 0) return "";

  return entries
    .map(([key, value]) => {
      const productOption = product?.options?.find((option) => option.key === key);
      const label = productOption
        ? pickLocalized(productOption.label, locale)
        : optionKeyLabel(key, locale);
      const valueOption = productOption?.values.find((candidate) => candidate.value === value);
      const valueLabel = valueOption ? pickLocalized(valueOption.label, locale) : value;
      return label ? `${label}: ${valueLabel}` : valueLabel;
    })
    .join(separator);
}

/** Compact variant summary used where labels would be too long (order lines). */
export function formatVariantValues(
  options: VariantOptionValues | undefined,
  locale: Locale,
  product?: Product | null,
  separator = " - ",
): string {
  if (!options) return "";
  return Object.entries(options)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => {
      const productOption = product?.options?.find((option) => option.key === key);
      const valueOption = productOption?.values.find((candidate) => candidate.value === value);
      return valueOption ? pickLocalized(valueOption.label, locale) : value;
    })
    .join(separator);
}
