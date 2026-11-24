import { useLegalContent } from "../../hooks/useLegalContent";
import LegalDocumentView from "./LegalDocumentView";

// النص نفسه يحرره الأدمن من لوحة التحكم (/dashboard/legal) ويُحفظ في
// settings/legal. القيم الافتراضية في src/data/legalContent.ts.
const Shipping = () => {
  const content = useLegalContent();
  return <LegalDocumentView doc={content.shipping} />;
};

export default Shipping;
