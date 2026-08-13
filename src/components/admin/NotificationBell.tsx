import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  subscribeToUnreadCount,
  getNotifications,
  markAllRead,
  markNotificationRead,
} from "@/lib/services/firebase/notificationService";
import type { AdminNotification } from "@/lib/types";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToUnreadCount((count) => {
      setUnreadCount(count);
    });
    return () => unsub();
  }, []);

  const handleToggle = async () => {
    const nextState = !open;
    setOpen(nextState);
    if (nextState) {
      setLoading(true);
      const list = await getNotifications(10);
      setNotifications(list);
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleItemClick = async (notif: AdminNotification) => {
    if (!notif.read) {
      await markNotificationRead(notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="relative">
      <button onClick={handleToggle} className="admin-header-btn relative" aria-label="الإشعارات">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#c8102e] text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            dir="rtl"
            className="absolute left-0 mt-2 z-50 w-80 rounded-2xl border border-[#e5dfd7] bg-white p-4 shadow-xl text-gray-900"
          >
            <div className="flex items-center justify-between border-b border-[#f4f0eb] pb-3 mb-3">
              <h3 className="font-bold text-sm text-[#1a1c1c]">الإشعارات التنبيهية</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-[#c8102e] hover:underline font-bold"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>تحديد الكل كمقروء</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-gray-500">جاري تحميل الإشعارات...</div>
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">
                لا توجد إشعارات جديدة حالياً
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`p-3 rounded-xl text-xs cursor-pointer transition-all ${
                      n.read
                        ? "bg-white hover:bg-[#fbf9f5] text-gray-600 border border-[#e5dfd7]"
                        : "bg-[#fde8ea] hover:bg-[#fbd3d7] text-[#1a1c1c] font-semibold border border-[#f5b8c0]"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>{n.titleAr}</span>
                      <span className="text-[10px] text-gray-500 font-normal">
                        {new Date(n.createdAt).toLocaleTimeString("ar-EG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="line-clamp-2 leading-relaxed text-gray-600">{n.bodyAr}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
