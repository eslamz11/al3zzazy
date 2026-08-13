import type { TranslationKey } from "./i18n";

/**
 * Map the auth service error codes ("credentials", "exists", "popup_closed", …)
 * onto translation keys so login/register screens never show a raw code.
 */
const LOGIN_ERRORS: Record<string, TranslationKey> = {
  credentials: "auth.errorCredentials",
  popup_closed: "auth.errorPopupClosed",
  cancelled: "auth.errorPopupClosed",
  popup_blocked: "auth.errorPopupBlocked",
  google: "auth.errorGoogle",
  unknown: "auth.errorCredentials",
};

const REGISTER_ERRORS: Record<string, TranslationKey> = {
  exists: "auth.errorExists",
  weak_password: "auth.errorWeakPassword",
  popup_closed: "auth.errorPopupClosed",
  cancelled: "auth.errorPopupClosed",
  popup_blocked: "auth.errorPopupBlocked",
  google: "auth.errorGoogle",
  unknown: "auth.errorRegister",
};

const GOOGLE_ERRORS: Record<string, TranslationKey> = {
  popup_closed: "auth.errorPopupClosed",
  cancelled: "auth.errorPopupClosed",
  popup_blocked: "auth.errorPopupBlocked",
  unknown: "auth.errorGoogle",
};

export function loginErrorKey(code?: string): TranslationKey {
  return (code && LOGIN_ERRORS[code]) || "auth.errorCredentials";
}

export function registerErrorKey(code?: string): TranslationKey {
  return (code && REGISTER_ERRORS[code]) || "auth.errorRegister";
}

export function googleErrorKey(code?: string): TranslationKey {
  return (code && GOOGLE_ERRORS[code]) || "auth.errorGoogle";
}
