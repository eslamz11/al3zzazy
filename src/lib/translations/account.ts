/** Customer account area: auth, dashboard, orders, addresses and settings. */
export const accountDict = {
  "account.title": { ar: "حسابي", en: "My account" },
  "account.login": { ar: "تسجيل الدخول", en: "Sign in" },
  "account.register": { ar: "إنشاء حساب", en: "Create account" },
  "account.logout": { ar: "تسجيل الخروج", en: "Sign out" },
  "account.orders": { ar: "طلباتي", en: "My orders" },
  "account.profile": { ar: "بياناتي", en: "Profile" },
  "account.addresses": { ar: "عناويني", en: "My addresses" },
  "account.password": { ar: "كلمة المرور", en: "Password" },
  "account.remember": { ar: "تذكرني", en: "Remember me" },
  "account.forgot": { ar: "نسيت كلمة المرور؟", en: "Forgot your password?" },
  "account.noAccount": { ar: "ليس لديك حساب؟ ", en: "Don't have an account? " },
  "account.hasAccount": { ar: "لديك حساب بالفعل؟ ", en: "Already have an account? " },
  "account.welcome": { ar: "مرحبًا", en: "Welcome" },
  "account.save": { ar: "حفظ التغييرات", en: "Save changes" },
  "account.saved": { ar: "تم حفظ البيانات", en: "Changes saved" },
  "account.loginRequired": {
    ar: "سجّل الدخول لعرض هذه الصفحة.",
    en: "Sign in to view this page.",
  },
  "account.dashboard": { ar: "لوحة التحكم", en: "Dashboard" },
  "account.settings": { ar: "إعدادات الحساب", en: "Account settings" },

  // dashboard
  "account.totalOrders": { ar: "إجمالي الطلبات", en: "Total orders" },
  "account.totalSpent": { ar: "إجمالي المشتريات", en: "Total spent" },
  "account.recentOrders": { ar: "أحدث الطلبات", en: "Recent orders" },
  "account.noOrders": { ar: "لم تقم بإجراء أي طلبات", en: "You haven't placed any orders yet" },
  "account.noOrdersYet": {
    ar: "لم تقم بإجراء أي طلبات حتى الآن.",
    en: "You haven't placed any orders yet.",
  },
  "account.noOrdersHint": {
    ar: "عندما تقوم بالشراء، ستظهر طلباتك هنا.",
    en: "Once you place an order, it will appear here.",
  },
  "account.startShopping": { ar: "ابدأ التسوق", en: "Start shopping" },
  "account.shopNow": { ar: "تسوق الآن", en: "Shop now" },
  "account.orderNumber": { ar: "طلب #{number}", en: "Order #{number}" },

  // admin promo card (storefront side)
  "account.adminPanel": { ar: "لوحة إدارة المتجر", en: "Store admin panel" },
  "account.adminPanelText": {
    ar: "أنت تمتلك صلاحيات مدير. يمكنك إدارة المنتجات، الطلبات، والعملاء.",
    en: "You have administrator access. Manage products, orders and customers.",
  },
  "account.adminPanelCta": { ar: "الدخول للوحة التحكم", en: "Open the dashboard" },

  // orders list
  "orders.title": { ar: "طلباتي", en: "My orders" },
  "orders.orderNumber": { ar: "رقم الطلب", en: "Order number" },
  "orders.orderDate": { ar: "تاريخ الطلب", en: "Order date" },
  "orders.total": { ar: "الإجمالي", en: "Total" },
  "orders.status": { ar: "حالة الطلب", en: "Order status" },
  "orders.products": { ar: "المنتجات ({count})", en: "Items ({count})" },
  "orders.viewDetails": { ar: "عرض التفاصيل", en: "View details" },

  // order details
  "orderDetails.notFound": { ar: "الطلب غير موجود", en: "Order not found" },
  "orderDetails.notFoundHint": {
    ar: "لم نتمكن من العثور على هذا الطلب في حسابك.",
    en: "We couldn't find this order in your account.",
  },
  "orderDetails.backToOrders": { ar: "العودة لطلباتي", en: "Back to my orders" },
  "orderDetails.items": { ar: "المنتجات المطلوبة ({count})", en: "Items ordered ({count})" },
  "orderDetails.timeline": { ar: "سجل تتبع الطلب", en: "Order tracking history" },
  "orderDetails.costSummary": { ar: "ملخص التكلفة", en: "Cost summary" },
  "orderDetails.subtotal": { ar: "المجموع الفرعي", en: "Subtotal" },
  "orderDetails.shipping": { ar: "الشحن", en: "Shipping" },
  "orderDetails.discount": { ar: "الخصم", en: "Discount" },
  "orderDetails.total": { ar: "الإجمالي", en: "Total" },
  "orderDetails.paymentMethod": { ar: "طريقة الدفع", en: "Payment method" },
  "orderDetails.deliveryAddress": { ar: "عنوان التوصيل", en: "Delivery address" },
  "orderDetails.unitPrice": { ar: "{price} للوحدة", en: "{price} each" },
  "orderDetails.note": { ar: "ملاحظة: ", en: "Note: " },

  // addresses
  "addresses.title": { ar: "عناويني", en: "My addresses" },
  "addresses.intro": {
    ar: "احفظ عنوانك الافتراضي ليتم ملء بيانات الشحن تلقائياً عند إتمام الشراء.",
    en: "Save your default address so your shipping details are filled in automatically at checkout.",
  },
  "addresses.saved": { ar: "تم حفظ العنوان بنجاح!", en: "Address saved successfully!" },
  "addresses.missingFields": {
    ar: "يرجى إكمال الحقول المطلوبة: المحافظة، المدينة، الشارع.",
    en: "Please complete the required fields: governorate, city and street.",
  },
  "addresses.saveFailed": {
    ar: "حدث خطأ أثناء الحفظ. يرجى المحاولة مجدداً.",
    en: "Something went wrong while saving. Please try again.",
  },
  "addresses.notesLabel": { ar: "ملاحظات إضافية (اختياري)", en: "Additional notes (optional)" },
  "addresses.saveButton": { ar: "حفظ العنوان", en: "Save address" },
  "addresses.currentTitle": { ar: "العنوان المحفوظ حالياً", en: "Currently saved address" },

  // account settings
  "settings.title": { ar: "إعدادات الحساب", en: "Account settings" },
  "settings.updated": { ar: "تم تحديث بياناتك بنجاح!", en: "Your details were updated!" },
  "settings.nameRequired": { ar: "الاسم مطلوب.", en: "Your name is required." },
  "settings.saveFailed": {
    ar: "حدث خطأ أثناء الحفظ. يرجى المحاولة مجدداً.",
    en: "Something went wrong while saving. Please try again.",
  },
  "settings.fullName": { ar: "الاسم الكامل", en: "Full name" },
  "settings.fullNamePlaceholder": { ar: "أحمد محمد علي", en: "Akim" },
  "settings.phone": { ar: "رقم الهاتف", en: "Phone number" },
  "settings.email": { ar: "البريد الإلكتروني", en: "Email address" },
  "settings.emailLocked": {
    ar: "لا يمكن تغيير البريد الإلكتروني.",
    en: "Your email address can't be changed.",
  },
  "settings.saveButton": { ar: "حفظ التعديلات", en: "Save changes" },

  // auth screens
  "auth.loginTitle": { ar: "تسجيل الدخول", en: "Sign in" },
  "auth.loginSubtitle": {
    ar: "مرحباً بعودتك! سجل الدخول لمتابعة طلباتك.",
    en: "Welcome back! Sign in to view and track your orders.",
  },
  "auth.registerTitle": { ar: "حساب جديد", en: "Create account" },
  "auth.registerSubtitle": {
    ar: "أنشئ حساباً للوصول السريع وتتبع طلباتك.",
    en: "Create an account for faster checkout and order tracking.",
  },
  "auth.googleSignIn": { ar: "تسجيل الدخول باستخدام جوجل", en: "Continue with Google" },
  "auth.googleSignUp": { ar: "التسجيل باستخدام حساب جوجل", en: "Sign up with Google" },
  "auth.googleConnecting": { ar: "جاري الاتصال بجوجل...", en: "Connecting to Google…" },
  "auth.orEmail": { ar: "أو عبر البريد", en: "or use your email" },
  "auth.orDetails": { ar: "أو أدخل بياناتك", en: "or enter your details" },
  "auth.email": { ar: "البريد الإلكتروني", en: "Email address" },
  "auth.password": { ar: "كلمة المرور", en: "Password" },
  "auth.fullName": { ar: "الاسم بالكامل", en: "Full name" },
  "auth.fullNamePlaceholder": { ar: "أحمد محمد", en: "John Smith" },
  "auth.phone": { ar: "رقم الهاتف", en: "Phone number" },
  "auth.signingIn": { ar: "جاري الدخول...", en: "Signing in…" },
  "auth.creatingAccount": { ar: "جاري إنشاء الحساب...", en: "Creating account…" },
  "auth.createAccount": { ar: "إنشاء حساب", en: "Create account" },
  "auth.createNewAccount": { ar: "إنشاء حساب جديد", en: "Create a new account" },
  "auth.signIn": { ar: "تسجيل الدخول", en: "Sign in" },

  // auth errors
  "auth.errorCredentials": {
    ar: "خطأ في تسجيل الدخول. تأكد من البريد وكلمة المرور.",
    en: "Sign-in failed. Please check your email and password.",
  },
  "auth.errorExists": {
    ar: "هذا البريد الإلكتروني مسجل بالفعل.",
    en: "This email address is already registered.",
  },
  "auth.errorWeakPassword": {
    ar: "كلمة المرور ضعيفة، استخدم ٦ أحرف على الأقل.",
    en: "That password is too weak. Use at least 6 characters.",
  },
  "auth.errorRegister": {
    ar: "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.",
    en: "We couldn't create your account. Please try again.",
  },
  "auth.errorPopupClosed": {
    ar: "تم إغلاق نافذة الدخول بجوجل.",
    en: "The Google sign-in window was closed.",
  },
  "auth.errorPopupBlocked": {
    ar: "تم حظر النافذة المنبثقة من المتصفح.",
    en: "Your browser blocked the sign-in popup.",
  },
  "auth.errorGoogle": {
    ar: "فشل تسجيل الدخول بواسطة جوجل.",
    en: "Google sign-in failed.",
  },
  "auth.errorUnknown": {
    ar: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.",
    en: "Something went wrong. Please try again.",
  },
} as const;
