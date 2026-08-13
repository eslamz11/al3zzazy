/**
 * Google Identity Services (GIS) helpers.
 *
 * Provides a single, reusable integration point for Google One Tap and the
 * official "Sign in with Google" button. The credential (a Google ID token)
 * returned here is handed to Firebase `signInWithCredential`, which verifies
 * the token server-side and mints the normal Firebase session.
 *
 * Why GIS (and not only signInWithPopup): the popup flow relies on the
 * `*.firebaseapp.com/__/auth/handler` cross-domain page + third-party cookies,
 * which mobile browsers (iOS ITP, Android Chrome) block — so popup sign-in
 * fails on mobile. GIS returns the credential in-page (FedCM), no popup and no
 * cross-domain cookies, so it works reliably on mobile.
 *
 * The script is loaded once and GIS is initialized once (guarded singletons)
 * to avoid duplicate loads, initializations, prompts and callbacks.
 */

const GSI_SRC = "https://accounts.google.com/gsi/client";

/** Web OAuth 2.0 client ID (…apps.googleusercontent.com). Public, safe in the bundle. */
export const GOOGLE_CLIENT_ID = import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined;

export type GsiContext = "signin" | "signup" | "use";

interface GsiId {
  initialize(config: {
    client_id: string;
    callback: (resp: { credential?: string }) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
    itp_support?: boolean;
    context?: GsiContext;
  }): void;
  prompt(listener?: (notification: unknown) => void): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  cancel(): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GsiId } };
  }
}

type CredentialCallback = (idToken: string) => void;

let scriptPromise: Promise<GsiId | null> | null = null;

/** Load the GIS client script exactly once. Resolves to the `google.accounts.id` API (or null). */
function loadGis(): Promise<GsiId | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const done = () => resolve(window.google?.accounts?.id ?? null);
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      if (window.google?.accounts?.id) done();
      else existing.addEventListener("load", done, { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = done;
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  return scriptPromise;
}

let initialized = false;
// The active credential handler. Swapped on each init call so the most recently
// mounted panel receives the callback, but GIS itself is initialized only once.
let currentCallback: CredentialCallback | null = null;

/**
 * Ensure GIS is loaded and initialized. Safe to call repeatedly — the script
 * and `initialize()` run only once; later calls just update the active callback.
 * Returns the GIS API, or null when unavailable (no client ID / script blocked).
 */
export async function initGis(
  onCredential: CredentialCallback,
  context: GsiContext = "signin",
): Promise<GsiId | null> {
  currentCallback = onCredential;
  if (!GOOGLE_CLIENT_ID) return null;

  const id = await loadGis();
  if (!id) return null;

  if (!initialized) {
    id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resp) => {
        if (resp?.credential && currentCallback) currentCallback(resp.credential);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true,
      itp_support: true,
      context,
    });
    initialized = true;
  }
  return id;
}

let promptRequested = false;

/**
 * Attempt to display the One Tap prompt. Called at most once per page load.
 * If One Tap is not eligible (browser rules, dismissal, FedCM, active session)
 * GIS simply does not show it — that is expected, not an error.
 */
export function promptOneTap(): void {
  const id = window.google?.accounts?.id;
  if (!id || promptRequested) return;
  promptRequested = true;
  try {
    id.prompt();
  } catch {
    /* One Tap unavailable — the rendered button remains the fallback. */
  }
}

/** Render the official Google button into `el`. Returns false if GIS is unavailable. */
export function renderGoogleButton(
  el: HTMLElement,
  opts: { locale: string; text?: "signin_with" | "signup_with" | "continue_with" },
): boolean {
  const id = window.google?.accounts?.id;
  if (!id) return false;
  el.innerHTML = "";
  const width = Math.min(Math.round(el.clientWidth) || 320, 400);
  id.renderButton(el, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: opts.text ?? "continue_with",
    shape: "pill",
    logo_alignment: "left",
    locale: opts.locale,
    width,
  });
  return true;
}

/** Dismiss any open One Tap prompt (call on unmount). */
export function cancelOneTap(): void {
  try {
    window.google?.accounts?.id?.cancel();
  } catch {
    /* no-op */
  }
}
