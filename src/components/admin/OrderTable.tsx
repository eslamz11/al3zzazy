import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, Trash2, ShoppingBag, Loader2, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useLocale } from "@/lib/locale";
import type { Order, OrderStatus } from "@/lib/types";

interface OrderTableProps {
  orders: Order[];
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder?: (orderId: string) => Promise<void>;
}

const statusBadges: Record<OrderStatus, { label: string; style: string }> = {
  pending: { label: "جديد (انتظار)", style: "badge-pending" },
  confirmed: { label: "تم التأكيد", style: "badge-processing" },
  processing: { label: "قيد التجهيز", style: "badge-processing" },
  shipped: { label: "تم الشحن", style: "badge-shipped" },
  delivered: { label: "تم التسليم", style: "badge-delivered" },
  cancelled: { label: "ملغي", style: "badge-cancelled" },
  returned: { label: "مرتجع", style: "badge-cancelled" },
};

export function OrderTable({ orders, onStatusChange, onDeleteOrder }: OrderTableProps) {
  const locale = useLocale();
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deletingOrder || !onDeleteOrder) return;
    setDeleteLoading(true);
    try {
      await onDeleteOrder(deletingOrder.id);
    } catch (err) {
      console.error("Failed to delete order:", err);
    } finally {
      setDeleteLoading(false);
      setDeletingOrder(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#e5dfd7] bg-white p-12 text-center text-sm font-semibold text-gray-500">
        <ShoppingBag className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        لا توجد طلبات مطابقة حالياً.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 dir-rtl">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-[#e5dfd7] bg-white shadow-xs">
        <table className="w-full text-right text-xs text-gray-800 border-collapse">
          <thead className="bg-[#fbf9f5] text-gray-600 font-bold border-b border-[#e5dfd7]">
            <tr>
              <th className="py-4 px-5">رقم الطلب</th>
              <th className="py-4 px-5">بيانات العميل</th>
              <th className="py-4 px-5">تاريخ الطلب</th>
              <th className="py-4 px-5">عدد القطع</th>
              <th className="py-4 px-5">الإجمالي</th>
              <th className="py-4 px-5">طريقة الدفع</th>
              <th className="py-4 px-5">حالة الطلب</th>
              <th className="py-4 px-5 text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f4f0eb] font-semibold">
            {orders.map((o) => {
              const statusCfg = statusBadges[o.status] || {
                label: o.status,
                style: "bg-gray-100 text-gray-700 border-gray-300",
              };
              const itemCount = o.lines.reduce((sum, l) => sum + l.quantity, 0);

              return (
                <tr key={o.id} className="hover:bg-[#fdfbf7] transition-colors">
                  <td className="py-4 px-5 font-bold font-mono text-[#c8102e]">
                    <Link
                      to={`/admin/orders/$id`}
                      params={{ id: o.id }}
                      className="hover:underline"
                    >
                      {o.number}
                    </Link>
                  </td>

                  <td className="py-4 px-5">
                    <span className="font-bold text-[#1a1c1c] block">
                      {o.customer?.name || o.address.fullName}
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono">
                      {o.customer?.phone || o.address.phone}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-gray-500 text-[12px]">
                    {new Date(o.createdAt).toLocaleDateString("ar-EG")}
                  </td>

                  <td className="py-4 px-5 font-bold text-gray-700">{itemCount} منتجات</td>

                  <td className="py-4 px-5 font-extrabold text-[#1a1c1c]">
                    {formatPrice(o.total, locale)}
                  </td>

                  <td className="py-4 px-5">
                    <span className="rounded-lg bg-[#f4f0eb] px-2.5 py-1 text-[11px] font-bold text-gray-700 border border-[#e5dfd7]">
                      {o.paymentMethod === "cod" ? "الدفع عند الاستلام" : "بطاقة ائتمان"}
                    </span>
                  </td>

                  <td className="py-4 px-5">
                    <select
                      value={o.status}
                      onChange={(e) => onStatusChange?.(o.id, e.target.value as OrderStatus)}
                      className={`badge-status cursor-pointer focus:outline-none min-h-[32px] ${statusCfg.style}`}
                    >
                      <option value="pending">جديد</option>
                      <option value="confirmed">تم التأكيد</option>
                      <option value="processing">قيد التجهيز</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="delivered">تم التسليم</option>
                      <option value="cancelled">ملغي</option>
                      <option value="returned">مرتجع</option>
                    </select>
                  </td>

                  <td className="py-4 px-5 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/orders/$id`}
                        params={{ id: o.id }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#e5dfd7] bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:text-[#c8102e] hover:border-[#c8102e] hover:bg-[#fde8ea] transition-all shadow-xs min-h-[34px]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>عرض</span>
                      </Link>

                      {onDeleteOrder && (
                        <button
                          onClick={() => setDeletingOrder(o)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xs min-h-[34px]"
                          title="حذف الطلب"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>حذف</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="grid gap-3.5 md:hidden">
        {orders.map((o) => {
          const statusCfg = statusBadges[o.status] || {
            label: o.status,
            style: "bg-gray-100 text-gray-700 border-gray-300",
          };
          const itemCount = o.lines.reduce((sum, l) => sum + l.quantity, 0);

          return (
            <div
              key={o.id}
              className="rounded-2xl border border-[#e5dfd7] bg-white p-4 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-[#c8102e] text-sm">{o.number}</span>
                <span className={`badge-status ${statusCfg.style}`}>{statusCfg.label}</span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-b border-[#f4f0eb] py-2.5">
                <div>
                  <span className="font-bold text-[#1a1c1c] block text-sm">
                    {o.customer?.name || o.address.fullName}
                  </span>
                  <span className="text-[11px] text-gray-500">{o.address.city}</span>
                </div>
                <div className="text-left font-black text-[#1a1c1c] text-sm">
                  {formatPrice(o.total, locale)}
                  <span className="block text-[11px] text-gray-500 font-normal">
                    {itemCount} منتجات
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-500 font-medium">
                  {new Date(o.createdAt).toLocaleDateString("ar-EG")}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/orders/$id`}
                    params={{ id: o.id }}
                    className="rounded-xl bg-[#c8102e] px-3.5 py-2 text-xs font-bold text-white shadow-xs min-h-[38px] flex items-center justify-center gap-1.5 hover:bg-[#a50b23] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>عرض</span>
                  </Link>

                  {onDeleteOrder && (
                    <button
                      onClick={() => setDeletingOrder(o)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 shadow-xs min-h-[38px] flex items-center justify-center gap-1.5 hover:bg-red-600 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="rounded-full bg-red-100 p-2.5">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold">تأكيد حذف الطلب</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              هل أنت تأكد من رغبتك في حذف الطلب رقم{" "}
              <strong className="text-foreground font-mono">{deletingOrder.number}</strong>؟ هذا
              الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                disabled={deleteLoading}
                className="rounded-xl border border-border px-4 py-2 text-xs font-bold hover:bg-accent text-foreground transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>حذف الطلب النهائي</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
