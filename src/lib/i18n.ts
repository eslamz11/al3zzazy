import type { Locale } from "./types";
import { dict, type TranslationKey } from "./translations";

export const LOCALES: Locale[] = ["ar", "en"];
export const DEFAULT_LOCALE: Locale = "ar";

export function isLocale(value: string | undefined): value is Locale {
  return value === "ar" || value === "en";
}

export function dirFor(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export type { TranslationKey };
export { dict };

/** Values that can be interpolated into a translation string. */
export type TranslationParams = Record<string, string | number>;

function interpolate(template: string, params?: TranslationParams) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

export function t(locale: Locale, key: TranslationKey, params?: TranslationParams): string {
  const entry = dict[key];
  if (!entry) {
    if (import.meta.env?.DEV) console.warn(`[i18n] missing translation key: ${key}`);
    return key;
  }
  return interpolate(entry[locale] ?? entry[DEFAULT_LOCALE], params);
}

export type Translate = (key: TranslationKey, params?: TranslationParams) => string;

export function translator(locale: Locale): Translate {
  return (key, params) => t(locale, key, params);
}
