import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { signInAdmin } from "@/lib/services/firebase/adminAuthService";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "تسجيل دخول الأدمن | سليب هاي مصر" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setErrorMsg(null);

    const res = await signInAdmin(email, password);

    if (res.ok) {
      navigate({ to: "/admin" });
    } else {
      if (res.error === "credentials") {
        setErrorMsg("بيانات الدخول غير صحيحة.");
      } else if (res.error === "not_admin") {
        setErrorMsg("ليس لديك صلاحية الدخول إلى لوحة التحكم.");
      } else {
        setErrorMsg("حدث خطأ، حاول مرة أخرى.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 dir-rtl font-sans antialiased text-foreground">
      {/* Background soft glow */}
      <div className="absolute inset-0 bg-radial from-brand/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-brand-foreground font-extrabold text-2xl shadow-lg shadow-brand/20 mb-2">
            S
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            سليب هاي — لوحة التحكم
          </h1>
          <p className="text-xs text-muted-foreground">
            تسجيل الدخول الآمن لإدارة المتجر الإلكتروني
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl space-y-6">
          {errorMsg && (
            <div className="flex items-center space-x-2 space-x-reverse rounded-xl bg-destructive/10 p-3.5 text-xs font-semibold text-destructive border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Only Admin"
                  className="w-full rounded-xl border border-input bg-background pr-10 pl-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring dir-ltr"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background pr-10 pl-4 py-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring dir-ltr"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-brand py-3 text-xs font-bold text-brand-foreground hover:bg-brand-hover transition-colors shadow-md shadow-brand/10 disabled:opacity-50"
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-muted-foreground">
          نظام محمي بواسطة Firebase Authentication & Security Rules
        </p>
      </div>
    </div>
  );
}
