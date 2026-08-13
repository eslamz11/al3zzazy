import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useDir, useHref, useLocale } from "@/lib/locale";
import { useStore } from "@/lib/store";
import { LogIn, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleSignInPanel } from "@/components/auth/GoogleSignInPanel";

export const Route = createFileRoute("/$locale/account/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, user, hydrated } = useStore();
  const dir = useDir();
  const locale = useLocale();
  const href = useHref();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hydrated && user) {
      navigate({ to: href("/account") });
    }
  }, [hydrated, user, navigate, href]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await login(email, password);
    if (res.ok) {
      navigate({ to: href("/account") });
    } else {
      setError(res.error || "خطأ في تسجيل الدخول. تأكد من البريد وكلمة المرور.");
    }
    setLoading(false);
  };

  return (
    <div
      className={cn(
        "container-page py-16 flex items-center justify-center min-h-[70vh]",
        dir === "rtl" ? "dir-rtl" : "dir-ltr",
      )}
    >
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 rounded-full bg-brand/10 flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-brand" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {locale === "ar" ? "تسجيل الدخول" : "Sign In"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {locale === "ar"
              ? "مرحباً بعودتك! سجل الدخول لمتابعة طلباتك."
              : "Welcome back! Sign in to view and track your orders."}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20 text-center">
              {error}
            </div>
          )}

          {/* GOOGLE SIGN IN — One Tap + official button (popup/redirect fallback) */}
          <GoogleSignInPanel
            context="signin"
            disabled={loading}
            onSuccess={() => navigate({ to: href("/account") })}
            onError={setError}
          />

          <div className="relative flex items-center justify-center my-2">
            <div className="w-full border-t border-border" />
            <span className="absolute bg-card px-3 text-xs font-bold text-muted-foreground">
              {locale === "ar" ? "أو عبر البريد" : "or via email"}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-foreground">
                {locale === "ar" ? "البريد الإلكتروني" : "Email address"}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 dir-ltr"
                placeholder="example@mail.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-foreground">
                {locale === "ar" ? "كلمة المرور" : "Password"}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 dir-ltr"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-8 py-3.5 font-bold text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-50 mt-2 cursor-pointer"
            >
              <span>
                {loading
                  ? locale === "ar"
                    ? "جاري الدخول..."
                    : "Signing in..."
                  : locale === "ar"
                    ? "تسجيل الدخول"
                    : "Sign In"}
              </span>
            </button>
          </form>

          <div className="text-center text-sm pt-4 border-t border-border">
            <span className="text-muted-foreground">
              {locale === "ar" ? "ليس لديك حساب؟ " : "Don't have an account? "}
            </span>
            <Link
              to={href("/account/register")}
              className="font-bold text-brand hover:underline inline-flex items-center gap-1"
            >
              <span>{locale === "ar" ? "إنشاء حساب جديد" : "Create new account"}</span>
              {dir === "rtl" ? (
                <ArrowLeft className="h-3 w-3" />
              ) : (
                <ArrowRight className="h-3 w-3" />
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
