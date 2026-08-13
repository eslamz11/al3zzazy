import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { OrderTable } from "@/components/admin/OrderTable";
import {
  adminListOrders,
  updateOrderStatus,
  deleteOrder,
  subscribeToOrders,
} from "@/lib/services/firebase/orderService";
import { auth } from "@/lib/firebase";
import type { Order, OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/orders/")({
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Subscribe to real-time order updates
    const unsub = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const adminId = auth.currentUser?.uid || "admin";
    await updateOrderStatus(orderId, newStatus, adminId, `تم تغيير الحالة إلى ${newStatus}`);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
  };

  const handleDeleteOrder = async (orderId: string) => {
    const res = await deleteOrder(orderId);
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const hay = [
        o.number,
        o.customer?.name,
        o.customer?.phone,
        o.customer?.email,
        o.address.fullName,
        o.address.phone,
        o.address.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-foreground dir-rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            إدارة الطلبات ({filteredOrders.length})
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            عرض الطلبات، متابعة الحالات، وتحديث مسار الشحن والتسليم
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { key: "all", label: "الكل" },
          { key: "pending", label: "جديد" },
          { key: "confirmed", label: "تم التأكيد" },
          { key: "processing", label: "قيد التجهيز" },
          { key: "shipped", label: "تم الشحن" },
          { key: "delivered", label: "تم التسليم" },
          { key: "cancelled", label: "ملغي" },
          { key: "returned", label: "مرتجع" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key as OrderStatus | "all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
              statusFilter === tab.key
                ? "bg-brand text-brand-foreground shadow-xs"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground border border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث برقم الطلب، اسم العميل، أو الهاتـف..."
          className="w-full rounded-xl border border-input bg-background pr-9 pl-4 py-2 text-xs"
        />
      </div>

      {/* Order Data Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">جاري تحميل الطلبات...</div>
      ) : (
        <OrderTable
          orders={filteredOrders}
          onStatusChange={handleStatusChange}
          onDeleteOrder={handleDeleteOrder}
        />
      )}
    </div>
  );
}
