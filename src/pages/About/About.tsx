import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../store/useStore";
import { useReveal } from "../../hooks/useReveal";
import "./About.css";

// كيف نختار القماش — معايير لا شعارات. بلا أيقونات (BRAND.md §5).
const CRITERIA = [
  {
    k: "الوزن",
    v: "نكتب الوزن بالغرام للمتر لكل طاقة. الوزن هو ما يقرر إن كان الثوب صيفياً أو شتوياً، لا اسم الموسم على الملصق.",
  },
  {
    k: "الوقفة",
    v: "واقف، نصف وقفة، ربع وقفة، منسدل. نجرّب الطاقة مطويّة قبل أن ندرجها، ونكتب درجتها كما هي.",
  },
  {
    k: "بلد النسج",
    v: "ياباني، كوري، تايواني، تايلندي. البلد مكتوب لأنه يفرق في الملمس والثبات، لا كزينة تسويقية.",
  },
  {
    k: "العرض والطول",
    v: "عرض الطاقة وطولها مذكوران، حتى يعرف خيّاطك كم ثوباً تكفي قبل القص.",
  },
];

const About: React.FC = () => {
  const { storeInfo } = useStore();
  const storeName = storeInfo.storeName || "ترفي";
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <div className="about-page" ref={revealRef}>
      <section className="about-hero">
        <div className="container about-hero-grid">
          <div className="reveal">
            <span className="meta about-eyebrow">عن {storeName}</span>
            <h1 className="display about-title">
              نبيع القماش بمواصفته، لا بوصفه
            </h1>
            <p className="about-lede">
              {storeName} بيت أقمشة ثياب رجالية. نشتري الطاقة من النسّاج،
              ونجرّبها، ونكتب عنها ما نعرفه بالضبط: الوزن، الوقفة، بلد النسج،
              العرض. ثم نترك القرار لك ولخيّاطك.
            </p>
          </div>
          <figure className="about-figure reveal">
            <div className="photo-frame about-photo">
              <img
                src="/images/atelier-cloth.jpg"
                alt="قماش مفرود على طاولة القص"
                className="photo"
                width="1200"
                height="800"
              />
            </div>
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="fold-rule" />
          <div className="criteria">
            <h2 className="display criteria-title">كيف نختار الطاقة</h2>
            <dl className="criteria-list">
              {CRITERIA.map((c) => (
                <div key={c.k} className="criteria-row reveal">
                  <dt className="criteria-key display">{c.k}</dt>
                  <dd className="criteria-value">{c.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="about-band">
        <div className="photo-frame about-band-photo">
          <img
            src="/images/editorial-brown-thobe.jpg"
            alt="ثوب بني من صوف شتوي"
            className="photo"
            loading="lazy"
            width="1600"
            height="1067"
          />
        </div>
      </section>

      <section className="section">
        <div className="container about-close">
          <div className="reveal">
            <h2 className="display">
              القماش يُشترى مرة، ويُلبس مئة مرة
            </h2>
            <p>
              لذلك لا نستعجل التشكيلة. ندخل الطاقة إذا استحقت، ونخرجها إذا نزل
              مستواها، ونكتب لك السبب في وصفها. إن لم تجد ما تبحث عنه، اسأل —
              غالباً نعرف أين نجده.
            </p>
            <div className="about-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                تصفّح الأقمشة
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">
                اسألنا
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
