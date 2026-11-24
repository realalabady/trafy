import { useLegalContent } from "../../hooks/useLegalContent";
import LegalDocumentView from "./LegalDocumentView";

// النص نفسه يحرره الأدمن من لوحة التحكم (/dashboard/legal) ويُحفظ في
// settings/legal. القيم الافتراضية في src/data/legalContent.ts.
const Returns = () => {
  const content = useLegalContent();
  return <LegalDocumentView doc={content.returns} />;
};

export default Returns;
