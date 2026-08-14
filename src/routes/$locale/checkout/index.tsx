import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useLocalized, useDir, useHref, useT, useFormatters } from "@/lib/locale";
import { useStore } from "@/lib/store";
import type { Address, PaymentMethod, Coupon } from "@/lib/types";
import {
  Lock,
  Truck,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  MapPin,
  Check,
  ShoppingBag,
  Tag,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { validateCoupon } from "@/lib/services/firebase/couponService";

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

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ coupon: Coupon; discountAmount: number } | null>(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState("");

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
      <div className="container-page py-20 lg:py-28">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold">{t("checkout.emptyTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("checkout.emptyCart")}</p>
          <Link
            to={href("/collections")}
            className="mt-2 inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-bold text-brand-foreground transition-colors hover:bg-brand-hover"
          >
            {t("checkout.backToShopping")}
          </Link>
        </div>
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

  const discount = appliedCoupon?.discountAmount ?? 0;
  const finalTotal = total - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponValidating(true);
    setCouponError("");
    try {
      const result = await validateCoupon(couponCode, subtotal);
      if (result.ok) {
        setAppliedCoupon({ coupon: result.coupon, discountAmount: result.discountAmount });
        setCouponCode("");
      } else {
        setCouponError(result.error);
      }
    } catch {
      setCouponError(t("checkout.coupon.invalid"));
    } finally {
      setCouponValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const order = await placeOrder(address, paymentMethod, shipping, appliedCoupon?.coupon.code);
      if (order) {
        sessionStorage.setItem("lastOrder", JSON.stringify(order));
        if (user) {
          updateProfile({
            phone: address.phone || undefined,
            defaultAddress: address,
          }).catch(() => {});
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

  const inputClass =
    "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm transition-shadow outline-none focus:border-brand focus:ring-4 focus:ring-brand/10";

  return (
    <div
      className={cn(
        "container-page space-y-6 py-6 lg:space-y-8 lg:py-12 lg:pb-12",
        "pb-[calc(var(--bottom-nav-h,4.25rem)+1rem)]",
        dir === "rtl" ? "dir-rtl" : "dir-ltr",
      )}
    >
      {/* Checkout Progress */}
      <div className="mx-auto flex w-full max-w-xs items-center justify-center gap-3 sm:max-w-sm">
        <StepBadge label={t("checkout.stepShipping")} index={1} active={step >= 1} done={step > 1} />
        <div className="relative h-px flex-1 bg-border">
          <div
            className={cn(
              "absolute inset-y-0 right-0 bg-brand transition-all duration-300",
              step > 1 ? "w-full" : "w-0",
            )}
          />
        </div>
        <StepBadge label={t("checkout.stepPayment")} index={2} active={step === 2} done={false} />
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Order summary — collapsible on mobile, sits above the form */}
        <div className="lg:hidden">
          <details className="group overflow-hidden rounded-2xl border border-border bg-muted/20">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-2 text-sm font-bold">
                <span>{t("checkout.orderSummaryCount", { count: cartLines.length })}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </div>
              <span className="text-base font-black text-brand">{price(total)}</span>
            </summary>
            <div className="border-t border-border px-4 pb-4 pt-3">
              <OrderSummaryContent
                cartLines={cartLines}
                L={L}
                price={price}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                discount={discount}
                finalTotal={finalTotal}
                t={t}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                appliedCoupon={appliedCoupon}
                couponValidating={couponValidating}
                couponError={couponError}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
              />
            </div>
          </details>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-7">
          {error && (
            <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-bold text-destructive">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form id="checkout-step-form" onSubmit={handleNextStep} className="space-y-6">
              <div className="space-y-6 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <MapPin className="h-6 w-6 text-brand" />
                  <h2 className="text-xl font-bold">{t("checkout.shippingAddress")}</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground">
                      {t("checkout.fullName")} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className={inputClass}
                      placeholder={t("checkout.fullNamePlaceholder")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground">
                      {t("checkout.phone")} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className={cn(inputClass, "dir-ltr text-right")}
                      placeholder="01012345678"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">
                    {t("checkout.emailOptional")}
                  </label>
                  <input
                    type="email"
                    value={address.email}
                    onChange={(e) => setAddress({ ...address, email: e.target.value })}
                    className={cn(inputClass, "dir-ltr text-right")}
                    placeholder="example@mail.com"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground">
                      {t("checkout.governorate")} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address.governorate}
                      onChange={(e) => setAddress({ ...address, governorate: e.target.value })}
                      className={inputClass}
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
                      className={inputClass}
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
                    className={inputClass}
                    placeholder={t("checkout.streetPlaceholder")}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">{t("checkout.notes")}</label>
                  <textarea
                    value={address.notes}
                    onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                    className={cn(inputClass, "h-24 resize-none")}
                    placeholder={t("checkout.notesPlaceholder")}
                  />
                </div>
              </div>

              <div className="hidden items-center justify-between lg:flex">
                <Link
                  to={href("/cart")}
                  className="font-bold text-muted-foreground hover:text-foreground"
                >
                  <span>{t("checkout.backToCart")}</span>
                </Link>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-brand px-8 py-3 font-bold text-brand-foreground transition-colors hover:bg-brand-hover"
                >
                  <span>{t("checkout.next")}</span>
                  {dir === "rtl" ? (
                    <ChevronLeft className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
              </div>

              <Link
                to={href("/cart")}
                className="block text-center text-sm font-bold text-muted-foreground hover:text-foreground lg:hidden"
              >
                {t("checkout.backToCart")}
              </Link>
            </form>
          ) : (
            <form id="checkout-step-form" onSubmit={handlePlaceOrder} className="space-y-6">
              <div className="space-y-6 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <CreditCard className="h-6 w-6 text-brand" />
                  <h2 className="text-xl font-bold">{t("checkout.paymentMethod")}</h2>
                </div>

                <div className="space-y-3">
                  <PaymentOption
                    icon={<Truck className="h-5 w-5 text-muted-foreground" />}
                    title={t("checkout.cod")}
                    description={t("checkout.codText")}
                    checked={paymentMethod === "cod"}
                    onSelect={() => setPaymentMethod("cod")}
                  />
                  <PaymentOption
                    icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
                    title={t("checkout.card")}
                    description={t("checkout.cardText")}
                    checked={paymentMethod === "card"}
                    onSelect={() => setPaymentMethod("card")}
                  />
                </div>
              </div>

              <div className="hidden items-center justify-between lg:flex">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-bold text-muted-foreground hover:text-foreground"
                >
                  العودة للشحن
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-brand px-8 py-3 font-bold text-brand-foreground transition-colors hover:bg-brand-hover disabled:opacity-50"
                >
                  <Lock className="h-5 w-5" />
                  <span>{loading ? t("checkout.placingOrder") : t("checkout.placeOrder")}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="block w-full text-center text-sm font-bold text-muted-foreground hover:text-foreground lg:hidden"
              >
                العودة للشحن
              </button>
            </form>
          )}
        </div>

        {/* Order Summary — sticky sidebar on desktop */}
        <div className="hidden lg:col-span-5 lg:block">
          <div className="space-y-6 rounded-3xl border border-border bg-muted/20 p-6 lg:sticky lg:top-24">
            <h3 className="border-b border-border pb-4 text-lg font-bold">
              {t("checkout.orderSummaryCount", { count: cartLines.length })}
            </h3>
            <OrderSummaryContent
              cartLines={cartLines}
              L={L}
              price={price}
              subtotal={subtotal}
              shipping={shipping}
              total={total}
              discount={discount}
              finalTotal={finalTotal}
              t={t}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              appliedCoupon={appliedCoupon}
              couponValidating={couponValidating}
              couponError={couponError}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
            />
          </div>
        </div>
      </div>

      {/* Mobile action bar — shows at bottom of the page */}
      <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-muted-foreground">{t("checkout.total")}</div>
            <div className="truncate text-lg font-black text-brand">{price(finalTotal)}</div>
          </div>
          <button
            type="submit"
            form="checkout-step-form"
            disabled={step === 2 && loading}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-brand-foreground transition-colors hover:bg-brand-hover disabled:opacity-50"
          >
            {step === 1 ? (
              <>
                <span>{t("checkout.next")}</span>
                {dir === "rtl" ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>{loading ? t("checkout.placingOrder") : t("checkout.placeOrder")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepBadge({
  label,
  index,
  active,
  done,
}: {
  label: string;
  index: number;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", active ? "text-brand" : "text-muted-foreground")}>
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors",
          active ? "bg-brand text-brand-foreground" : "bg-muted",
        )}
      >
        {done ? <Check className="h-4 w-4" /> : index}
      </div>
      <span className="hidden text-sm font-bold sm:inline">{label}</span>
    </div>
  );
}

function PaymentOption({
  icon,
  title,
  description,
  checked,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-colors",
        checked ? "border-brand bg-brand/5" : "border-border hover:border-brand/50",
      )}
    >
      <input
        type="radio"
        name="payment"
        checked={checked}
        onChange={onSelect}
        className="mt-1 h-5 w-5 accent-brand"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 font-bold text-foreground">
          {icon}
          <span>{title}</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{description}</div>
      </div>
      {checked && (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
          <Check className="h-3.5 w-3.5" />
        </div>
      )}
    </label>
  );
}

function OrderSummaryContent({
  cartLines,
  L,
  price,
  subtotal,
  shipping,
  total,
  discount,
  finalTotal,
  t,
  couponCode,
  setCouponCode,
  appliedCoupon,
  couponValidating,
  couponError,
  onApplyCoupon,
  onRemoveCoupon,
}: {
  cartLines: ReturnType<typeof useStore>["cartLines"];
  L: ReturnType<typeof useLocalized>;
  price: ReturnType<typeof useFormatters>["price"];
  subtotal: number;
  shipping: number;
  total: number;
  discount: number;
  finalTotal: number;
  t: ReturnType<typeof useT>;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: { coupon: Coupon; discountAmount: number } | null;
  couponValidating: boolean;
  couponError: string;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="hide-scrollbar max-h-[40vh] space-y-4 overflow-y-auto">
        {cartLines.map((line) => (
          <div key={line.id} className="flex gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-background">
              <img src={line.product.images[0]?.src} alt="" className="h-full w-full object-cover" />
              <span className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-foreground text-[10px] font-bold text-background">
                {line.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-bold">{L(line.product.name)}</h4>
              <p className="text-xs text-muted-foreground">
                {Object.values(line.variant.options).join(" - ")}
              </p>
            </div>
            <div className="text-sm font-bold text-brand">{price(line.lineTotal)}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        {appliedCoupon ? (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-green-500/10 px-3 py-2.5 text-sm">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-600" />
              <span className="font-bold text-green-700">{appliedCoupon.coupon.code}</span>
            </div>
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              <span>{t("checkout.coupon.remove")}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">{t("checkout.coupon.label")}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder={t("checkout.coupon.placeholder")}
                className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm uppercase tracking-wide outline-none transition-shadow focus:border-brand focus:ring-2 focus:ring-brand/10"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onApplyCoupon())}
              />
              <button
                type="button"
                onClick={onApplyCoupon}
                disabled={couponValidating || !couponCode.trim()}
                className="shrink-0 rounded-xl bg-muted px-4 py-2.5 text-sm font-bold transition-colors hover:bg-muted/80 disabled:opacity-50"
              >
                {couponValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("checkout.coupon.apply")
                )}
              </button>
            </div>
            {couponError && (
              <p className="text-xs font-bold text-destructive">{couponError}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>{t("checkout.subtotal")}</span>
          <span className="font-bold text-foreground">{price(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>{t("checkout.discount")}</span>
            <span className="font-bold">-{price(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>{t("checkout.shipping")}</span>
          <span className="font-bold text-foreground">
            {shipping === 0 ? t("checkout.freeShipping") : price(shipping)}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-border pt-4">
        <span className="text-lg font-bold">{t("checkout.total")}</span>
        <span className="text-2xl font-black text-brand">{price(finalTotal)}</span>
      </div>
    </div>
  );
}