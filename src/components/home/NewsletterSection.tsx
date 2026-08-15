import { useState } from "react";
import { CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { submitSiteMessage } from "@/lib/services/firebase/messageService";
import { useT } from "@/lib/locale";

/** Email capture that records a site message and celebrates on success. */
export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const t = useT();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    const res = await submitSiteMessage({
      name: t("home.newsletterSubscriber"),
      phone: t("home.newsletterUnavailable"),
      email: email,
      subject: t("home.newsletterSubject"),
      message: t("home.newsletterBody", { email }),
    });

    if (res.ok) {
      setStatus("success");
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0284c7", "#eab308", "#ffffff"],
      });
    } else {
      setStatus("error");
    }
  };

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-[64px] md:py-24">
      <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-xl md:flex-row md:p-16">
        <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative z-10 text-center md:w-1/2 md:text-start">
          <h3 className="mb-4 text-3xl font-extrabold text-white md:text-4xl">
            {t("home.newsletterTitle")}
          </h3>
          <p className="text-base text-slate-100 md:text-lg">{t("home.newsletterText")}</p>
        </div>
        <div className="relative z-10 w-full md:w-1/2">
          {status === "success" ? (
            <div className="flex animate-in flex-col items-center justify-center space-y-4 rounded-2xl border border-brand/20 bg-brand/10 p-8 duration-500 fade-in zoom-in">
              <CheckCircle className="h-16 w-16 text-brand" />
              <h4 className="text-center text-2xl font-bold text-white">
                {t("home.newsletterSuccessTitle")}
              </h4>
              <p className="text-center text-lg text-slate-200">
                {t("home.newsletterSuccessText")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                className="min-h-12 flex-grow rounded-xl bg-white px-6 py-4 text-start font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-70"
                placeholder={t("home.newsletterPlaceholder")}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="min-h-12 whitespace-nowrap rounded-xl bg-brand px-8 py-4 font-bold text-brand-foreground shadow-lg shadow-brand/20 transition-all duration-300 hover:bg-brand-hover disabled:opacity-70"
              >
                {status === "loading" ? t("home.newsletterSubmitting") : t("home.newsletterSubmit")}
              </button>
            </form>
          )}
          {status === "error" ? (
            <p className="mt-3 text-center text-sm text-brand-yellow md:text-start">
              {t("home.newsletterError")}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
