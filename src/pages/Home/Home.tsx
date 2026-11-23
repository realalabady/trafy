import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import ProductCard from "../../components/ProductCard/ProductCard";
import { useStore } from "../../store/useStore";
import "./Home.css";

/**
 * الرئيسية — خمسة أقسام فقط، تتناوب بين الفاتح والداكن.
 * النسخة السابقة كانت ثمانية أقسام بلون واحد، فبدت كشيء واحد طويل.
 * بلا أيقونات (BRAND.md §5).
 */

const FAMILIES = [
  {
    label: "الصوف",
    weight: "٣٢٠ إلى ٤٨٠ غ",
    image: "/images/fabric-wool.jpg",
    to: "/products?search=صوف",
    feature: true,
  },
  {
    label: "القطن",
    weight: "١٤٠ إلى ١٨٠ غ",
    image: "/images/fabric-beige.jpg",
    to: "/products?search=قطن",
  },
  {
    label: "السادة",
    weight: "كل المواسم",
    image: "/images/fabric-stripe.jpg",
    to: "/products?search=سادة",
  },
  {
    label: "الكحلي",
    weight: "شتوي ثقيل",
    image: "/images/fabric-cotton.jpg",
    to: "/products?search=كحلي",
  },
  {
    label: "خيوط البشت",
    weight: "صيفي خفيف",
    image: "/images/fabric-grey.jpg",
    to: "/products?search=بشت",
  },
];

const STANCES = [
  { name: "واقف", note: "يمسك شكله كاملاً. للمناسبات." },
  { name: "نصف وقفة", note: "بين الوقوف والانسدال. اليومي." },
  { name: "ربع وقفة", note: "خفيف الوقوف، مريح في الحر." },
  { name: "منسدل", note: "ينساب مع الحركة. للسفر." },
];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const Home: React.FC = () => {
  const { products } = useStore();
  const reduce = useReducedMotion();

  const shelf = [
    ...products.filter((p) => p.featured),
    ...products.filter((p) => !p.featured),
  ].slice(0, 8);

  const rise = (i = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.6, delay: i * 0.07, ease },
  });

  return (
    <div className="home">
      {/* ١. الواجهة: قسم داكن كامل */}
      <section className="hero band">
        <div className="container hero-grid">
          <div className="hero-text">
            <motion.span
              className="meta hero-eyebrow"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease }}
            >
              بيت أقمشة رجالية
            </motion.span>
            <motion.h1
              className="display hero-title"
              initial={reduce ? false : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.06, ease }}
            >
              قماشٌ يعرف وقفته
            </motion.h1>
            <motion.p
              className="hero-lede"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.14, ease }}
            >
              وزن بالغرام، درجة وقفة، بلد نسج. مكتوبة قبل الشراء لا بعده.
            </motion.p>
            <motion.div
              className="hero-buttons"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease }}
            >
              <Link to="/products" className="btn btn-primary btn-lg">
                تصفّح الأقمشة
              </Link>
              <Link
                to="/products?search=صوف"
                className="btn btn-secondary btn-lg"
              >
                أصواف الشتاء
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="hero-media"
            initial={reduce ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease }}
          >
            <img
              src="/images/hero-thobe.jpg"
              alt="ثوب أبيض بوقفة كاملة"
              width="1000"
              height="1300"
            />
          </motion.div>
        </div>
      </section>

      {/* ٢. الخامات: بلاطة كبيرة وثلاث أصغر، لا أربع متساوية */}
      <section className="section families">
        <div className="container">
          <motion.header className="families-head" {...rise()}>
            <h2 className="display">الخامات</h2>
            <Link to="/products" className="section-link">
              كل الأقمشة
            </Link>
          </motion.header>

          <div className="families-grid">
            {FAMILIES.map((f, i) => (
              <motion.div
                key={f.label}
                className={f.feature ? "tile tile-wide" : "tile"}
                {...rise(i)}
              >
                <Link to={f.to} className="tile-link">
                  <div className="tile-photo">
                    <img src={f.image} alt={f.label} loading="lazy" />
                  </div>
                  <div className="tile-caption">
                    <span className="tile-label display">{f.label}</span>
                    <span className="tile-weight">{f.weight}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ٣. الوقفة: قسم داكن، نص كبير */}
      <section className="section band stance">
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
                  <span className="stance-name display">{s.name}</span>
                  <span className="stance-note">{s.note}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ٤. الرف */}
      <section className="section">
        <div className="container">
          <motion.header className="families-head" {...rise()}>
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

      {/* ٥. الطاقة الكاملة */}
      <section className="roll">
        <div className="container roll-grid">
          <motion.div className="roll-photo" {...rise()}>
            <img
              src="/images/stack-folded.jpg"
              alt="طاقات مطوية على الرف"
              loading="lazy"
              width="1600"
              height="1067"
            />
          </motion.div>
          <motion.div className="roll-text" {...rise(1)}>
            <span className="meta roll-eyebrow">الطاقة الكاملة</span>
            <h2 className="display">تكفي خمسة ثياب بسعر واحد</h2>
            <p>
              تشتري الطول كاملاً ويقصّه خيّاطك كما تحب. العرض والوزن مكتوبان
              على كل طاقة قبل الشراء.
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
