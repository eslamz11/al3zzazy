/**
 * Core UI dictionary: brand, navigation, header, footer, shared components,
 * generic actions, and global states.
 *
 * Keep every entry as `{ ar, en }`. Arabic copy must never change behaviour for
 * the existing Arabic experience — only English is being completed.
 */
export const coreDict = {
  // brand
  "brand.name": { ar: "سليب هاي", en: "SleepHigh" },
  "brand.tagline": { ar: "نوم مصري فاخر", en: "Egyptian premium sleep" },
  "brand.logoAlt": { ar: "سليب هاي SLEEP HIGH", en: "SleepHigh" },
  "brand.fullName": {
    ar: "سليب هاي (SleepHigh Egyptian Bedding System)",
    en: "SleepHigh Egyptian Bedding System",
  },
  "brand.description": {
    ar: "سليب هاي هي العلامة التجارية المصرية الأولى المتخصصة في إنتاج وتفصيل المراتب الطبية والوسائد المصنعة وفق مواصفات النوم الفندقي الفاخر.",
    en: "SleepHigh is Egypt's leading bedding brand, specialising in medical mattresses and pillows built to luxury hotel sleep standards.",
  },

  // announcement
  "announce.freeShipping": {
    ar: "التوصيل المجاني لكل أهالي كفر الزيات",
    en: "Free delivery across Kafr El Zayat",
  },
  "announce.cod": { ar: "الدفع عند الاستلام متاح", en: "Cash on delivery available" },
  "announce.warranty": { ar: "ضمان يصل إلى ٥ سنوات", en: "Up to 5 years warranty" },
  "announce.warrantyShort": { ar: "ضمان ٥ سنوات", en: "5-year warranty" },
  "announce.close": { ar: "إغلاق الإعلان", en: "Dismiss announcement" },

  // nav
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.mattresses": { ar: "المراتب", en: "Mattresses" },
  "nav.pillows": { ar: "الوسائد", en: "Pillows" },
  "nav.collections": { ar: "كل المنتجات", en: "Shop all" },
  "nav.collectionsShort": { ar: "المجموعة", en: "Shop" },
  "nav.about": { ar: "من نحن", en: "About us" },
  "nav.contact": { ar: "تواصل معنا", en: "Contact" },
  "nav.menu": { ar: "القائمة", en: "Menu" },
  "nav.close": { ar: "إغلاق", en: "Close" },
  "nav.closeMenu": { ar: "إغلاق القائمة", en: "Close menu" },
  "nav.language": { ar: "اللغة", en: "Language" },
  "nav.navigation": { ar: "التنقل", en: "Navigation" },
  "nav.accountSection": { ar: "الحساب", en: "Account" },
  "nav.signIn": { ar: "تسجيل الدخول", en: "Sign in" },
  "nav.adminDashboard": { ar: "لوحة التحكم", en: "Admin Dashboard" },
  "nav.otherLanguage": { ar: "English", en: "العربية" },
  "nav.switchLanguage": { ar: "Switch to English", en: "التحويل للعربية" },

  // header actions
  "header.search": { ar: "ابحث عن منتج", en: "Search products" },
  "header.searchShort": { ar: "بحث", en: "Search" },
  "header.searchPlaceholder": { ar: "بحث عن منتج...", en: "Search products…" },
  "header.searchPlaceholderMobile": { ar: "ابحث عن أي شيء...", en: "Search anything…" },
  "header.searchClear": { ar: "مسح البحث", en: "Clear search" },
  "header.account": { ar: "حسابي", en: "Account" },
  "header.wishlist": { ar: "المفضلة", en: "Wishlist" },
  "header.cart": { ar: "السلة", en: "Cart" },

  // hero
  "hero.title": { ar: "نوم أفضل يبدأ من هنا", en: "Better sleep starts here" },
  "hero.subtitle": {
    ar: "اكتشف منتجات نوم مصممة لتمنحك الراحة والدعم كل ليلة، بخامات مختارة وتصنيع مصري بمعايير عالية.",
    en: "Discover sleep essentials engineered for comfort and support every night, with carefully selected materials and high-standard Egyptian craftsmanship.",
  },
  "hero.ctaPrimary": { ar: "تسوق الآن", en: "Shop now" },
  "hero.ctaSecondary": { ar: "اكتشف المراتب", en: "Explore mattresses" },
  "hero.slide": { ar: "شريحة {index}", en: "Slide {index}" },

  // sections
  "section.categories": { ar: "تسوق حسب الفئة", en: "Shop by category" },
  "section.categoriesSub": {
    ar: "مجموعات مصممة لتناسب كل احتياج نوم",
    en: "Collections built around every sleep need",
  },
  "section.popular": { ar: "الأكثر مبيعًا", en: "Best sellers" },
  "section.popularSub": {
    ar: "اختيارات عملائنا الأكثر طلبًا",
    en: "Our customers' most requested picks",
  },
  "section.mattresses": { ar: "المراتب", en: "Mattresses" },
  "section.mattressesSub": {
    ar: "دعم متوازن ونوم أعمق مع تشكيلة المراتب",
    en: "Balanced support and deeper sleep",
  },
  "section.pillows": { ar: "الوسائد", en: "Pillows" },
  "section.pillowsSub": {
    ar: "ارتفاعات وخامات مختلفة لكل وضعية نوم",
    en: "Different lofts and fills for every sleep position",
  },
  "section.toppers": { ar: "التطرية وواقي المرتبة", en: "Toppers & protectors" },
  "section.toppersSub": {
    ar: "طبقة راحة إضافية وحماية تدوم",
    en: "An extra comfort layer and lasting protection",
  },
  "section.benefits": { ar: "لماذا سليب هاي", en: "Why SleepHigh" },
  "section.testimonials": { ar: "آراء عملائنا", en: "What our customers say" },
  "section.related": { ar: "منتجات مشابهة", en: "You may also like" },
  "section.viewAll": { ar: "عرض الكل", en: "View all" },

  // benefits
  "benefit.delivery": { ar: "توصيل آمن", en: "Safe delivery" },
  "benefit.deliveryText": {
    ar: "تغليف محكم وتوصيل حتى باب منزلك.",
    en: "Protective packaging delivered to your door.",
  },
  "benefit.quality": { ar: "منتجات عالية الجودة", en: "High quality products" },
  "benefit.qualityText": {
    ar: "خامات مختارة واختبارات دقيقة لكل دفعة إنتاج.",
    en: "Selected materials and tested production batches.",
  },
  "benefit.support": { ar: "دعم العملاء", en: "Customer support" },
  "benefit.supportShort": { ar: "دعم العملاء", en: "Support" },
  "benefit.supportText": {
    ar: "فريق يساعدك في اختيار المقاس المناسب.",
    en: "A team that helps you pick the right size.",
  },
  "benefit.payment": { ar: "دفع آمن", en: "Secure payment" },
  "benefit.paymentText": {
    ar: "الدفع عند الاستلام أو إلكترونيًا قريبًا.",
    en: "Cash on delivery, with online payment coming soon.",
  },
  "benefit.returns": { ar: "سياسة استرجاع واضحة", en: "Clear return policy" },
  "benefit.returnsShort": { ar: "إرجاع واضح", en: "Easy returns" },
  "benefit.returnsText": {
    ar: "١٤ يومًا للاستبدال أو الإرجاع بشروط بسيطة.",
    en: "14 days to exchange or return with simple terms.",
  },

  // promo
  "promo.eyebrow": { ar: "مجموعة الراحة", en: "Comfort collection" },
  "promo.title": { ar: "طبقة راحة تُغيّر ليلتك", en: "A comfort layer that changes your night" },
  "promo.text": {
    ar: "أضف مرتبة تطرية أو وسادة مناسبة لوضعية نومك واحصل على إحساس جديد تمامًا.",
    en: "Add a topper or the right pillow for your sleep position and feel the difference.",
  },
  "promo.cta": { ar: "تسوق المجموعة", en: "Shop the collection" },

  // newsletter
  "newsletter.title": { ar: "كن أول من يعرف", en: "Be the first to know" },
  "newsletter.text": {
    ar: "احصل على أحدث العروض والمنتجات الجديدة.",
    en: "Get our latest offers and new arrivals.",
  },
  "newsletter.placeholder": { ar: "البريد الإلكتروني", en: "Email address" },
  "newsletter.cta": { ar: "اشترك", en: "Subscribe" },
  "newsletter.success": { ar: "تم الاشتراك بنجاح.", en: "Subscribed successfully." },
  "newsletter.error": {
    ar: "من فضلك أدخل بريدًا إلكترونيًا صحيحًا.",
    en: "Please enter a valid email address.",
  },

  // tabs
  "tab.description": { ar: "وصف المنتج", en: "Description" },
  "tab.materials": { ar: "الخامات", en: "Materials" },
  "tab.features": { ar: "المميزات", en: "Features" },
  "tab.sizes": { ar: "المقاسات", en: "Sizes" },
  "tab.usage": { ar: "طريقة الاستخدام", en: "How to use" },
  "tab.care": { ar: "العناية بالمنتج", en: "Care" },
  "tab.delivery": { ar: "التوصيل", en: "Delivery" },
  "tab.returns": { ar: "الاستبدال والإرجاع", en: "Returns & exchange" },

  // options
  "option.length": { ar: "الطول", en: "Length" },
  "option.width": { ar: "العرض", en: "Width" },
  "option.height": { ar: "الارتفاع", en: "Height" },
  "option.upgrade": { ar: "نوع المنتج", en: "Product type" },
  "option.size": { ar: "المقاس", en: "Size" },
  "option.color": { ar: "اللون", en: "Colour" },

  // size guide
  "sizeGuide.title": { ar: "دليل المقاسات", en: "Size guide" },
  "sizeGuide.intro": {
    ar: "المقاسات بالسنتيمتر. يمكن تصنيع مقاسات خاصة عند الطلب.",
    en: "All measurements in centimetres. Custom sizes available on request.",
  },
  "sizeGuide.name": { ar: "اسم المقاس", en: "Size name" },
  "sizeGuide.length": { ar: "الطول", en: "Length" },
  "sizeGuide.width": { ar: "العرض", en: "Width" },
  "sizeGuide.height": { ar: "الارتفاع", en: "Height" },
  "sizeGuide.usage": { ar: "الاستخدام", en: "Best for" },

  "firmness.soft": { ar: "لينة", en: "Soft" },
  "firmness.medium": { ar: "متوسطة", en: "Medium" },
  "firmness.medium-firm": { ar: "متوسطة إلى صلبة", en: "Medium firm" },
  "firmness.firm": { ar: "صلبة", en: "Firm" },

  // wishlist
  "wishlist.title": { ar: "قائمة الرغبات", en: "Wishlist" },
  "wishlist.empty": { ar: "قائمة الرغبات فارغة", en: "Your wishlist is empty" },
  "wishlist.emptyHint": {
    ar: "احفظ المنتجات التي تعجبك هنا للرجوع إليها لاحقاً.",
    en: "Save the products you like here and come back to them later.",
  },
  "wishlist.loading": { ar: "جاري تحميل قائمة الرغبات...", en: "Loading your wishlist…" },
  "wishlist.explore": { ar: "استكشف المنتجات", en: "Explore products" },
  "wishlist.savedCount": {
    ar: "لديك {count} منتجات محفوظة",
    en: "You have {count} saved products",
  },
  "wishlist.moveToCart": { ar: "أضف إلى السلة", en: "Add to cart" },

  // cart drawer
  "cartDrawer.title": { ar: "سلة الشراء ({count})", en: "Shopping bag ({count})" },
  "cartDrawer.empty": { ar: "السلة فارغة حالياً", en: "Your bag is empty right now" },
  "cartDrawer.browse": { ar: "تصفح المنتجات", en: "Browse products" },
  "cartDrawer.subtotal": { ar: "المجموع الفرعي:", en: "Subtotal:" },
  "cartDrawer.checkout": { ar: "متابعة الشراء", en: "Continue to checkout" },

  // login prompt modal
  "loginPrompt.title": { ar: "سجّل دخولك أولاً", en: "Please sign in first" },
  "loginPrompt.text": {
    ar: "يجب تسجيل الدخول لتتمكن من إضافة المنتجات إلى سلة التسوق أو قائمة المفضلة.",
    en: "Sign in to add products to your cart or wishlist.",
  },
  "loginPrompt.cart": { ar: "سلة التسوق", en: "Shopping cart" },
  "loginPrompt.wishlist": { ar: "المفضلة", en: "Wishlist" },
  "loginPrompt.tracking": { ar: "تتبع الطلبات", en: "Order tracking" },
  "loginPrompt.login": { ar: "تسجيل الدخول", en: "Sign in" },
  "loginPrompt.register": { ar: "إنشاء حساب جديد", en: "Create a new account" },
  "loginPrompt.skip": { ar: "متابعة التصفح بدون تسجيل", en: "Keep browsing without signing in" },

  // PWA install prompt
  "pwa.eyebrow": { ar: "تجربة أفضل", en: "A better experience" },
  "pwa.title": { ar: "حمّل التطبيق مجاناً!", en: "Install the app for free" },
  "pwa.brand": { ar: "سليب هاي مصر", en: "SleepHigh Egypt" },
  "pwa.offline": { ar: "تصفح بدون إنترنت", en: "Browse offline" },
  "pwa.notifications": { ar: "إشعارات العروض", en: "Offer alerts" },
  "pwa.faster": { ar: "تجربة أسرع", en: "Faster experience" },
  "pwa.rating": { ar: "تقييم 4.9 من 5", en: "Rated 4.9 out of 5" },
  "pwa.installed": { ar: "تم التثبيت بنجاح!", en: "Installed successfully!" },
  "pwa.installing": { ar: "جاري التثبيت...", en: "Installing…" },
  "pwa.install": { ar: "تحميل التطبيق مجاناً", en: "Install the free app" },
  "pwa.dismiss": { ar: "لا شكراً، متابعة من المتصفح", en: "No thanks, continue in browser" },

  // footer
  "footer.company": { ar: "عن الشركة", en: "Company" },
  "footer.products": { ar: "المنتجات", en: "Products" },
  "footer.support": { ar: "خدمة العملاء", en: "Customer service" },
  "footer.contact": { ar: "تواصل معنا", en: "Get in touch" },
  "footer.address": {
    ar: "كفر الزيات، محافظة الغربية، مصر",
    en: "Kafr El Zayat, Gharbia, Egypt",
  },
  "footer.rights": { ar: "جميع الحقوق محفوظة", en: "All rights reserved" },
  "footer.social": { ar: "تابعنا", en: "Follow us" },
  "footer.legal": { ar: "الشروط والسياسات", en: "Legal" },
  "footer.branch1": { ar: "فرع أول", en: "Branch 1" },
  "footer.branch2": { ar: "فرع ثانٍ", en: "Branch 2" },
  "footer.customerService": { ar: "خدمة العملاء", en: "Customer service" },
  "footer.sales": { ar: "المبيعات", en: "Sales" },
  "footer.email": { ar: "البريد الإلكتروني", en: "Email" },
  "footer.privacy": { ar: "سياسة الخصوصية", en: "Privacy policy" },
  "footer.terms": { ar: "اتفاقية الاستخدام", en: "Terms of use" },
  "footer.returns": { ar: "سياسة الإرجاع", en: "Return policy" },
  "footer.branch1Address": {
    ar: "كفر الزيات — شارع مجلس المدينة، بجوار البوسطة الجديدة",
    en: "Kafr El Zayat — City Council St., next to the new post office",
  },
  "footer.branch2Address": {
    ar: "كفر الزيات — بنوفر، بجوار بنك ناصر الاجتماعي",
    en: "Kafr El Zayat — Banoufar, next to Nasser Social Bank",
  },
  "footer.payments": {
    ar: "فودافون كاش · بطاقات الائتمان · الدفع عند الاستلام",
    en: "E-wallets · Cards · Cash on delivery",
  },

  // pages
  "page.about": { ar: "من نحن", en: "About us" },
  "page.contact": { ar: "تواصل معنا", en: "Contact us" },
  "page.faq": { ar: "الأسئلة الشائعة", en: "FAQ" },
  "page.terms": { ar: "الشروط والأحكام", en: "Terms & conditions" },
  "page.returns": { ar: "سياسة الإرجاع", en: "Return policy" },
  "page.shipping": { ar: "سياسة التوصيل", en: "Shipping policy" },

  // forms
  "form.required": { ar: "هذا الحقل مطلوب", en: "This field is required" },
  "form.invalidEmail": { ar: "بريد إلكتروني غير صحيح", en: "Invalid email address" },
  "form.invalidPhone": { ar: "رقم هاتف غير صحيح", en: "Invalid phone number" },
  "form.shortPassword": {
    ar: "كلمة المرور يجب أن تكون ٦ أحرف على الأقل",
    en: "Password must be at least 6 characters",
  },
  "form.submit": { ar: "إرسال", en: "Submit" },
  "form.sending": { ar: "جارٍ الإرسال...", en: "Sending…" },

  // loader
  "loader.subtitle": { ar: "نحضّر تجربتك...", en: "Preparing your experience…" },

  // generic
  "common.currency": { ar: "ج.م", en: "EGP" },
  "common.loading": { ar: "جارٍ التحميل...", en: "Loading…" },
  "common.loadingData": { ar: "جاري تحميل البيانات...", en: "Loading data…" },
  "common.error": { ar: "حدث خطأ غير متوقع", en: "Something went wrong" },
  "common.retry": { ar: "إعادة المحاولة", en: "Try again" },
  "common.home": { ar: "الرئيسية", en: "Home" },
  "common.breadcrumb": { ar: "مسار التنقل", en: "Breadcrumb" },
  "common.next": { ar: "التالي", en: "Next" },
  "common.previous": { ar: "السابق", en: "Previous" },
  "common.page": { ar: "صفحة", en: "Page" },
  "common.pagination": { ar: "التنقل بين الصفحات", en: "Pagination" },
  "common.nextPage": { ar: "الصفحة التالية", en: "Next page" },
  "common.previousPage": { ar: "الصفحة السابقة", en: "Previous page" },
  "common.notFound": { ar: "الصفحة غير موجودة", en: "Page not found" },
  "common.notFoundHint": {
    ar: "هذه الصفحة غير موجودة أو تم نقلها.",
    en: "This page doesn't exist or has been moved.",
  },
  "common.backHome": { ar: "العودة للرئيسية", en: "Back to home" },
  "common.errorTitle": { ar: "حدث خطأ غير متوقع", en: "Something went wrong" },
  "common.errorHint": {
    ar: "شيء ما خطأ في تحميل هذه الصفحة. تأكد من اتصالك بالإنترنت أو حاول مرة أخرى.",
    en: "We couldn't load this page. Check your connection and try again.",
  },
  "common.tryAgain": { ar: "حاول مرة أخرى", en: "Try again" },
  "common.offline": {
    ar: "تعذر الاتصال بالشبكة، تحقق من الإنترنت.",
    en: "Network error, please check your connection.",
  },
  "common.all": { ar: "الكل", en: "All" },
  "common.optional": { ar: "اختياري", en: "optional" },
  "common.save": { ar: "حفظ", en: "Save" },
  "common.saving": { ar: "جاري الحفظ...", en: "Saving…" },
  "common.close": { ar: "إغلاق", en: "Close" },
  "common.cancel": { ar: "إلغاء", en: "Cancel" },
  "common.delete": { ar: "حذف", en: "Delete" },
  "common.viewDetails": { ar: "عرض التفاصيل", en: "View details" },
  "common.viewAll": { ar: "عرض الكل", en: "View all" },
  "common.note": { ar: "ملاحظة", en: "Note" },

  // account page
  "account.title": { ar: "حسابي", en: "My account" },
  "account.dashboard": { ar: "لوحة البيانات", en: "Dashboard" },
  "account.orders": { ar: "الطلبات", en: "Orders" },
  "account.addresses": { ar: "العناوين", en: "Addresses" },
  "account.settings": { ar: "الإعدادات", en: "Settings" },
  "account.logout": { ar: "تسجيل الخروج", en: "Logout" },
  "account.adminPanel": { ar: "لوحة التحكم", en: "Admin Dashboard" },
  "account.adminPanelText": {
    ar: "الوصول الكامل إلى لوحة إدارة المتجر",
    en: "Full access to store management dashboard",
  },
  "account.adminPanelCta": { ar: "لوحة التحكم", en: "Admin Dashboard" },

  // admin customer management
  "admin.customers.title": { ar: "قائمة العملاء", en: "Customers" },
  "admin.customers.subtitle": {
    ar: "عرض وحساب بيانات العملاء ومتابعة إجمالي المشتريات",
    en: "View and manage customer data and track purchase totals",
  },
  "admin.customers.loading": { ar: "جاري تحميل العملاء...", en: "Loading customers…" },
  "admin.customers.empty": { ar: "لا يوجد عملاء مسجلون حالياً", en: "No registered customers" },
  "admin.customers.emptyHint": {
    ar: "سيتم إدراج بيانات العملاء فور تسجيلهم أو إنشائهم حسابتهم في المتجر.",
    en: "Customers will appear here once they register or create an account.",
  },
  "admin.customers.searchPlaceholder": {
    ar: "بحث باسم العميل، البريد، أو الهاتف...",
    en: "Search by name, email, or phone...",
  },
  "admin.customers.filterAll": { ar: "الكل", en: "All" },
  "admin.customers.filterAdmins": { ar: "المدراء", en: "Admins" },
  "admin.customers.filterCustomers": { ar: "العملاء", en: "Customers" },
  "admin.customers.customer": { ar: "عميل", en: "Customer" },
  "admin.customers.role": { ar: "الدور", en: "Role" },
  "admin.customers.phone": { ar: "الهاتف", en: "Phone" },
  "admin.customers.email": { ar: "البريد الإلكتروني", en: "Email" },
  "admin.customers.ordersCount": { ar: "عدد الطلبات", en: "Orders" },
  "admin.customers.totalSpent": { ar: "إجمالي الإنفاق", en: "Total spent" },
  "admin.customers.registeredAt": { ar: "تاريخ التسجيل", en: "Registered" },
  "admin.customers.actions": { ar: "الإجراءات", en: "Actions" },
  "admin.customers.viewProfile": { ar: "الملف", en: "Profile" },

  // role badges
  "admin.role.admin": { ar: "مدير", en: "Admin" },
  "admin.role.customer": { ar: "عميل", en: "Customer" },

  // role management actions
  "admin.role.makeAdmin": { ar: "ترقية إلى مدير", en: "Make admin" },
  "admin.role.removeAdmin": { ar: "إزالة صلاحية المدير", en: "Remove admin" },
  "admin.role.changing": { ar: "جاري تحديث الصلاحية...", en: "Updating role..." },

  // confirmations
  "admin.role.confirmPromote": { ar: "تأكيد الترقية", en: "Confirm promotion" },
  "admin.role.confirmPromoteTitle": {
    ar: "ترقية العميل إلى مدير",
    en: "Promote customer to admin",
  },
  "admin.role.confirmPromoteMessage": {
    ar: "سيحصل هذا المستخدم على صلاحيات المدير الكاملة، بما في ذلك الوصول إلى لوحة التحكم وإدارة المنتجات والطلبات والعملاء.",
    en: "This user will gain full administrator access, including dashboard access and the ability to manage products, orders, and customers.",
  },
  "admin.role.confirmDemote": { ar: "تأكيد إزالة الصلاحية", en: "Confirm removal" },
  "admin.role.confirmDemoteTitle": {
    ar: "إزالة صلاحية المدير",
    en: "Remove administrator access",
  },
  "admin.role.confirmDemoteMessage": {
    ar: "سيتم إزالة صلاحيات المدير من هذا المستخدم. لن يتمكن بعد ذلك من الوصول إلى لوحة التحكم أو إدارة المتجر.",
    en: "This user will lose administrator access. They will no longer be able to access the dashboard or manage the store.",
  },
  "admin.role.confirmButton": { ar: "تأكيد", en: "Confirm" },
  "admin.role.cancelButton": { ar: "إلغاء", en: "Cancel" },

  // success messages
  "admin.role.promoteSuccess": {
    ar: "تم ترقية المستخدم إلى مدير بنجاح",
    en: "User promoted to admin successfully",
  },
  "admin.role.demoteSuccess": {
    ar: "تم إزالة صلاحية المدير بنجاح",
    en: "Administrator access removed successfully",
  },

  // error messages
  "admin.role.errorGeneric": {
    ar: "حدث خطأ أثناء تحديث الصلاحية. يرجى المحاولة مرة أخرى.",
    en: "Failed to update role. Please try again.",
  },
  "admin.role.errorNotAuthorized": {
    ar: "ليس لديك صلاحية تنفيذ هذا الإجراء.",
    en: "You are not authorized to perform this action.",
  },
  "admin.role.errorSelfDemote": {
    ar: "لا يمكنك إزالة صلاحية المدير من نفسك.",
    en: "You cannot remove your own administrator access.",
  },
  "admin.role.errorLastAdmin": {
    ar: "لا يمكن إزالة آخر مدير في النظام.",
    en: "Cannot remove the last administrator.",
  },
  "admin.role.errorUserNotFound": {
    ar: "المستخدم غير موجود.",
    en: "User not found.",
  },

  // customer detail
  "admin.customerDetail.title": { ar: "ملف العميل", en: "Customer profile" },
  "admin.customerDetail.personalInfo": { ar: "البيانات الشخصية", en: "Personal information" },
  "admin.customerDetail.customerOrders": { ar: "طلبات العميل", en: "Customer orders" },
  "admin.customerDetail.noOrders": {
    ar: "لا توجد طلبات سابقة لهذا العميل.",
    en: "No previous orders for this customer.",
  },
  "admin.customerDetail.notFound": {
    ar: "العميل المطلوب غير موجود أو لم يتم العثور على حسابه.",
    en: "Customer not found or account does not exist.",
  },
  "admin.customerDetail.name": { ar: "الاسم", en: "Name" },
  "admin.customerDetail.role": { ar: "الدور", en: "Role" },
  "admin.customerDetail.security": { ar: "الحماية والأمان", en: "Security" },
  "admin.customerDetail.securityNote": {
    ar: "•••••••• (محمية ومُشفرة عبر Firebase Auth)",
    en: "•••••••• (Protected and encrypted via Firebase Auth)",
  },
  "admin.customerDetail.grantedAt": { ar: "تاريخ المنح", en: "Granted at" },
  "admin.customerDetail.grantedBy": { ar: "منح بواسطة", en: "Granted by" },
} as const;
