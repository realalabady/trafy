// تفقيط المبالغ بالعربية — سطر "فقط ... لا غير" المعتاد في الفواتير السعودية.
// النطاق المدعوم: 0 إلى 999,999.99 ريالاً. ما فوقه يُعاد رقماً كما هو.

const ONES = [
  "",
  "واحد",
  "اثنان",
  "ثلاثة",
  "أربعة",
  "خمسة",
  "ستة",
  "سبعة",
  "ثمانية",
  "تسعة",
];

const TEENS = [
  "عشرة",
  "أحد عشر",
  "اثنا عشر",
  "ثلاثة عشر",
  "أربعة عشر",
  "خمسة عشر",
  "ستة عشر",
  "سبعة عشر",
  "ثمانية عشر",
  "تسعة عشر",
];

const TENS = [
  "",
  "",
  "عشرون",
  "ثلاثون",
  "أربعون",
  "خمسون",
  "ستون",
  "سبعون",
  "ثمانون",
  "تسعون",
];

const HUNDREDS = [
  "",
  "مائة",
  "مئتان",
  "ثلاثمائة",
  "أربعمائة",
  "خمسمائة",
  "ستمائة",
  "سبعمائة",
  "ثمانمائة",
  "تسعمائة",
];

// 1 → 999
const belowThousand = (n: number): string => {
  const parts: string[] = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;

  if (hundreds > 0) parts.push(HUNDREDS[hundreds]);

  if (rest > 0) {
    if (rest < 10) {
      parts.push(ONES[rest]);
    } else if (rest < 20) {
      parts.push(TEENS[rest - 10]);
    } else {
      const unit = rest % 10;
      const ten = Math.floor(rest / 10);
      // العربية تقدّم الوحدة على العشرة: "واحد وعشرون".
      parts.push(unit > 0 ? `${ONES[unit]} و${TENS[ten]}` : TENS[ten]);
    }
  }

  return parts.join(" و");
};

// 0 → 999,999
const wholeToWords = (n: number): string => {
  if (n === 0) return "صفر";
  if (n < 1000) return belowThousand(n);

  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;

  let head: string;
  if (thousands === 1) head = "ألف";
  else if (thousands === 2) head = "ألفان";
  else if (thousands <= 10) head = `${ONES[thousands]} آلاف`;
  else head = `${belowThousand(thousands)} ألفاً`;

  return rest > 0 ? `${head} و${belowThousand(rest)}` : head;
};

/**
 * يحوّل مبلغاً بالريال إلى عبارة التفقيط الكاملة.
 * مثال: 1320.5 → "فقط ألف وثلاثمائة وعشرون ريالاً وخمسون هللة لا غير"
 */
export const amountToArabicWords = (amount: number): string => {
  if (!Number.isFinite(amount) || amount < 0) return "";

  // التقريب على هللتين قبل الفصل، وإلا ظهر 0.995 بوصفه "99 هللة".
  const cents = Math.round(amount * 100);
  const riyals = Math.floor(cents / 100);
  const halalas = cents % 100;

  if (riyals > 999999) return "";

  const riyalPart = `${wholeToWords(riyals)} ريالاً`;
  const halalaPart =
    halalas > 0 ? ` و${wholeToWords(halalas)} هللة` : "";

  return `فقط ${riyalPart}${halalaPart} لا غير`;
};

export default amountToArabicWords;
