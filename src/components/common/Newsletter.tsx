import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/locale";

const schema = z.object({ email: z.string().trim().email().max(255) });

export function Newsletter() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setState("error");
      return;
    }
    setState("loading");
    window.setTimeout(() => {
      setState("success");
      setEmail("");
    }, 500);
  };

  return (
    <section className="bg-surface-secondary">
      <div className="container-page section-y">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="fluid-h2 text-foreground">{t("newsletter.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("newsletter.text")}
          </p>
          <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row" noValidate>
            <div className="min-w-0 flex-1 text-start">
              <label htmlFor="newsletter-email" className="sr-only">
                {t("newsletter.placeholder")}
              </label>
              <Input
                id="newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state !== "idle") setState("idle");
                }}
                placeholder={t("newsletter.placeholder")}
                aria-invalid={state === "error"}
                aria-describedby="newsletter-status"
                className="h-12 bg-surface"
              />
            </div>
            <Button
              type="submit"
              disabled={state === "loading"}
              className="h-12 shrink-0 bg-brand px-8 text-brand-foreground hover:bg-brand-hover"
            >
              {state === "loading" ? t("form.sending") : t("newsletter.cta")}
            </Button>
          </form>
          <p
            id="newsletter-status"
            role="status"
            aria-live="polite"
            className="mt-3 min-h-5 text-sm"
          >
            {state === "success" ? (
              <span className="text-success">{t("newsletter.success")}</span>
            ) : state === "error" ? (
              <span className="text-destructive">{t("newsletter.error")}</span>
            ) : null}
          </p>
        </div>
      </div>
    </section>
  );
}
