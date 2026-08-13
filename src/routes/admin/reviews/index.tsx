import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  MessageSquare,
  Mail,
  Phone,
  Trash2,
  CheckCircle,
  Eye,
  Clock,
  User,
  Inbox,
  X,
  MailOpen,
  Newspaper,
} from "lucide-react";
import {
  listSiteMessages,
  setSiteMessageRead,
  deleteSiteMessage,
} from "@/lib/services/firebase/messageService";
import { SleepHighLoader } from "@/components/common/SleepHighLoader";
import type { SiteMessage } from "@/lib/types";

export const Route = createFileRoute("/admin/reviews/")({
  component: AdminSiteMessagesPage,
});

function AdminSiteMessagesPage() {
  const [messages, setMessages] = useState<SiteMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedMessage, setSelectedMessage] = useState<SiteMessage | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await listSiteMessages(filter);
      setMessages(data);
      setLoading(false);
    }
    load();
  }, [filter]);

  const handleToggleRead = async (msg: SiteMessage) => {
    const nextState = !msg.read;
    await setSiteMessageRead(msg.id, nextState);
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: nextState } : m)));
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage((prev) => (prev ? { ...prev, read: nextState } : null));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الرسالة؟")) {
      await deleteSiteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  const handleOpenMessage = async (msg: SiteMessage) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      await setSiteMessageRead(msg.id, true);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)));
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6 text-foreground dir-rtl">
      {/* HEADER BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-100 text-[#c8102e]">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-foreground">رسائل الموقع واستفسارات العملاء</h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#c8102e] px-2.5 py-0.5 text-xs font-extrabold text-white">
                {unreadCount} غير مقروء
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            إدارة كافة الرسائل والاستفسارات الواردة من خلال نموذج التواصل على متجر سليب هاي
          </p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center space-x-2 space-x-reverse border-b border-border pb-3">
        {[
          { key: "all", label: "كافة الرسائل" },
          { key: "unread", label: "غير المقروءة" },
          { key: "read", label: "المقروءة" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as "all" | "unread" | "read")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all min-h-[38px] ${
              filter === tab.key
                ? "bg-[#c8102e] text-white shadow-xs"
                : "bg-card text-muted-foreground hover:bg-accent border border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MESSAGES CONTENT AREA */}
      {loading ? (
        <div className="py-16">
          <SleepHighLoader label="جاري تحميل رسائل الموقع..." />
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3 bg-card">
          <Inbox className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-sm text-foreground">لا توجد رسائل موقع حالياً</h3>
          <p className="text-xs text-muted-foreground">
            عندما يقوم العملاء بإرسال استفسار عبر صفحة اتصل بنا، ستظهر جميع الرسائل هنا.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {messages.map((msg) => {
            const isNewsletter = msg.subject === "طلب اشتراك في النشرة البريدية";

            return (
              <div
                key={msg.id}
                className={`rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                  !msg.read
                    ? isNewsletter
                      ? "bg-blue-50/40 border-blue-200 shadow-sm"
                      : "bg-red-50/40 border-red-200 shadow-sm"
                    : "bg-card border-border hover:border-gray-300"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          !msg.read ? "bg-[#c8102e] text-white" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {msg.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                          <span>{msg.name}</span>
                          {!msg.read && (
                            <span
                              className={`w-2 h-2 rounded-full animate-pulse ${
                                isNewsletter ? "bg-blue-600" : "bg-[#c8102e]"
                              }`}
                            />
                          )}
                        </h3>
                        {msg.subject && (
                          <div className="mt-1">
                            <span
                              className={`text-[11px] font-bold inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md ${
                                isNewsletter
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-50 text-[#c8102e]"
                              }`}
                            >
                              {isNewsletter && <Newspaper className="h-3 w-3" />}
                              {msg.subject}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium shrink-0">
                      <Clock className="h-3 w-3" />
                      {new Date(msg.createdAt).toLocaleDateString("ar-EG", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                    <a
                      href={`tel:${msg.phone}`}
                      className="flex items-center gap-1.5 hover:text-[#c8102e] transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#c8102e]" />
                      <span dir="ltr">{msg.phone}</span>
                    </a>
                    {msg.email && (
                      <a
                        href={`mailto:${msg.email}`}
                        className="flex items-center gap-1.5 hover:text-[#c8102e] transition-colors truncate"
                      >
                        <Mail className="h-3.5 w-3.5 text-[#c8102e]" />
                        <span dir="ltr" className="truncate">
                          {msg.email}
                        </span>
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-foreground leading-relaxed bg-background p-3 rounded-xl border border-border/60 line-clamp-3">
                    "{msg.message}"
                  </p>
                </div>

                {/* CARD ACTIONS */}
                <div className="flex items-center justify-between border-t border-border/80 pt-3">
                  <button
                    onClick={() => handleToggleRead(msg)}
                    className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      msg.read
                        ? "text-muted-foreground hover:text-foreground bg-accent/50"
                        : "text-[#c8102e] bg-red-100/60 hover:bg-red-100"
                    }`}
                  >
                    {msg.read ? (
                      <MailOpen className="h-3.5 w-3.5" />
                    ) : (
                      <Mail className="h-3.5 w-3.5" />
                    )}
                    <span>{msg.read ? "تعليم كغير مقروء" : "تحديد كمقروء"}</span>
                  </button>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleOpenMessage(msg)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>عرض التفاصيل</span>
                    </button>

                    <button
                      onClick={() => handleDelete(msg.id)}
                      title="حذف الرسالة"
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MESSAGE DETAILS MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 dir-rtl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#c8102e]" />
                <h3 className="font-bold text-base text-foreground">تفاصيل الرسالة</h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl">
                <span className="font-bold text-gray-700">الراسل:</span>
                <span className="font-extrabold text-foreground">{selectedMessage.name}</span>
              </div>

              {selectedMessage.subject && (
                <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl">
                  <span className="font-bold text-gray-700">الموضوع:</span>
                  <span
                    className={`font-bold inline-flex items-center gap-1.5 ${
                      selectedMessage.subject === "طلب اشتراك في النشرة البريدية"
                        ? "text-blue-600"
                        : "text-[#c8102e]"
                    }`}
                  >
                    {selectedMessage.subject === "طلب اشتراك في النشرة البريدية" && (
                      <Newspaper className="h-4 w-4" />
                    )}
                    {selectedMessage.subject}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 p-3 rounded-xl space-y-1">
                  <span className="font-bold text-gray-500 block text-[11px]">الهاتف</span>
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    dir="ltr"
                    className="font-bold text-[#c8102e] hover:underline block"
                  >
                    {selectedMessage.phone}
                  </a>
                </div>

                <div className="bg-muted/40 p-3 rounded-xl space-y-1">
                  <span className="font-bold text-gray-500 block text-[11px]">
                    البريد الإلكتروني
                  </span>
                  <a
                    href={`mailto:${selectedMessage.email || ""}`}
                    dir="ltr"
                    className="font-bold text-[#c8102e] hover:underline truncate block"
                  >
                    {selectedMessage.email || "غير محدد"}
                  </a>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="font-bold text-gray-700 block">نص الرسالة:</span>
                <div className="p-4 rounded-xl bg-background border border-border leading-relaxed whitespace-pre-wrap text-foreground font-medium">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground pt-1 text-left">
                تاريخ الإرسال: {new Date(selectedMessage.createdAt).toLocaleString("ar-EG")}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                onClick={() => handleDelete(selectedMessage.id)}
                className="px-4 py-2 rounded-xl bg-red-50 text-[#c8102e] hover:bg-red-100 text-xs font-bold transition-colors"
              >
                حذف الرسالة
              </button>

              <button
                onClick={() => setSelectedMessage(null)}
                className="px-5 py-2 rounded-xl bg-[#c8102e] text-white text-xs font-bold hover:bg-red-700 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
