import React from "react";
import { Link } from "react-router-dom";
import type { LegalDocument } from "../../data/legalContent";
import "./Legal.css";

/**
 * يحوّل `**نص**` إلى <strong>. النصوص القانونية يحررها الأدمن من لوحة التحكم
 * كنص عادي، فلا يمكن السماح بـ HTML خام (ثغرة XSS على صفحة يراها كل زائر)،
 * لكن إبراز المدد والمبالغ ضروري لقراءة السياسة. هذا هو الحل الوسط: صيغة
 * واحدة مفهومة، وتحويلها إلى عناصر React لا إلى HTML.
 */
const renderInline = (text: string): React.ReactNode =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    ),
  );

interface Props {
  doc: LegalDocument;
}

const LegalDocumentView: React.FC<Props> = ({ doc }) => {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <h1>{doc.title}</h1>
        {doc.subtitle && <p>{doc.subtitle}</p>}
      </div>

      <div className="legal-content">
        {doc.sections.map((section) => (
          <div key={section.id} className="legal-section">
            {section.heading && <h2>{section.heading}</h2>}
            {section.body && <p>{renderInline(section.body)}</p>}

            {section.listType === "ul" && section.items.length > 0 && (
              <ul>
                {section.items.map((item, index) => (
                  <li key={index}>{renderInline(item)}</li>
                ))}
              </ul>
            )}

            {section.listType === "ol" && section.items.length > 0 && (
              <ol>
                {section.items.map((item, index) => (
                  <li key={index}>{renderInline(item)}</li>
                ))}
              </ol>
            )}

            {section.highlight && (
              <div className="legal-highlight">
                <p>{renderInline(section.highlight)}</p>
              </div>
            )}
          </div>
        ))}

        {(doc.contactTitle || doc.contactButton) && (
          <div className="legal-contact-box">
            {doc.contactTitle && <h3>{doc.contactTitle}</h3>}
            {doc.contactText && <p>{doc.contactText}</p>}
            {doc.contactButton && (
              <Link to="/contact">{doc.contactButton}</Link>
            )}
          </div>
        )}

        {doc.lastUpdated && (
          <p className="legal-last-updated">آخر تحديث: {doc.lastUpdated}</p>
        )}
      </div>
    </div>
  );
};

export default LegalDocumentView;
