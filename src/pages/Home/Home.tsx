import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import ProductCard from "../../components/ProductCard/ProductCard";
import { useStore } from "../../store/useStore";
import "./Home.css";

/** شرائح الواجهة: صور العميل بعد قص علامة المرجع ونص حملته. */
const SLIDES = [
  {
    image: "/images/brand-walk.jpg",
    position: "50% 38%",
    positionMobile: "50% 50%",
    alt: "ثوب بنّي من صوف شتوي",
    caption: "صوف شتوي · ٤٢٠ غ",
  },
  {
    image: "/images/brand-arch.jpg",
    position: "50% 40%",
    positionMobile: "50% 50%",
    alt: "ثوب عاجي أمام مشهد جبلي",
    caption: "قطن مصري · ١٦٠ غ",
  },
];

/** التصنيفات كما تُعرض في سوق الأقمشة: الرجل لابساً القماش، لا عيّنة مجرّدة. */
const CATEGORIES = [
  { label: "الصوف", image: "/images/cat-wool.jpg", to: "/products?search=صوف" },
  { label: "السادة", image: "/images/cat-plain.jpg", to: "/products?search=سادة" },
  { label: "المقلّم", image: "/images/cat-striped.jpg", to: "/products?search=مقلم" },
  { label: "الكاروهات", image: "/images/cat-check.jpg", to: "/products?search=كاروهات" },
  { label: "القطن الطبيعي", image: "/images/cat-cotton.jpg", to: "/products?search=قطن" },
];

const STANCES = [
  {
    name: "واقف",
    note: "يمسك شكله كاملاً. للمناسبات.",
    image: "/images/stance-standing.jpg",
  },
  {
    name: "نصف وقفة",
    note: "بين الوقوف والانسدال. اليومي.",
    image: "/images/stance-half.jpg",
  },
  {
    name: "ربع وقفة",
    note: "خفيف الوقوف، مريح في الحر.",
    image: "/images/stance-quarter.jpg",
  },
  {
    name: "منسدل",
    note: "ينساب مع الحركة. للسفر.",
    image: "/images/stance-draped.jpg",
  },
];

const FABRICS = [
  { label: "صوف مارينو", note: "٤٨٠ غ", image: "/images/fabric-wool.jpg", wide: true },
  { label: "قطن مصري", note: "١٦٠ غ", image: "/images/fabric-beige.jpg" },
  { label: "تويل سادة", note: "٢٢٠ غ", image: "/images/fabric-stripe.jpg" },
  { label: "كحلي شتوي", note: "٣٨٠ غ", image: "/images/fabric-cotton.jpg" },
  { label: "خيوط البشت", note: "١٤٠ غ", image: "/images/fabric-grey.jpg" },
];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const SLIDE_MS = 5000;

