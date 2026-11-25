import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../store/useStore";
import "./Footer.css";

// بلا أيقونات: الخدمات تُقال بالكلمة والرقم، لا بالرمز.
const SERVICE =
  "شحن ٤ أيام عمل داخل المنطقة الشرقية و٧ أيام لباقي المملكة، ومجاني فوق ٢٥٠ ر.س. استرجاع خلال ٧ أيام على الطاقة غير المقصوصة.";

// السجل التجاري — من businessInfo (الإعدادات)، وقيمه الافتراضية هي أرقام شهادة
// وزارة التجارة في src/config/business.ts. مصدر واحد مع الفاتورة، فلا يختلف
// التذييل عن المستند المطبوع.
const FABRIC_LINKS = [
  { to: "/products?search=صوف", label: "الأصواف الشتوية" },
  { to: "/products?search=قطن", label: "القطن الصيفي" },
  { to: "/products?search=مقلم", label: "المقلّم" },
  { to: "/products?search=سادة", label: "السادة" },
  { to: "/products?search=طاقة", label: "الطاقات الكاملة" },
  { to: "/products", label: "كل الأقمشة" },
];

const Footer: React.FC = () => {
  const { storeInfo, businessInfo } = useStore();
  const storeName = storeInfo.storeName || "ترفي";
  const crNumber = businessInfo.crNumber;
  const crUnified = businessInfo.crUnifiedNumber;
  const crVerifyUrl = businessInfo.crVerifyUrl;

  return (
    <footer className="footer band">
      <div className="footer-service">
        <div className="container">
          <p>{SERVICE}</p>
        </div>
      </div>

      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section footer-brand">
              <h3 className="footer-wordmark display">{storeName}</h3>
              <p className="footer-about">
                بيت أقمشة ثياب رجالية. نختار الطاقة بالوزن والوقفة وبلد النسج،
                ونكتب مواصفتها كاملة قبل أن تشتريها.
              </p>
              <div className="footer-social">
                <a href="https://instagram.com" target="_blank" rel="noreferrer">
                  إنستقرام
                </a>
                <a href="https://x.com" target="_blank" rel="noreferrer">
                  إكس
                </a>
                <a href="https://wa.me/" target="_blank" rel="noreferrer">
                  واتساب
                </a>
              </div>
            </div>

            <div className="footer-section">
              <h4 className="footer-title meta">الأقمشة</h4>
              <ul className="footer-links">
                {FABRIC_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-title meta">المتجر</h4>
              <ul className="footer-links">
                <li>
                  <Link to="/about">عن ترفي</Link>
                </li>
                <li>
                  <Link to="/contact">تواصل</Link>
                </li>
                <li>
                  <Link to="/faq">أسئلة متكررة</Link>
                </li>
                <li>
                  <Link to="/shipping">الشحن</Link>
                </li>
                <li>
                  <Link to="/returns">الاسترجاع</Link>
                </li>
                <li>
                  <Link to="/privacy">الخصوصية</Link>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-title meta">تواصل</h4>
              <ul className="footer-contact">
                <li>{storeInfo.storeAddress || "المملكة العربية السعودية"}</li>
                {storeInfo.storePhone && (
                  <li>
                    <a
                      href={`tel:${storeInfo.storePhone.replace(/\s+/g, "")}`}
                      dir="ltr"
                    >
                      <bdi dir="ltr">{storeInfo.storePhone}</bdi>
                    </a>
                  </li>
                )}
                {storeInfo.storeEmail && (
                  <li>
                    <a href={`mailto:${storeInfo.storeEmail}`}>
                      {storeInfo.storeEmail}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-cr">
        <div className="container footer-cr-inner">
          <a
            className="footer-cr-qr"
            href={crVerifyUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`التحقق من السجل التجاري رقم ${crNumber} لدى المركز السعودي للأعمال`}
          >
            <img src="/images/cr-qr.svg" alt="" width={104} height={104} />
          </a>

          <div className="footer-cr-body">
            <img
              className="footer-cr-logo"
              src="/images/sbc-logo.svg"
              alt="المركز السعودي للتنافسية والأعمال"
              width={247}
              height={48}
            />
            <dl className="footer-cr-nums">
              <div>
                <dt>السجل التجاري</dt>
                <dd>{crNumber}</dd>
              </div>
              <div>
                <dt>الرقم الوطني الموحد</dt>
                <dd>{crUnified}</dd>
              </div>
            </dl>
          </div>

          <a
            className="footer-cr-verify"
            href={crVerifyUrl}
            target="_blank"
            rel="noreferrer"
          >
            تحقّق من السجل لدى المركز السعودي للأعمال
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p className="meta">
            © {new Date().getFullYear()} {storeName} · جميع الحقوق محفوظة
          </p>
          <p className="meta footer-line">قماشٌ يعرف وقفته</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
