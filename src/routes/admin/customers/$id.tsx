import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowRight, User, Mail, Phone, Calendar, ShoppingBag } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUserOrders } from "@/lib/services/firebase/orderService";
import { formatPrice } from "@/lib/format";
import { useLocale } from "@/lib/locale";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/admin/customers/$id")({
  component: AdminCustomerDetailPage,
});

function AdminCustomerDetailPage() {
  const locale = useLocale();
  const { id } = useParams({ from: "/admin/customers/$id" });
  const [customer, setCustomer] = useState<{
    name: string;
    email: string;
    phone?: string;
    createdAt?: string;
  } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "users", id));
        if (snap.exists()) {
          const d = snap.data() as Record<string, any>;
          setCustomer({
            name: d["displayName"] || d["name"] || "عميل بدون اسم",
            email: d["email"] || "",
            phone: d["phone"],
            createdAt: d["createdAt"]?.toDate?.()?.toISOString(),
          });
        }
        const userOrders = await getUserOrders(id);
        setOrders(userOrders);
      } catch (err) {
        console.error("Failed to load customer details:", err);
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-muted-foreground dir-rtl">
        جاري تحميل بيانات العميل...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6 text-foreground dir-rtl">
        <div className="flex items-center space-x-3 space-x-reverse border-b border-border pb-4">
          <Link
            to="/admin/customers"
            className="rounded-lg border border-input p-2 hover:bg-accent min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-bold">ملف العميل</h1>
        </div>
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          العميل المطلوب غير موجود أو لم يتم العثور على حسابه.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-foreground dir-rtl">
      <div className="flex items-center space-x-3 space-x-reverse border-b border-border pb-4">
        <Link
          to="/admin/customers"
          className="rounded-lg border border-input p-2 hover:bg-accent min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold">ملف العميل: {customer.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Details */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center space-x-2 space-x-reverse">
            <User className="h-4 w-4 text-brand" />
            <span>البيانات الشخصية</span>
          </h3>

          <div>
            <span className="text-muted-foreground block">الاسم</span>
            <span className="font-bold text-foreground">{customer.name}</span>
          </div>

          <div>
            <span className="text-muted-foreground block">البريد الإلكتروني</span>
            <span className="font-mono text-foreground">{customer.email || "—"}</span>
          </div>

          <div>
            <span className="text-muted-foreground block">رقم الهاتف</span>
            <span className="font-mono text-foreground">{customer.phone || "—"}</span>
          </div>

          <div>
            <span className="text-muted-foreground block">الحماية والأمان</span>
            <span className="font-mono text-muted-foreground text-[11px]">
              •••••••• (محمية ومُشفرة عبر Firebase Auth)
            </span>
          </div>
        </div>

        {/* Customer Orders */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold border-b border-border pb-2 flex items-center space-x-2 space-x-reverse">
            <ShoppingBag className="h-4 w-4 text-brand" />
            <span>طلبـات العميـل ({orders.length})</span>
          </h3>

          {orders.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              لا توجد طلبات سابقة لهذا العميل.
            </p>
          ) : (
            <div className="divide-y divide-border text-xs">
              {orders.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold font-mono text-brand block">{o.number}</span>
                    <span className="text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                  <span className="font-bold">{formatPrice(o.total, locale)}</span>
                  <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold">
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
