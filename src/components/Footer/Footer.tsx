import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../store/useStore";
import "./Footer.css";

// بلا أيقونات: الخدمات تُقال بالكلمة والرقم، لا بالرمز.
const SERVICE = [
  { k: "الشحن", v: "٢–٥ أيام عمل لكل مناطق المملكة" },
  { k: "الشحن المجاني", v: "على الطلبات فوق ٢٠٠ ر.س" },
  { k: "الاسترجاع", v: "خلال ٧ أيام على الطاقة غير المقصوصة" },
  { k: "الدفع", v: "مدى · أبل باي · تحويل بنكي · تقسيط" },
];

const FABRIC_LINKS = [
  { to: "/products?search=صوف", label: "الأصواف الشتوية" },
  { to: "/products?search=قطن", label: "القطن الصيفي" },
  { to: "/products?search=مقلم", label: "المقلّم" },
  { to: "/products?search=سادة", label: "السادة" },
  { to: "/products?search=طاقة", label: "الطاقات الكاملة" },
  { to: "/products", label: "كل الأقمشة" },
];

const Footer: React.FC = () => {
  const { storeInfo } = useStore();
  const storeName = storeInfo.storeName || "ترفي";

  return (
    <footer className="footer">
      {/* شريط الخدمة: مواصفة لا وعود */}
      <div className="footer-service">
        <div className="container">
          <dl className="service-grid">
            {SERVICE.map((s) => (
              <div key={s.k} className="service-item">
                <dt className="meta">{s.k}</dt>
                <dd>{s.v}</dd>
              </div>
            ))}
          </dl>
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
                    <a href={`tel:${storeInfo.storePhone}`}>
                      {storeInfo.storePhone}
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