const Home: React.FC = () => {
  const { products } = useStore();
  const reduce = useReducedMotion();
  const [slide, setSlide] = useState(0);

  // تبديل تلقائي للشرائح، ويتوقف إن طلب المستخدم تقليل الحركة.
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(
      () => setSlide((i) => (i + 1) % SLIDES.length),
      SLIDE_MS,
    );
    return () => window.clearInterval(id);
  }, [reduce]);

  const shelf = [
    ...products.filter((p) => p.featured),
    ...products.filter((p) => !p.featured),
  ].slice(0, 8);

  const rise = (i = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay: i * 0.06, ease },
  });

  const current = SLIDES[slide];

  return (
    <div className="home">
      {/* ١. الواجهة: صورة كاملة العرض، النص فوقها */}
      <section className="hero">
        <div className="hero-stage">
          <AnimatePresence mode="sync">
            <motion.img
              key={current.image}
              src={current.image}
              alt={current.alt}
              className="hero-img"
              style={
                {
                  "--pos": current.position,
                  "--pos-m": current.positionMobile,
                } as React.CSSProperties
              }
              initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 1.2, ease }}
            />
          </AnimatePresence>
          <div className="hero-scrim" />

          <div className="container hero-inner">
            <motion.div
              className="hero-text"
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
            >
              {/* الشعار واسم العلامة مطبوعان داخل الصورة نفسها، فعنوان ثانٍ
                  فوقهما يزدحم بهما. يبقى العنوان للقارئ الآلي وقارئ الشاشة. */}
              <h1 className="sr-only">ترفي · قماشٌ يعرف وقفته</h1>
              <div className="hero-buttons">
                <Link to="/products" className="btn btn-primary btn-lg">
                  تصفّح الأقمشة
                </Link>
                <Link
                  to="/products?search=صوف"
                  className="btn btn-outline btn-lg"
                >
                  أصواف الشتاء
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="container hero-foot">
            <span className="meta hero-caption">{current.caption}</span>
            <div className="hero-dots">
              {SLIDES.map((s, i) => (
                <button
                  key={s.image}
                  className={`hero-dot ${i === slide ? "is-on" : ""}`}
                  aria-label={`الشريحة ${i + 1}`}
                  aria-current={i === slide}
                  onClick={() => setSlide(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ٢. التصنيفات */}
      <section className="section-tight cats">
        <div className="container">
          <motion.header className="sec-head" {...rise()}>
            <h2 className="display">تسوّق حسب القماش</h2>
            <Link to="/products" className="section-link">
              كل الأقمشة
            </Link>
          </motion.header>
          <div className="cat-row">
            {CATEGORIES.map((c, i) => (
              <motion.div key={c.label} {...rise(i)}>
                <Link to={c.to} className="cat">
                  <span className="cat-ring">
                    <img src={c.image} alt={c.label} loading="lazy" />
                  </span>
                  <span className="cat-label">{c.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ٣. الخامات */}
      <section className="section">
        <div className="container">
          <motion.header className="sec-head" {...rise()}>
            <h2 className="display">الخامات</h2>
          </motion.header>
          <div className="fab-grid">
            {FABRICS.map((f, i) => (
              <motion.div
                key={f.label}
                className={f.wide ? "fab fab-wide" : "fab"}
                {...rise(i)}
              >
                <div className="fab-photo">
                  <img src={f.image} alt={f.label} loading="lazy" />
                </div>
                <div className="fab-cap">
                  <span className="fab-label">{f.label}</span>
                  <span className="fab-note">{f.note}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ٤. الوقفة */}
      <section className="section band band-caramel stance">
        <div className="container">
          <motion.h2 className="display stance-title" {...rise()}>
            أربع وقفات. اختر التي تشبهك.
          </motion.h2>
          <div className="stance-row">
            {STANCES.map((s, i) => (
              <motion.div key={s.name} {...rise(i)}>
                <Link
                  to={`/products?search=${encodeURIComponent(s.name)}`}
                  className="stance-item"
                >
                  <span className="stance-ring">
                    <img src={s.image} alt={s.name} loading="lazy" />
                  </span>
                  <span className="stance-name display">{s.name}</span>
                  <span className="stance-note">{s.note}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ٥. الرف */}
      <section className="section">
        <div className="container">
          <motion.header className="sec-head" {...rise()}>
            <h2 className="display">على الرف</h2>
            <Link to="/products" className="section-link">
              عرض الكل
            </Link>
          </motion.header>
          {shelf.length > 0 ? (
            <div className="grid grid-4">
              {shelf.map((p, i) => (
                <motion.div key={p.id} {...rise(i)}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="quiet-note">
              الرف فارغ. أضف أول طاقة من لوحة التحكم لتظهر هنا.
            </p>
          )}
        </div>
      </section>

      {/* ٦. الطاقة الكاملة */}
      <section className="roll">
        <div className="container roll-grid">
          <motion.div className="roll-photo" {...rise()}>
            <img
              src="/images/stack-folded.jpg"
              alt="طاقات مطوية على الرف"
              loading="lazy"
            />
          </motion.div>
          <motion.div className="roll-text" {...rise(1)}>
            <span className="meta roll-eyebrow">الطاقة الكاملة</span>
            <h2 className="display">تكفي خمسة ثياب بسعر واحد</h2>
            <p>
              تشتري الطول كاملاً ويقصّه خيّاطك كما تحب. العرض والوزن مكتوبان على
              كل طاقة قبل الشراء.
            </p>
            <Link to="/products?search=طاقة" className="btn btn-primary btn-lg">
              تصفّح الطاقات
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
