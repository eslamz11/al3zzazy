import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Settings, Save, CheckCircle, AlertCircle, User, Phone } from "lucide-react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useT } from "@/lib/locale";

export const Route = createFileRoute("/$locale/account/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, updateProfile } = useStore();
  const t = useT();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError(t("settings.nameRequired"));
      return;
    }
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError(t("settings.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountLayout activeTab="settings">
      <div className="space-y-6">
         <h2 className="text-xl font-bold border-b border-border pb-4 flex items-center gap-2">
           <Settings className="h-5 w-5 text-brand" />
           {t("settings.title")}
         </h2>

        {success && (
          <div className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/30 p-4 text-green-700 dark:text-green-400 text-sm font-bold">
            <CheckCircle className="h-5 w-5 shrink-0" />
             {t("settings.updated")}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-destructive text-sm font-bold">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5"
        >
          <div className="space-y-1.5">
             <label className="text-sm font-bold text-foreground flex items-center gap-2">
               <User className="h-4 w-4 text-muted-foreground" />
               {t("settings.fullName")} <span className="text-destructive">*</span>
             </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
               placeholder={t("settings.fullNamePlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
             <label className="text-sm font-bold text-foreground flex items-center gap-2">
               <Phone className="h-4 w-4 text-muted-foreground" />
               {t("settings.phone")}
             </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm dir-ltr focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
              placeholder="01012345678"
            />
          </div>

          <div className="space-y-1.5">
             <label className="text-sm font-bold text-foreground">{t("settings.email")}</label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="w-full rounded-xl border border-input bg-muted px-4 py-3 text-sm dir-ltr opacity-60 cursor-not-allowed"
            />
             <p className="text-xs text-muted-foreground">{t("settings.emailLocked")}</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60 text-sm"
            >
              <Save className="h-4 w-4" />
               {saving ? t("common.saving") : t("settings.saveButton")}
            </button>
          </div>
        </form>
      </div>
    </AccountLayout>
  );
}
