import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useLocalized, useDir, useHref, useT, useFormatters } from "@/lib/locale";
import { useStore } from "@/lib/store";
import type { Address, PaymentMethod } from "@/lib/types";
import { Lock, Truck, CreditCard, ChevronRight, ChevronLeft, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/checkout/")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cartLines, subtotal, shipping, total, placeOrder, user, updateProfile } = useStore();
  const L = useLocalized();
  const dir = useDir();
  const href = useHref();
  const t = useT();
  const { price } = useFormatters();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [address, setAddress] = useState<Address>({
    fullName: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    governorate: user?.defaultAddress?.governorate || "",
    city: user?.defaultAddress?.city || "",
    street: user?.defaultAddress?.street || "",
    notes: user?.defaultAddress?.notes || "",
  });

  // Auto-fill when user data loads (e.g. after login)
  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        phone: prev.phone || user.phone || "",
        email: prev.email || user.email || "",
        governorate: prev.governorate || user.defaultAddress?.governorate || "",
        city: prev.city || user.defaultAddress?.city || "",
        street: prev.street || user.defaultAddress?.street || "",
        notes: prev.notes || user.defaultAddress?.notes || "",
      }));
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  if (cartLines.length === 0) {
    return (
      <div className="py-24 text-center space-y-4">
         <h1 className="text-2xl font-bold">{t("checkout.emptyTitle")}</h1>
         <p className="text-muted-foreground">{t("checkout.emptyCart")}</p>
         <Link
           to={href("/collections")}
           className="inline-block mt-4 text-brand hover:underline font-bold"
         >
           {t("checkout.backToShopping")}
         </Link>
      </div>
    );
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !address.fullName ||
      !address.phone ||
      !address.governorate ||
      !address.city ||
      !address.street
    ) {
       setError(t("checkout.missingFields"));
      return;
    }
    setError("");
    setStep(2);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const order = await placeOrder(address, paymentMethod, shipping);
      if (order) {
        sessionStorage.setItem("lastOrder", JSON.stringify(order));
        // Auto-save address and phone to user profile for future orders
        if (user) {
          updateProfile({
            phone: address.phone || undefined,
            defaultAddress: address,
          }).catch(() => {
            /* silent fail */
          });
        }
        navigate({ to: href("/checkout/confirmation") });
      } else {
        setError(t("checkout.failed"));
      }
    } catch (err) {
      setError(t("checkout.connectionFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "container-page py-8 lg:py-12 space-y-8",
        dir === "rtl" ? "dir-rtl" : "dir-ltr",
      )}
    >
      {/* Checkout Progress */}
      <div className="flex items-center justify-center space-x-4 space-x-reverse mb-8">
        <div
          className={cn(
            "flex items-center gap-2",
            step >= 1 ? "text-brand" : "text-muted-foreground",
          )}
        >
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm",
              step >= 1 ? "bg-brand text-brand-foreground" : "bg-muted",
            )}
          >
            1
          </div>
          <span className="font-bold">{t("checkout.stepShipping")}</span>
        </div>
        <div className="h-px w-12 bg-border" />
        <div
          className={cn(
            "flex items-center gap-2",
            step === 2 ? "text-brand" : "text-muted-foreground",
          )}
        >
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm",
              step === 2 ? "bg-brand text-brand-foreground" : "bg-muted",
            )}
          >
            2
          </div>
          <span className="font-bold">{t("checkout.stepPayment")}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-7">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <MapPin className="h-6 w-6 text-brand" />
                  <h2 className="text-xl font-bold">{t("checkout.shippingAddress")}</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-foreground">
                      {t("checkout.fullName")} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3"
                      placeholder={t("checkout.fullNamePlaceholder")}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-foreground">
                      {t("checkout.phone")} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 dir-ltr"
                      placeholder="01012345678"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-bold text-foreground">
                      {t("checkout.emailOptional")}
                    </label>
                  <input
                    type="email"
                    value={address.email}
                    onChange={(e) => setAddress({ ...address, email: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 dir-ltr"
                    placeholder="example@mail.com"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-foreground">
                      {t("checkout.governorate")} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address.governorate}
                      onChange={(e) => setAddress({ ...address, governorate: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3"
                      placeholder={t("checkout.governoratePlaceholder")}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-foreground">
                      {t("checkout.city")} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3"
                      placeholder={t("checkout.cityPlaceholder")}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-bold text-foreground">
                      {t("checkout.street")} <span className="text-destructive">*</span>
                    </label>
                  <input
                    type="text"
                    required
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3"
                      placeholder={t("checkout.streetPlaceholder")}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-foreground">
                    {t("checkout.notes")}
                  </label>
                  <textarea
                    value={address.notes}
                    onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 h-24 resize-none"
                    placeholder={t("checkout.notesPlaceholder")}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to={href("/cart")}
                  className="text-muted-foreground hover:text-foreground font-bold"
                >
                 <span>{t("checkout.backToCart")}</span>
                </Link>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-brand px-8 py-3 font-bold text-brand-foreground hover:bg-brand-hover transition-colors"
                >
                  <span>{t("checkout.next")}</span>
                  {dir === "rtl" ? (
                    <ChevronLeft className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <CreditCard className="h-6 w-6 text-brand" />
                  <h2 className="text-xl font-bold">{t("checkout.paymentMethod")}</h2>
                </div>

                <div className="space-y-4">
                  <label
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border p-4 cursor-pointer transition-colors",
                      paymentMethod === "cod"
                        ? "border-brand bg-brand/5"
                        : "border-border hover:border-brand/50",
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="h-5 w-5 text-brand"
                      />
                      <div>
                        <div className="font-bold text-foreground flex items-center gap-2">
                          <Truck className="h-5 w-5 text-muted-foreground" />
                           <span>{t("checkout.cod")}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                           {t("checkout.codText")}
                        </div>
                      </div>
                    </div>
                  </label>

                  <label
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border p-4 cursor-pointer transition-colors",
                      paymentMethod === "card"
                        ? "border-brand bg-brand/5"
                        : "border-border hover:border-brand/50",
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="h-5 w-5 text-brand"
                      />
                      <div>
                        <div className="font-bold text-foreground flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                           <span>{t("checkout.card")}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                  {t("checkout.cardText")}
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-muted-foreground hover:text-foreground font-bold"
                >
                  العودة للشحن
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-brand px-8 py-3 font-bold text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-50"
                >
                  <Lock className="h-5 w-5" />
                  <span>{loading ? t("checkout.placingOrder") : t("checkout.placeOrder")}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-border bg-muted/20 p-6 space-y-6 lg:sticky lg:top-24">
               <h3 className="text-lg font-bold border-b border-border pb-4">
                 {t("checkout.orderSummaryCount", { count: cartLines.length })}
               </h3>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto hide-scrollbar">
              {cartLines.map((line) => (
                <div key={line.id} className="flex gap-4">
                  <div className="relative h-16 w-16 shrink-0 rounded-xl border border-border overflow-hidden bg-background">
                    <img
                      src={line.product.images[0]?.src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full z-10 border-2 border-background">
                      {line.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold truncate">{L(line.product.name)}</h4>
                    <p className="text-xs text-muted-foreground">
                      {Object.values(line.variant.options).join(" - ")}
                    </p>
                  </div>
                  <div className="font-bold text-sm text-brand">
                    {line.lineTotal.toLocaleString("ar-EG")}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                 <span>{t("checkout.subtotal")}</span>
                 <span className="font-bold text-foreground">
                   {price(subtotal)}
                 </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                 <span>{t("checkout.shipping")}</span>
                 <span className="font-bold text-foreground">
                   {shipping === 0 ? t("checkout.freeShipping") : price(shipping)}
                 </span>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex justify-between items-end">
               <span className="font-bold text-lg">{t("checkout.total")}</span>
               <span className="text-2xl font-black text-brand">
                 {price(total)}
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
