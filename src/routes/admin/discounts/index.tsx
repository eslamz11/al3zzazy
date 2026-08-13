import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Tag, Trash2, CheckCircle, XCircle } from "lucide-react";
import {
  adminListCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/lib/services/firebase/couponService";
import { formatPrice } from "@/lib/format";
import { useLocale } from "@/lib/locale";
import type { Coupon } from "@/lib/types";

export const Route = createFileRoute("/admin/discounts/")({
  component: AdminDiscountsPage,
});

function AdminDiscountsPage() {
  const locale = useLocale();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [type, setType] = useState<Coupon["type"]>("percentage");
  const [value, setValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number | undefined>(undefined);
  const [usageLimit, setUsageLimit] = useState<number | undefined>(undefined);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await adminListCoupons();
    setCoupons(data);
    setLoading(false);
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await createCoupon({
      code,
      type,
      value,
      minOrderAmount,
      usageLimit,
      active,
    });
    setSaving(false);
    setShowModal(false);
    setCode("");
    await load();
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await updateCoupon(id, { active: !current });
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, active: !current } : c)));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف الكوبون؟")) {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 text-foreground dir-rtl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            إدارة الكوبونات والخصومات ({coupons.length})
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            إنشاء أكواد التخفيض، نسبة الخصم، والحد الأدنى للطلبات
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-1.5 space-x-reverse rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-brand-foreground hover:bg-brand-hover transition-colors shadow-xs min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة كوبون جديد</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          جاري تحميل الكوبونات...
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          لا توجد كوبونات خصم حالية.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-base text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded-xl">
                  {c.code}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    c.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.active ? "مفعل" : "معطل"}
                </span>
              </div>

              <div className="text-xs space-y-1 text-muted-foreground">
                <p className="font-bold text-foreground text-sm">
                  قيمة الخصم:{" "}
                  {c.type === "percentage" ? `${c.value}%` : formatPrice(c.value, locale)}
                </p>
                {c.minOrderAmount && (
                  <p>الحد الأدنى للطلب: {formatPrice(c.minOrderAmount, locale)}</p>
                )}
                <p>عدد مرات الاستخدام: {c.usageCount} مرات</p>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => handleToggleActive(c.id, c.active)}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground min-h-[36px]"
                >
                  {c.active ? "تعطيل" : "تفعيل"}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="rounded-lg bg-destructive/10 p-2 text-destructive hover:bg-destructive/20 min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 text-foreground">
            <h3 className="text-base font-bold">إنشاء كوبون جديد</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">كود الكوبون *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME10"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 dir-ltr font-mono font-bold"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold block mb-1">نوع الخصم</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Coupon["type"])}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت ({locale === "ar" ? "ج.م" : "EGP"})</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">القيمة *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">الحد الأدنى لمبلغ الطلب (اختياري)</label>
                <input
                  type="number"
                  min={0}
                  value={minOrderAmount || ""}
                  onChange={(e) =>
                    setMinOrderAmount(e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="1000"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2"
                />
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-input bg-background px-4 py-2 font-semibold min-h-[44px]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-brand px-5 py-2 font-bold text-brand-foreground hover:bg-brand-hover min-h-[44px]"
                >
                  {saving ? "جاري الحفظ..." : "حفظ الكوبون"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
