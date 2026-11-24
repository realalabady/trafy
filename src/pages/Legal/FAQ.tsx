import { useState } from "react";
import { Link } from "react-router-dom";
import { useLegalContent } from "../../hooks/useLegalContent";
import "./Legal.css";

// الأسئلة والأجوبة يحررها الأدمن من لوحة التحكم (/dashboard/legal) وتُحفظ في
// settings/legal.faq. القيم الافتراضية في src/data/legalContent.ts.
const FAQ = () => {
  const { faq } = useLegalContent();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="legal-page">
      <div className="legal-hero">
        <h1>{faq.title}</h1>
        {faq.subtitle && <p>{faq.subtitle}</p>}
      </div>

      <div className="legal-content">
        {faq.categories.map((category, catIdx) => (
          <div key={category.id || catIdx} className="legal-section">
            <h2>{category.title}</h2>
            <div className="faq-list">
              {category.items.map((item, itemIdx) => {
                const key = `${catIdx}-${itemIdx}`;
                const isOpen = openItems.has(key);
                return (
                  <div key={key} className="faq-item">
                    <button
                      className={`faq-question ${isOpen ? "open" : ""}`}
                      onClick={() => toggleItem(key)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.question}</span>
                    </button>
                    {isOpen && <div className="faq-answer">{item.answer}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {(faq.contactTitle || faq.contactButton) && (
          <div className="legal-contact-box">
            {faq.contactTitle && <h3>{faq.contactTitle}</h3>}
            {faq.contactText && <p>{faq.contactText}</p>}
            {faq.contactButton && (
              <Link to="/contact">{faq.contactButton}</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQ;
