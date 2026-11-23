import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import { useStore } from "../../store/useStore";
import { useReveal } from "../../hooks/useReveal";
import "./Home.css";

/**
 * الصفحة الرئيسية — بيت أقمشة.
 * بلا أيقونات وبلا إيموجي: الصورة والكلمة والمواصفة فقط (BRAND.md §5).
 */

// محور العلامة: الوقفة. مصطلح السوق نفسه، لا تصنيف مخترع.
const STANCES = [
  {
    id: "واقف",
    name: "واقف",
    note: "يمسك شكله كاملاً. للمناسبات والحضور الرسمي.",
  },
  {
    id: "نصف وقفة",
    name: "نصف وقفة",
    note: "وسط بين الوقوف والانسدال. الخيار اليومي.",
  },
  {
    id: "ربع وقفة",
    name: "ربع وقفة",
    note: "خفيف الوقوف، مريح في الحر.",
  },
  {
    id: "منسدل",
    name: "منسدل",
    note: "ينساب مع الحركة. للصيف والسفر.",
  },
];

// عائلات القماش — صور ماكرو حقيقية بدل أي رمز
const FAMILIES = [
  {
    label: "الأصواف",
    note: "شتاء · ٣٢٠–٤٨٠ غ",
    image: "/images/fabric-wool.jpg",
    to: "/products?search=صوف",
  },
  {
    label: "القطن الطبيعي",
    note: "صيف · ١٤٠–١٨٠ غ",
    image: "/images/fabric-cotton.jpg",
    to: "/products?search=قطن",
  },
  {
    label: "السادة",
    note: "كل المواسم",
    image: "/images/fabric-beige.jpg",
    to: "/products?search=سادة",
  },
  {
    label: "المقلّم",
    note: "تقليم ناعم",
    image: "/images/fabric-stripe.jpg",
    to: "/products?search=مقلم",
  },
];

const ORIGINS = ["اليابان", "كوريا", "تايوان", "تايلند"];

const Home: React.FC = () => {
  const { products, categories } = useStore();
  const revealRef = useReveal<HTMLDivElement>();

  const featuredProducts = products.filter((p) => p.featured).slice(0, 8);
  const latestProducts = products.slice(0, 8);

  return (
    <div className="home" ref={revealRef}>
      {/* ——— الواجهة ——— */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-text reveal">
            <span className="meta hero-eyebrow">بيت أقمشة · المملكة</span>
            <h1 className="display hero-title">قماشٌ يعرف وقفته</h1>
            <p className="hero-lede">
              نختار الطاقة بالوزن وبلد النسج ودرجة الوقفة، ونكتب مواصفتها كاملة
              قبل أن تشتريها. لا صور مجمّلة ولا أوصاف فضفاضة.
            </p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary btn-lg">
                تصفّح الأقمشة
              </Link>
              <Link to="/products?search=صوف" className="btn btn-secondary btn-lg">
                الأصواف الشتوية
              </Link>
            </div>
          </div>

          <figure className="hero-figure reveal">
            <div className="photo-frame hero-photo">
              <img
                src="/images/hero-thobe.jpg"
                alt="ثوب أبيض من قطن مصري، وقفة كاملة"
                className="photo"
                width="1000"
                height="1300"
              />
            </div>
            <figcaption className="meta hero-caption">
              قطن مصري · ١٦٠ غ · ربع وقفة
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ——— محور الوقفة ——— */}
      <section className="section-tight stance">
        <div className="container">
          <div className="fold-rule" />
          <div className="stance-grid">
            {STANCES.map((s) => (
              <Link
                key={s.id}
                to={`/products?search=${encodeURIComponent(s.id)}`}
                className="stance-cell reveal"
              >
                <span className="stance-name display">{s.name}</span>
                <span className="stance-note">{s.note}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ——— عائلات القماش ——— */}
      <section className="section">
        <div className="container">
          <header className="section-head">
            <h2>الخامات</h2>
            <Link to="/products" className="section-link">
              كل الأقمشة
            </Link>
          </header>

          <div className="family-grid">
            {FAMILIES.map((f) => (
              <Link key={f.label} to={f.to} className="family-card reveal">
                <div className="photo-frame family-photo">
                  <img
                    src={f.image}
                    alt={f.label}
                    className="photo"
                    loading="lazy"
                    width="600"
                    height="600"
                  />
                </div>
                <div className="family-caption">
                  <span className="family-label">{f.label}</span>
                  <span className="meta">{f.note}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ——— التصنيفات من لوحة التحكم ——— */}
      {categories.length > 0 && (
        <section className="section-tight">
          <div className="container">
            <header className="section-head">
              <h2>التصنيفات</h2>
            </header>
            <div className="category-row">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className="category-chip reveal"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ——— المختارة ——— */}
      <section className="section">
        <div className="container">
          <header className="section-head">
            <h2>مختارة هذا الموسم</h2>
            <Link to="/products?featured=true" className="section-link">
              عرض الكل
            </Link>
          </header>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-4">
              {featuredProducts.map((p) => (
                <div className="reveal" key={p.id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <p className="quiet-note">
              لم تُضف أقمشة مختارة بعد. تُدار من لوحة التحكم.
            </p>
          )}
        </div>
      </section>

      {/* ——— لوحة تحريرية ——— */}
      <section className="editorial">
        <div className="photo-frame editorial-photo">
          <img
            src="/images/stack-folded.jpg"
            alt="طاقات مطوية على رف الأتيليه"
            className="photo"
            loading="lazy"
            width="1600"
            height="1067"
          />
        </div>
        <div className="editorial-body container">
          <div className="editorial-card reveal">
            <span className="meta">الطاقة الكاملة</span>
            <h2 className="display">تكفي خمسة ثياب، بسعر واحد</h2>
            <p>
              الطاقة تُقص عندك لا عندنا: تشتري الطول كاملاً، وتوزّعه على ثيابك
              كما تحب. الوزن والعرض مكتوبان على كل طاقة قبل الشراء.
            </p>
            <Link to="/products?search=طاقة" className="section-link">
              تصفّح الطاقات
            </Link>
          </div>
        </div>
      </section>

      {/* ——— بلد النسج ——— */}
      <section className="section-tight">
        <div className="container">
          <div className="fold-rule" />
          <div className="origin-row">
            <span className="meta origin-label">بلد النسج</span>
            <div className="origin-list">
              {ORIGINS.map((o) => (
                <Link
                  key={o}
                  to={`/products?search=${encodeURIComponent(o)}`}
                  className="origin-item display"
                >
                  {o}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ——— وصل حديثاً ——— */}
      <section className="section">
        <div className="container">
          <header className="section-head">
            <h2>وصل حديثاً</h2>
            <Link to="/products?new=true" className="section-link">
              عرض الكل
            </Link>
          </header>

          {latestProducts.length > 0 ? (
            <div className="grid grid-4">
              {latestProducts.map((p) => (
                <div className="reveal" key={p.id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <p className="quiet-note">
              المتجر جاهز وفارغ. أضف أول طاقة من لوحة التحكم ليظهر هنا.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
