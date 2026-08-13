const memory = new Map<string, string>();

function hasWindow() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = hasWindow() ? window.localStorage.getItem(key) : (memory.get(key) ?? null);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    const raw = JSON.stringify(value);
    if (hasWindow()) window.localStorage.setItem(key, raw);
    else memory.set(key, raw);
  } catch {
    /* storage unavailable — ignore */
  }
}

export function readString(key: string): string | null {
  try {
    return hasWindow() ? window.localStorage.getItem(key) : (memory.get(key) ?? null);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string) {
  try {
    if (hasWindow()) window.localStorage.setItem(key, value);
    else memory.set(key, value);
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEYS = {
  cart: "sh.cart.v1",
  wishlist: "sh.wishlist.v1",
  locale: "sh.locale.v1",
  session: "sh.session.v1",
  orders: "sh.orders.v1",
  users: "sh.users.v1",
} as const;
