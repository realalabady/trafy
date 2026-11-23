import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useStore } from "../../store/useStore";
import "./Header.css";

const NAV = [
  { to: "/products", label: "الأقمشة" },
  { to: "/products?search=صوف", label: "الصوف" },
  { to: "/products?search=قطن", label: "القطن" },
  { to: "/products?featured=true", label: "المختارة" },
  { to: "/about", label: "عن ترفي" },
];

/**
 * شريط واحد فقط. كان ثلاثة (إعلان علوي + صف بحث + صف تنقل) وهو ثقل
 * بلا مقابل: الزائر يريد القماش، لا ثلاثة صفوف قبله.
 * البحث صار طبقة تُفتح عند الطلب، لا حقلاً دائماً.
 */
const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cart, user, searchQuery, setSearchQuery, storeInfo } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  const cartCount = cart.reduce((n, item) => n + item.quantity, 0);
  const storeName = storeInfo.storeName || "ترفي";

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!searchOpen) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    setSearchOpen(false);
  };

  return (
    <header className="header">
      <div className="container bar">
        <Link to="/" className="brand" aria-label={storeName}>
          <span className="brand-mark display">{storeName}</span>
        </Link>

        <nav className="bar-nav" aria-label="الأقسام">
          {NAV.map((item) => (
            <Link key={item.label} to={item.to} className="bar-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="bar-actions">
          <button className="bar-link" onClick={() => setSearchOpen(true)}>
            بحث
          </button>
          <Link to={user ? "/account" : "/login"} className="bar-link">
            {user ? "حسابي" : "دخول"}
          </Link>
          <Link to="/cart" className="bar-cart">
            السلة
            {cartCount > 0 && <span className="bar-count">{cartCount}</span>}
          </Link>
          <button
            className="bar-burger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
          >
            {menuOpen ? "إغلاق" : "القائمة"}
          </button>
        </div>
      </div>

      {/* طبقة البحث */}
      <AnimatePresence mode="wait">
        {searchOpen && (
          <motion.div
            key="search"
            className="search-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.1 : 0.2 }}
          >
            <motion.div
              className="search-panel"
              initial={{ y: reduce ? 0 : -18 }}
              animate={{ y: 0 }}
              exit={{ y: reduce ? 0 : -18 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <form onSubmit={submitSearch} role="search" className="container">
                <input
                  ref={inputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="اكتب اسم القماش أو الوزن أو الوقفة"
                  aria-label="ابحث في الأقمشة"
                />
                <button type="submit" className="btn btn-primary">
                  ابحث
                </button>
                <button
                  type="button"
                  className="search-close"
                  onClick={() => setSearchOpen(false)}
                >
                  إغلاق
                </button>
              </form>
            </motion.div>
            <button
              className="search-scrim"
              aria-label="إغلاق البحث"
              onClick={() => setSearchOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* قائمة الجوال */}
      <AnimatePresence mode="wait">
        {menuOpen && (
          <motion.nav
            key="menu"
            className="drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0.1 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="container drawer-inner">
              {NAV.map((item) => (
                <Link key={item.label} to={item.to} className="drawer-link">
                  {item.label}
                </Link>
              ))}
              <Link to="/contact" className="drawer-link">
                تواصل
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
