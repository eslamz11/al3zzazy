import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { User, KeyRound, Save, CheckCircle2, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/firebase";
import { updateUserProfile, resetPassword } from "@/lib/services/firebase/authService";

export const Route = createFileRoute("/admin/profile/")({
  component: AdminProfilePage,
});

function AdminProfilePage() {
  const currentUser = auth.currentUser;
  const [name, setName] = useState(currentUser?.displayName || "مدير النظام");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [passSent, setPassSent] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    await updateUserProfile(currentUser.uid, { name });
    setSaving(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    await resetPassword(currentUser.email);
    setPassSent(true);
    setTimeout(() => setPassSent(false), 4000);
  };

  return (
    <div className="space-y-6 text-foreground dir-rtl max-w-2xl mx-auto">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">الملف الشخصي للمدير</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          إدارة اسم العرض والأمان عبر Firebase Authentication
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center space-x-2 space-x-reverse rounded-xl bg-success/15 p-3 text-xs font-bold text-success">
          <CheckCircle2 className="h-4 w-4" />
          <span>تم تحديث الاسم بنجاح.</span>
        </div>
      )}

      {passSent && (
        <div className="flex items-center space-x-2 space-x-reverse rounded-xl bg-brand/15 p-3 text-xs font-bold text-brand">
          <CheckCircle2 className="h-4 w-4" />
          <span>تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div className="flex items-center space-x-4 space-x-reverse border-b border-border pb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/15 text-brand font-extrabold text-2xl">
            {currentUser?.email?.charAt(0).toUpperCase() || "A"}
          </div>

          <div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <h2 className="text-base font-bold text-foreground">
                {currentUser?.displayName || "مدير النظام"}
              </h2>
              <span className="inline-flex items-center space-x-1 space-x-reverse rounded-full bg-brand/15 px-2.5 py-0.5 text-[10px] font-bold text-brand">
                <ShieldCheck className="h-3 w-3" />
                <span>Admin</span>
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">{currentUser?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="font-bold block mb-1">اسم العرض (Display Name)</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">
              البريد الإلكتروني (غير قابل للتعديل المباشر)
            </label>
            <input
              type="email"
              disabled
              value={currentUser?.email || "sleephigh31@gmail.com"}
              className="w-full rounded-xl border border-input bg-muted px-3 py-2 text-xs dir-ltr cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-1.5 space-x-reverse rounded-xl bg-brand px-5 py-2 text-xs font-bold text-brand-foreground hover:bg-brand-hover transition-colors shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
          </button>
        </form>
      </div>

      {/* Security Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center space-x-2 space-x-reverse">
          <KeyRound className="h-4 w-4 text-brand" />
          <span>تغيير كلمة المرور الآمن</span>
        </h3>

        <p className="text-muted-foreground leading-relaxed">
          حفاظاً على الأمان الكامل، يتم تغيير كلمة المرور عبر رابط مباشر يرسل إلى البريد الإلكتروني
          المسجل. كلمات المرور لا تُخزن ولا يمكن الوصول إليها بصيغة نصية.
        </p>

        <button
          type="button"
          onClick={handlePasswordReset}
          className="rounded-xl border border-input bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-accent transition-colors"
        >
          إرسال رابط تغيير كلمة المرور إلى البريد
        </button>
      </div>
    </div>
  );
}
