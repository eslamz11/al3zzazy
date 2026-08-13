/**
 * Initial-load coordinator.
 *
 * Renders a full-page branded preloader (<AppLoadingScreen />) that is present
 * in the very first server-rendered HTML, so it covers the app before hydration
 * and before any external image loads — the user never sees a half-built layout.
 *
 * The preloader is driven by the *real* readiness of the app, not a timer:
 *   1. React has mounted/hydrated on the client.
 *   2. Web fonts are ready (soft gate, so text doesn't reflow).
 *   3. Every registered critical "hold" has been released. The homepage holds
 *      the loader until its hero image has actually decoded (see useInitialLoadGate).
 *
 * Safety rails so it can NEVER get stuck:
 *   - A hard global timeout force-reveals regardless of outstanding holds.
 *   - Fonts have their own short timeout.
 *   - Holds auto-release on unmount.
 *
 * It only runs for the initial application load. Once revealed, a module-level
 * flag keeps it from ever showing again for client-side navigations.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppLoadingScreen } from "@/components/common/AppLoadingScreen";

/** True once the initial load has finished for this page session (per tab). */
let initialLoadComplete = false;

/** Hard ceiling — the loader is force-dismissed after this even if a critical
 *  asset never resolves, so a slow/failed external image can't block the site. */
const SAFETY_TIMEOUT_MS = 7000;
/** Fonts are a soft gate; don't let them hold the reveal for long. */
const FONTS_TIMEOUT_MS = 1500;
/** Minimum time the splash stays up, to avoid an ugly flash on fast loads. */
const MIN_VISIBLE_MS = 350;
/** Must match the CSS exit transition on `.shg-splash`. */
const REVEAL_MS = 640;

type Phase = "loading" | "leaving" | "done";

interface InitialLoadContextValue {
  /** Register a critical hold. Returns a release fn (idempotent). */
  registerHold: () => () => void;
  /** Whether the initial load has fully completed. */
  isComplete: boolean;
}

const InitialLoadContext = createContext<InitialLoadContextValue | null>(null);

/**
 * Register a critical asset gate for the initial load.
 *
 * On first mount it places a "hold" that keeps the preloader visible; call the
 * returned `done()` once your critical content (e.g. the hero image) is ready.
 * The hold is released automatically on unmount and is a no-op after the initial
 * load has already completed — so it never gates client-side navigation.
 *
 * @param enabled pass `false` to skip gating entirely for this mount.
 */
export function useInitialLoadGate(enabled = true): { done: () => void } {
  const ctx = useContext(InitialLoadContext);
  const releaseRef = useRef<(() => void) | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!enabled || !ctx || initialLoadComplete) return;
    const release = ctx.registerHold();
    releaseRef.current = release;
    return () => release();
    // `ctx.registerHold` is stable; re-run only when `enabled` flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const done = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    releaseRef.current?.();
  }, []);

  return { done };
}

export function InitialLoadProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>(initialLoadComplete ? "done" : "loading");
  const [holds, setHolds] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const startedAtRef = useRef(0);

  const registerHold = useCallback(() => {
    setHolds((h) => h + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      setHolds((h) => Math.max(0, h - 1));
    };
  }, []);

  const beginReveal = useCallback(() => {
    setPhase((prev) => (prev === "loading" ? "leaving" : prev));
  }, []);

  // Mount, fonts gate, and the hard safety timeout (client only).
  useEffect(() => {
    if (initialLoadComplete) return;
    startedAtRef.current =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    setMounted(true);

    let fontsSettled = false;
    const markFonts = () => {
      if (fontsSettled) return;
      fontsSettled = true;
      setFontsReady(true);
    };
    const fontSet = typeof document !== "undefined" ? (document as Document).fonts : undefined;
    if (fontSet?.ready) {
      fontSet.ready.then(markFonts).catch(markFonts);
    } else {
      markFonts();
    }
    const fontsTimer = window.setTimeout(markFonts, FONTS_TIMEOUT_MS);
    const safetyTimer = window.setTimeout(beginReveal, SAFETY_TIMEOUT_MS);

    return () => {
      window.clearTimeout(fontsTimer);
      window.clearTimeout(safetyTimer);
    };
  }, [beginReveal]);

  // Reveal as soon as everything critical is ready (respecting min visible time).
  useEffect(() => {
    if (initialLoadComplete || phase !== "loading") return;
    if (!(mounted && fontsReady && holds === 0)) return;
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const elapsed = now - startedAtRef.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const timer = window.setTimeout(beginReveal, wait);
    return () => window.clearTimeout(timer);
  }, [mounted, fontsReady, holds, phase, beginReveal]);

  // After the exit animation, unmount the splash for good.
  useEffect(() => {
    if (phase !== "leaving") return;
    const timer = window.setTimeout(() => {
      initialLoadComplete = true;
      setPhase("done");
    }, REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // Lock page scroll while the splash fully covers the viewport.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (phase !== "loading") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  return (
    <InitialLoadContext.Provider value={{ registerHold, isComplete: phase === "done" }}>
      {children}
      {phase !== "done" && <AppLoadingScreen leaving={phase === "leaving"} />}
    </InitialLoadContext.Provider>
  );
}
