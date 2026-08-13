import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { MapPin, Save, CheckCircle, AlertCircle } from "lucide-react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useT, useFormatters } from "@/lib/locale";
import type { Address } from "@/lib/types";

export const Route = createFileRoute("/$locale/account/addresses")({
  component: AddressesPage,
});

function AddressesPage() {
  const { user, updateProfile } = useStore();
  const t = useT();
  const { price } = useFormatters();

  const [address, setAddress] = useState<Omit<Address, "fullName" | "phone" | "email">>({
    governorate: user?.defaultAddress?.governorate ?? "",
    city: user?.defaultAddress?.city ?? "",
    street: user?.defaultAddress?.street ?? "",
    notes: user?.defaultAddress?.notes ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.governorate || !address.city || !address.street) {
      setError(t("addresses.missingFields"));
      return;
    }
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const fullAddress: Address = {
        fullName: user?.name ?? "",
        phone: user?.phone ?? "",
        email: user?.email ?? "",
        ...address,
      };
      await updateProfile({ defaultAddress: fullAddress });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError(t("addresses.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountLayout activeTab="addresses">
      <div className="space-y-6">
         <h2 className="text-xl font-bold border-b border-border pb-4 flex items-center gap-2">
           <MapPin className="h-5 w-5 text-brand" />
           {t("addresses.title")}
         </h2>

         <p className="text-sm text-muted-foreground">
           {t("addresses.intro")}
         </p>

        {success && (
          <div className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/30 p-4 text-green-700 dark:text-green-400 text-sm font-bold">
            <CheckCircle className="h-5 w-5 shrink-0" />
             {t("addresses.saved")}
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
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-sm font-bold text-foreground">
                 {t("checkout.governorate")} <span className="text-destructive">*</span>
               </label>
              <input
                type="text"
                required
                value={address.governorate}
                onChange={(e) => setAddress({ ...address, governorate: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
                 placeholder={t("checkout.governoratePlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
               <label className="text-sm font-bold text-foreground">
                 {t("checkout.city")} <span className="text-destructive">*</span>
               </label>
              <input
                type="text"
                required
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
                 placeholder={t("checkout.cityPlaceholder")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
               <label className="text-sm font-bold text-foreground">
                 {t("checkout.street")} <span className="text-destructive">*</span>
               </label>
            <input
              type="text"
              required
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
                 placeholder={t("checkout.streetPlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
             <label className="text-sm font-bold text-foreground">{t("addresses.notesLabel")}</label>
            <textarea
              value={address.notes ?? ""}
              onChange={(e) => setAddress({ ...address, notes: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
               placeholder={t("checkout.notesPlaceholder")}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60 text-sm"
            >
              <Save className="h-4 w-4" />
               {saving ? t("common.saving") : t("addresses.saveButton")}
            </button>
          </div>
        </form>

        {user?.defaultAddress && (
          <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-2">
             <p className="text-sm font-bold text-muted-foreground mb-3">{t("addresses.currentTitle")}</p>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-brand mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-sm font-bold">
                  {user.defaultAddress.governorate} — {user.defaultAddress.city}
                </p>
                <p className="text-sm text-muted-foreground">{user.defaultAddress.street}</p>
                {user.defaultAddress.notes && (
                  <p className="text-xs text-muted-foreground">{user.defaultAddress.notes}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
