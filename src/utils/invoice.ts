// منطق الفاتورة الخالص: الرقم المسلسل، احتساب الضريبة، وتنسيق الأرقام والتواريخ.
// بلا React وبلا Firestore، حتى يبقى قابلاً للاستدعاء من أي مكان ومن دون دورات
// استيراد (services/firestore يستورد من هنا، لا العكس).

import { isValidVatNumber } from "../config/business";
import type { BusinessInfo } from "../config/business";

// ==================== الحقول التي تحتاجها الفاتورة من الطلب ====================
// نوع بنيوي مُصغّر بدلاً من FirestoreOrder، لتفادي دورة الاستيراد.

export interface InvoiceOrderFields {
  total: number;
  subtotal?: number;
  shippingCost?: number;
  createdAt: Date | { toDate: () => Date } | string | number;
  invoiceNumber?: string;
  invoiceCrNumber?: string;
  invoiceVatNumber?: string;
  invoiceVatRate?: number;
  invoiceVatAmount?: number;
}

/** لقطة الفاتورة التي تُثبَّت على مستند الطلب لحظة إنشائه. */
export interface InvoiceSnapshot {
  invoiceNumber: string;
  invoiceCrNumber: string;
  invoiceVatNumber: string;
  invoiceVatRate: number;
  invoiceVatAmount: number;
}

// ==================== التواريخ ====================

/** Firestore يعيد Timestamp، والواجهة قد تمرّر Date أو نصاً. نوحّدها هنا. */
export const toDate = (value: InvoiceOrderFields["createdAt"]): Date => {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value) {
    try {
      return value.toDate();
    } catch {
      return new Date();
    }
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  return new Date();
};

const pad = (n: number, width: number) => String(n).padStart(width, "0");

// ==================== الرقم المسلسل ====================

/**
 * مسلسل مشتق من الزمن: TRF-20261124-51932
 * (البادئة + التاريخ + عدد الثواني من بداية اليوم بخمس خانات).
 * فريد، ومتزايد دائماً، ويُرتَّب نصياً بالترتيب الزمني الصحيح.
 */
export const buildInvoiceSerial = (date: Date, prefix = "INV"): string => {
  const secondsIntoDay =
    date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1, 2)}${pad(
    date.getDate(),
    2,
  )}`;
  return `${(prefix || "INV").toUpperCase()}-${stamp}-${pad(secondsIntoDay, 5)}`;
};

/**
 * رقم الفاتورة المعروض: المثبّت على الطلب إن وُجد، وإلا مشتق من تاريخ إنشائه.
 * الاشتقاق يجعل الطلبات التي سبقت هذه الميزة تحمل رقماً ثابتاً لا يتغيّر بين
 * عرضٍ وآخر.
 */
export const resolveInvoiceNumber = (
  order: InvoiceOrderFields,
  prefix = "INV",
): string =>
  order.invoiceNumber || buildInvoiceSerial(toDate(order.createdAt), prefix);

// ==================== الضريبة ====================

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * تُبنى لحظة إنشاء الطلب فقط. الأسعار المعروضة في السعودية شاملة للضريبة
 * نظاماً، فالمبلغ المحصّل هو الإجمالي النهائي والضريبة مستخرجة منه:
 *   الضريبة = الإجمالي × النسبة ÷ (100 + النسبة)
 * وبهذا لا يتغيّر أي سعر ولا تتغيّر حسابات السلة.
 */
export const buildInvoiceSnapshot = (
  business: BusinessInfo,
  total: number,
  issuedAt: Date,
): InvoiceSnapshot => {
  const registered = isValidVatNumber(business.vatNumber);
  const rate = registered ? business.vatRate || 15 : 0;
  const vatAmount = registered ? round2((total * rate) / (100 + rate)) : 0;

  return {
    invoiceNumber: buildInvoiceSerial(issuedAt, business.invoicePrefix),
    invoiceCrNumber: business.crNumber || "",
    invoiceVatNumber: registered ? business.vatNumber.trim() : "",
    invoiceVatRate: rate,
    invoiceVatAmount: vatAmount,
  };
};

export interface InvoiceTotals {
  subtotal: number;
  shipping: number;
  /** الوعاء الضريبي = الإجمالي − الضريبة. يساوي الإجمالي عند عدم التسجيل. */
  netTotal: number;
  vatAmount: number;
  vatRate: number;
  total: number;
  /** صحيح فقط إذا حمل الطلب رقماً ضريبياً صالحاً لحظة إنشائه. */
  isTaxInvoice: boolean;
}

/**
 * يقرأ الأرقام من لقطة الطلب لا من الإعدادات الحالية: الفاتورة سجل تاريخي،
 * فلا يصح أن تتغيّر لأن أحداً عدّل إعدادات المتجر بعد البيع.
 */
export const computeInvoiceTotals = (
  order: InvoiceOrderFields,
): InvoiceTotals => {
  const total = round2(Number(order.total) || 0);
  const shipping = round2(Number(order.shippingCost) || 0);
  const subtotal = round2(
    order.subtotal != null ? Number(order.subtotal) : Math.max(total - shipping, 0),
  );

  const vatNumber = (order.invoiceVatNumber || "").trim();
  const vatRate = Number(order.invoiceVatRate) || 0;
  const isTaxInvoice = vatNumber.length > 0 && vatRate > 0;

  const vatAmount = isTaxInvoice
    ? round2(
        order.invoiceVatAmount != null
          ? Number(order.invoiceVatAmount)
          : (total * vatRate) / (100 + vatRate),
      )
    : 0;

  return {
    subtotal,
    shipping,
    netTotal: round2(total - vatAmount),
    vatAmount,
    vatRate,
    total,
    isTaxInvoice,
  };
};

// ==================== التنسيق ====================
// nu-latn مقصود: أسماء الشهور بالعربية مع أرقام لاتينية، لأن الفاتورة تُقرأ من
// جهة حكومية أو بنك. و ca-gregory مقصود كذلك: "ar-SA" المجرّد يُخرج تاريخاً
// هجرياً على بعض المتصفحات، وهو غير مقبول على فاتورة.

const SAR = new Intl.NumberFormat("ar-SA-u-nu-latn", {
  style: "currency",
  currency: "SAR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatSAR = (amount: number): string =>
  SAR.format(Number.isFinite(amount) ? amount : 0);

const AR_DATE = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const AR_TIME = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  hour: "2-digit",
  minute: "2-digit",
});

const EN_DATETIME = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatInvoiceDate = (value: InvoiceOrderFields["createdAt"]) =>
  AR_DATE.format(toDate(value));

export const formatInvoiceTime = (value: InvoiceOrderFields["createdAt"]) =>
  AR_TIME.format(toDate(value));

export const formatInvoiceDateEn = (value: InvoiceOrderFields["createdAt"]) =>
  EN_DATETIME.format(toDate(value));

// ==================== مسمّيات طرق الدفع ====================

const PAYMENT_LABELS: Record<string, { ar: string; en: string }> = {
  cash: { ar: "الدفع عند الاستلام", en: "Cash on delivery" },
  bank: { ar: "تحويل بنكي", en: "Bank transfer" },
  card: { ar: "بطاقة ائتمانية", en: "Credit / debit card" },
  paypal: { ar: "باي بال", en: "PayPal" },
  tamara: { ar: "تمارا — تقسيط", en: "Tamara instalments" },
  tabby: { ar: "تابي — تقسيط", en: "Tabby instalments" },
};

export const paymentLabel = (method: string) =>
  PAYMENT_LABELS[method] || { ar: method || "—", en: method || "—" };
