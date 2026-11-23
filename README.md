# متجر إلكتروني (قالب) 🛒

متجر إلكتروني متكامل مبني باستخدام React + TypeScript + Vite

## ✨ المميزات

### المتجر

- 🏠 صفحة رئيسية جذابة مع عروض ومنتجات مميزة
- 📱 تصميم متجاوب يعمل على جميع الأجهزة
- 🛒 سلة تسوق متكاملة مع حفظ البيانات
- 🔍 بحث متقدم في المنتجات
- 📂 تصنيفات متعددة للمنتجات

### لوحة التحكم (Dashboard)

- 📊 لوحة بيانات شاملة مع إحصائيات الدخل والطلبات
- 📦 إدارة المنتجات (إضافة، تعديل، حذف)
- 🏷️ إدارة التصنيفات والتصنيفات الفرعية
- 📋 إدارة الطلبات وتتبع حالتها
- 👥 إدارة العملاء

## 🚀 التشغيل المحلي

### المتطلبات

- Node.js 18+
- npm أو yarn

### التثبيت

\`\`\`bash

# تثبيت المكتبات

npm install

# تشغيل المشروع

npm run dev
\`\`\`

## 🔥 النشر على Firebase

### 1. إنشاء مشروع Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. أنشئ مشروع جديد
3. فعّل Hosting من القائمة الجانبية

### 2. إعداد المشروع

\`\`\`bash

# تسجيل الدخول لـ Firebase

firebase login

# ربط المشروع

firebase init hosting
\`\`\`

### 3. النشر

\`\`\`bash

# بناء المشروع

npm run build

# النشر

firebase deploy
\`\`\`
npm install -g firebase-tools
## 🛠️ التقنيات المستخدمة

- **React 19** - مكتبة واجهات المستخدم
- **TypeScript** - للأمان النوعي
- **Vite** - أداة البناء السريعة
- **React Router** - التنقل بين الصفحات
- **Zustand** - إدارة الحالة
- **Lucide React** - الأيقونات
- **Firebase** - الاستضافة وقاعدة البيانات

---

## 🏪 هذه النسخة: متجر `trafy`

هذه النسخة مربوطة بمشروع Firebase المشترك **`estore-8f76b`** كمتجر مستقل
اسمه **`trafy`** ("ترفي"). اقرأ [SHARED-DB.md](./SHARED-DB.md) قبل أي تعديل على
الوصول للبيانات.

| | القيمة |
|---|---|
| مشروع Firebase | `estore-8f76b` |
| تطبيق الويب | `trafy` (`1:100931623535:web:4b62becf3a4c590cd94b9a`) |
| شجرة البيانات | `stores/trafy/{products,categories,orders,users,settings,contactMessages}` |
| مسار التخزين | `stores/trafy/...` |
| `VITE_STORE_ID` | `trafy` (في `.env` — غير مرفوع إلى Git) |
| الأدمن | `fakealabady@gmail.com` (في هذا المتجر فقط) |

كل المسارات تمر عبر `src/config/store.ts`
(`storeCol` / `storeDoc` / `storagePath` / `withStore`). **لا تكتب
`collection(db, "products")` مباشرة** — المسارات العليا مشتركة بين كل
المتاجر وقواعد الأمان المنشورة ترفضها.

### ⚠️ تحذيرات النشر

المشروع مشترك مع متاجر أخرى (`leapsmart`, `techma`, `halal`, `selfah`, `fool`)،
فأي نشر من هنا يمسّها كلها:

- **الدوال (Functions):** أُزيلت كتلة `functions` من `firebase.json` عمداً.
  مصدر `functions/` في هذه النسخة أقدم بكثير من المنشور فعلياً (المنشور يحوي
  `alibaba*`, `oto*`, `ngenius*`, `madfu*`, `paymentGateway*`, `couponValidate`,
  `auth*Otp` ...). نشرها من هنا يحذف تلك الدوال عن **كل** المتاجر.
- **الاستضافة:** أُضيف `"site": "trafy"`. الموقع غير موجود بعد، فينشئه أولاً:
  `firebase hosting:sites:create trafy`. بدون هذا السطر كان النشر سيكتب فوق
  `estore-8f76b.web.app` الخاص بمتجر آخر.
- **القواعد والفهارس:** `firestore.rules` و `storage.rules` و
  `firestore.indexes.json` منسوخة حرفياً من المنشور حالياً، فنشرها لا يغيّر
  شيئاً — لكنها مشتركة، فأي تعديل عليها يسري على كل المتاجر.
- **Vercel:** أضف `VITE_STORE_ID=trafy` وبقية متغيرات `VITE_FIREBASE_*` في
  إعدادات المشروع قبل أول نشر.

### إدارة المتجر

```bash
npm install --prefix functions          # مطلوب مرة واحدة لسكربتات الإدارة
npm run store:admin -- trafy <email>    # منح أدمن إضافي لهذا المتجر
npm run store:admin -- trafy <email> --revoke
```

السكربتات تستخدم Admin SDK وتتجاوز القواعد؛ سجّل الدخول أولاً بـ
`gcloud auth application-default login`.
