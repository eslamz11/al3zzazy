import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useDir, useHref, useLocale } from "@/lib/locale";
import { useStore } from "@/lib/store";
import { UserPlus, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleSignInPanel } from "@/components/auth/GoogleSignInPanel";

export const Route = createFileRoute("/$locale/account/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { register, user, hydrated } = useStore();
  const dir = useDir();
  const locale = useLocale();
  const href = useHref();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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

    const res = await register({ name, email, phone, password });
    if (res.ok) {
      navigate({ to: href("/account") });
    } else {
      setError(res.error || "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.");
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
            <UserPlus className="h-8 w-8 text-brand" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {locale === "ar" ? "حساب جديد" : "Create Account"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {locale === "ar"
              ? "أنشئ حساباً للوصول السريع وتتبع طلباتك."
              : "Create an account for fast checkout & tracking your orders."}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20 text-center">
              {error}
            </div>
          )}

          {/* GOOGLE SIGN UP — One Tap + official button (popup/redirect fallback) */}
          <GoogleSignInPanel
            context="signup"
            disabled={loading}
            onSuccess={() => navigate({ to: href("/account") })}
            onError={setError}
          />

          <div className="relative flex items-center justify-center my-2">
            <div className="w-full border-t border-border" />
            <span className="absolute bg-card px-3 text-xs font-bold text-muted-foreground">
              {locale === "ar" ? "أو أدخل بياناتك" : "or enter details"}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-foreground">
                {locale === "ar" ? "الاسم بالكامل" : "Full name"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-3"
                placeholder={locale === "ar" ? "أحمد محمد" : "John Doe"}
              />
            </div>

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
                {locale === "ar" ? "رقم الهاتف" : "Phone number"}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 dir-ltr"
                placeholder="01000000000"
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
                    ? "جاري إنشاء الحساب..."
                    : "Creating account..."
                  : locale === "ar"
                    ? "إنشاء حساب"
                    : "Create Account"}
              </span>
            </button>
          </form>

          <div className="text-center text-sm pt-4 border-t border-border">
            <span className="text-muted-foreground">
              {locale === "ar" ? "لديك حساب بالفعل؟ " : "Already have an account? "}
            </span>
            <Link
              to={href("/account/login")}
              className="font-bold text-brand hover:underline inline-flex items-center gap-1"
            >
              <span>{locale === "ar" ? "تسجيل الدخول" : "Sign In"}</span>
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
