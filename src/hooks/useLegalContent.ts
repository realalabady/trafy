import { useEffect, useState } from "react";
import { getLegalContent } from "../services/firestore";
import {
  DEFAULT_LEGAL_CONTENT,
  cloneLegalContent,
  mergeLegalContent,
  type LegalContent,
} from "../data/legalContent";

/**
 * محتوى الصفحات القانونية كما يراه الزائر.
 *
 * يبدأ بالنص الافتراضي فوراً (لا وميض صفحة فارغة ولا انتظار الشبكة)، ثم
 * يستبدله بما حفظه الأدمن من لوحة التحكم بعد قراءة واحدة من Firestore.
 * إذا فشلت القراءة أو لم يُحفظ شيء بعد، تبقى النصوص الافتراضية معروضة.
 *
 * قراءة واحدة لا onSnapshot: النص القانوني لا يتغير أثناء تصفح العميل،
 * ومستمع دائم على كل صفحة قانونية تكلفة بلا مقابل.
 */
export const useLegalContent = (): LegalContent => {
  const [content, setContent] = useState<LegalContent>(() =>
    cloneLegalContent(DEFAULT_LEGAL_CONTENT),
  );

  useEffect(() => {
    let active = true;
    getLegalContent()
      .then((stored) => {
        if (active && stored) setContent(mergeLegalContent(stored));
      })
      .catch((error) => {
        // قبل نشر قواعد settings/legal تعود القراءة بـ permission-denied.
        // الصفحة تبقى على النص الافتراضي بدل أن تنهار.
        console.error(
          "[Legal] تعذّرت قراءة settings/legal، سيُعرض النص الافتراضي:",
          error instanceof Error ? error.message : error,
        );
      });
    return () => {
      active = false;
    };
  }, []);

  return content;
};
