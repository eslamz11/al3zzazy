import { useEffect, useState, useMemo, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Plus,
  FolderPlus,
  TrendingUp,
  MessageSquare,
  Settings,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useLocale } from "@/lib/locale";
import type { Order } from "@/lib/types";
import { StatsCard } from "@/components/admin/OptimizedStatsCard";
import { useToast } from "@/components/admin/AdminLayout";
import {
  getDashboardStats,
  subscribeToOrders,
  updateOrderStatus,
  deleteOrder,
} from "@/lib/services/firebase/orderService";
import { getLowStockItems } from "@/lib/services/firebase/inventoryService";
import { adminListProducts } from "@/lib/services/firebase/productService";
import { getUnreadSiteMessageCount } from "@/lib/services/firebase/messageService";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardHome,
});

function AdminDashboardHome() {
  const locale = useLocale();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    newOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const toastId = toastRef.current.loading("جاري تحميل لوحة التحكم...");

    async function loadStats() {
      try {
        const [dashStats, lowItems, products, unreadMsgCount] = await Promise.all([
          getDashboardStats(),
          getLowStockItems(),
          adminListProducts({ limit_: 1 }),
          getUnreadSiteMessageCount(),
        ]);

        if (!isMounted) return;

        setStats((prev) => ({
          ...prev,
          ...dashStats,
          totalProducts: products.products.length,
          lowStockCount: lowItems.length,
        }));
        setUnreadMessages(unreadMsgCount);
        toastRef.current.dismissToast(toastId);
      } catch (err) {
        if (isMounted) {
          toastRef.current.dismissToast(toastId);
          toastRef.current.error("فشل تحميل الإحصائيات");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStats();

    const unsub = subscribeToOrders(
      (orders) => {
        if (isMounted) {
          setRecentOrders(orders.slice(0, 5));
        }
      },
      (err) => {
        console.error("Orders subscription error:", err);
      },
    );

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingOrder(orderId);
    try {
      await updateOrderStatus(orderId, status as any, "admin");
      toast.success("تم تحديث حالة الطلب");
    } catch {
      toast.error("فشل تحديث حالة الطلب");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      setRecentOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success("تم حذف الطلب بنجاح");
    } catch {
      toast.error("فشل حذف الطلب");
    }
  };

  const currentDate = useMemo(
    () =>
      new Date().toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin text-[#c8102e]" />
          <span className="text-sm font-medium">جاري تحميل لوحة التحكم...</span>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-5">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1a1c1c]">لوحة التحكم</h1>
          <p className="text-xs text-gray-500 mt-1">{currentDate}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c8102e] hover:bg-[#a50b23] text-white text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>منتج جديد</span>
          </Link>
          <Link
            to="/admin/categories"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e5dfd7] hover:border-[#c8102e] hover:text-[#c8102e] text-sm font-medium transition-colors"
          >
            <FolderPlus className="h-4 w-4" />
            <span>التصنيفات</span>
          </Link>
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e5dfd7] hover:border-[#c8102e] hover:text-[#c8102e] text-sm font-medium transition-colors"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Messages Alert */}
      {unreadMessages > 0 && (
        <Link
          to="/admin/reviews"
          className="flex items-center justify-between gap-4 p-4 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-red-600 text-white">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-900">
                لديك {unreadMessages} رسائل جديدة غير مقروءة
              </p>
              <p className="text-xs text-red-700">اضغط لعرض الرسائل والرد على العملاء</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-red-600 shrink-0" />
        </Link>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatsCard
          title="إجمالي الإيرادات"
          value={formatPrice(stats.totalSales, locale)}
          subtitle="مبيعات مؤكدة"
          icon={DollarSign}
          color="brand"
        />
        <StatsCard
          title="الطلبات"
          value={stats.totalOrders}
          subtitle="كافة الطلبات"
          icon={ShoppingBag}
          color="neutral"
        />
        <StatsCard
          title="قيد الانتظار"
          value={stats.newOrders}
          subtitle="تحتاج تأكيد"
          icon={TrendingUp}
          color="warning"
        />
        <StatsCard
          title="المنتجات"
          value={stats.totalProducts}
          subtitle="في الكتالوج"
          icon={Package}
          color="neutral"
        />
        <StatsCard
          title="العملاء"
          value={stats.totalCustomers}
          subtitle="حسابات مسجلة"
          icon={Users}
          color="success"
        />
        <StatsCard
          title="مخزون منخفض"
          value={stats.lowStockCount}
          subtitle="تحتاج تزويد"
          icon={AlertTriangle}
          color={stats.lowStockCount > 0 ? "destructive" : "success"}
        />
      </div>

      {/* Recent Orders */}
      <div className="border border-[#e5dfd7] bg-white rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#f4f0eb]">
          <h2 className="text-sm font-bold text-[#1a1c1c]">أحدث الطلبات</h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-[#c8102e] hover:underline">
            عرض الكل ({recentOrders.length})
          </Link>
        </div>
        <div className="divide-y divide-[#f4f0eb]">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">لا توجد طلبات حديثة</div>
          ) : (
            recentOrders.map((order) => {
              const isUpdating = updatingOrder === order.id;
              return (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 hover:bg-[#fdfbf7] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/admin/orders/$id`}
                      params={{ id: order.id }}
                      className="text-sm font-bold text-[#c8102e] hover:underline font-mono"
                    >
                      {order.number}
                    </Link>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {order.customer?.name || order.address.fullName} •{" "}
                      {formatPrice(order.total, locale)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={isUpdating}
                      className="text-xs px-2.5 py-1.5 rounded-md border border-[#e5dfd7] bg-white focus:border-[#c8102e] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="pending">جديد</option>
                      <option value="confirmed">تم التأكيد</option>
                      <option value="processing">قيد التجهيز</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="delivered">تم التسليم</option>
                      <option value="cancelled">ملغي</option>
                      <option value="returned">مرتجع</option>
                    </select>
                    {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
                    <Link
                      to={`/admin/orders/$id`}
                      params={{ id: order.id }}
                      className="text-xs px-3 py-1.5 rounded-md border border-[#e5dfd7] hover:border-[#c8102e] hover:text-[#c8102e] transition-colors font-medium"
                    >
                      عرض
                    </Link>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors font-medium"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
