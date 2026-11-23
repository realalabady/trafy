import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../../store/useStore";
import "./Header.css";

// بلا أيقونات: كل إجراء يحمل اسمه. انظر BRAND.md §5.
const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLLIElement>(null);
  const { cart, user, searchQuery, setSearchQuery, categories, storeInfo } =
    useStore();
  const navigate = useNavigate();

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const storeName = storeInfo.storeName || "ترفي";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target as Node)
      ) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      {/* شريط علوي: مواصفة لا إعلان */}
      <div className="header-top">
        <div className="container header-top-content">
          <span className="meta header-promo">
            شحن مجاني فوق ٢٠٠ ر.س · توصيل لكل المملكة
          </span>
          <div className="header-top-links">
            {storeInfo.storePhone && (
              <a href={`tel:${storeInfo.storePhone}`} className="meta">
                {storeInfo.storePhone}
              </a>
            )}
            {user ? (
              <Link
                to={user.role === "admin" ? "/dashboard" : "/account"}
                className="meta"
              >
                {user.role === "admin" ? "لوحة التحكم" : "حسابي"}
              </Link>
            ) : (
              <>
                <Link to="/login" className="meta">
                  دخول
                </Link>
                <Link to="/register" className="meta">
                  حساب جديد
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* الصف الرئيسي */}
      <div className="header-main">
        <div className="container header-main-content">
          <button
            className="menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? "إغلاق" : "القائمة"}
          </button>

          <Link to="/" className="logo" aria-label={storeName}>
            <span className="logo-text display">{storeName}</span>
            <span className="logo-sub meta">أقمشة ثياب رجالية</span>
          </Link>

          <form className="search-bar" onSubmit={handleSearch} role="search">
            <input
              type="search"
              name="search"
              aria-label="ابحث في الأقمشة"
              autoComplete="off"
              placeholder="ابحث باسم القماش أو الوزن أو الوقفة"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-submit meta">
              بحث
            </button>
          </form>

          <div className="header-actions">
            <Link to="/cart" className="action-link">
              السلة
              <span className="action-count">{cartCount}</span>
            </Link>
            <Link to={user ? "/account" : "/login"} className="action-link">
              {user ? "حسابي" : "دخول"}
            </Link>
          </div>
        </div>
      </div>

      {/* التنقل */}
      <nav className={`nav ${mobileMenuOpen ? "nav-open" : ""}`}>
        <div className="container">
          <ul className="nav-menu">
            <li className="nav-item">
              <Link
                to="/"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                الرئيسية
              </Link>
            </li>
            <li
              className={`nav-item has-dropdown ${categoriesOpen ? "open" : ""}`}
              ref={categoriesRef}
            >
              <button
                type="button"
                className="nav-link nav-dropdown-toggle"
                aria-expanded={categoriesOpen}
                aria-haspopup="true"
                onClick={() => setCategoriesOpen((o) => !o)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setCategoriesOpen(false);
                }}
              >
                الأقمشة
              </button>
              <div className="dropdown-menu">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.id}`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setCategoriesOpen(false);
                      }}
                    >
                      {cat.name}
                    </Link>
                  ))
                ) : (
                  <span className="dropdown-empty">لا توجد تصنيفات بعد</span>
                )}
              </div>
            </li>
            <li className="nav-item">
              <Link
                to="/products?featured=true"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                المختارة
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/products?new=true"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                وصل حديثاً
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/about"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                عن ترفي
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/contact"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                تواصل
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
