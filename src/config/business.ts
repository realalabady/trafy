// الهوية النظامية للمتجر — الاسم القانوني والسجل التجاري والرقم الضريبي.
// المصدر المُحرَّر هو Firestore: stores/{storeId}/settings/store.business، تُحرّره
// لوحة التحكم. القيم هنا هي القيم الافتراضية التي تظهر قبل أول حفظ، وهي نفس
// أرقام شهادة وزارة التجارة حتى لا يُطبع مستند ناقص أبداً.

export interface BusinessInfo {
  legalName: string;
  legalNameEn: string;
  crNumber: string;
  crUnifiedNumber: string;
  crVerifyUrl: string;
  /** الرقم الضريبي (15 رقماً). فارغ = المتجر غير مسجّل في ضريبة القيمة المضافة. */
  vatNumber: string;
  vatRate: number;
  addressAr: string;
  addressEn: string;
  logoUrl: string;
  invoicePrefix: string;
  invoiceNotes: string;
}

export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  legalName: "ترفي",
  legalNameEn: "Trafy",
  crNumber: "2050163922",
  crUnifiedNumber: "7031637155",
  crVerifyUrl:
    "https://qr.saudibusiness.gov.sa/viewcr?nCrNumber=yCpbA1mXQOPGGxaQyIMbsQ==",
  vatNumber: "",
  vatRate: 15,
  addressAr: "المملكة العربية السعودية",
  addressEn: "Kingdom of Saudi Arabia",
  logoUrl: "",
  invoicePrefix: "TRF",
  invoiceNotes: "",
};

// الرقم الضريبي السعودي: 15 رقماً، يبدأ بـ 3 وينتهي بـ 3.
// الفاتورة لا تُظهر سطر الضريبة إلا إذا نجح هذا الفحص — إظهار ضريبة دون تسجيل
// مخالفة، فلا نتيح الحالة أصلاً.
export const isValidVatNumber = (value: string): boolean =>
  /^3\d{13}3$/.test((value || "").trim());
