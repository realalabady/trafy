import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import { useStore } from "../../store/useStore";
import "./Products.css";

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { products, categories } = useStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const categoryParam = searchParams.get("category");
  const featuredParam = searchParams.get("featured");
  const searchParam = searchParams.get("search");

  // فلترة الأقمشة
  let filteredProducts = [...products];

  // فلتر حسب التصنيف
  if (categoryParam) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.category === categoryParam ||
        p.category.toLowerCase() === categoryParam.toLowerCase(),
    );
  }

  // فلتر الأقمشة المختارة
  if (featuredParam === "true") {
    filteredProducts = filteredProducts.filter((p) => p.featured);
  }

  // فلتر البحث: من رابط الصفحة وحده.
  // كان يقرأ أيضاً searchQuery العام، وهو نص حقل البحث في الرأس ويبقى في
  // الذاكرة بعد إغلاق طبقة البحث. فمن بحث عن "كوري" ثم فتح "كل الأقمشة"
  // يرى ثلاثة أصناف فقط وعنوان الصفحة يقول "كل الأقمشة"، بلا أي إشارة
  // إلى وجود فلتر. الفلتر الخفي أسوأ من غياب الفلتر.
  const activeSearch = searchParam;
  if (activeSearch) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.includes(activeSearch) ||
        p.nameEn.toLowerCase().includes(activeSearch.toLowerCase()) ||
        p.description.includes(activeSearch),
    );
  }

  // الترتيب
  switch (sortBy) {
    case "price-low":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "name":
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name, "ar"));
      break;
    case "newest":
    default:
      filteredProducts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  const getPageTitle = () => {
    if (featuredParam === "true") return "عروض اليوم";
    if (categoryParam) {
      const cat = categories.find(
        (c) =>
          c.id === categoryParam ||
          c.nameEn.toLowerCase() === categoryParam.toLowerCase(),
      );
      return cat?.name || categoryParam;
    }
    if (activeSearch) return `نتائج البحث: ${activeSearch}`;
    return "كل الأقمشة";
  };

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>{getPageTitle()}</h1>
          <p className="meta">{filteredProducts.length} صنف</p>
        </div>

        {/* Toolbar */}
        <div className="products-toolbar">
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            الفلاتر
          </button>

          <div className="toolbar-right">
            {/* Sort */}
            <div className="sort-select">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">الأحدث</option>
                <option value="price-low">السعر: من الأقل للأعلى</option>
                <option value="price-high">السعر: من الأعلى للأقل</option>
                <option value="name">الاسم</option>
              </select>
            </div>

            {/* View Mode */}
            {/* العرض: كلمات لا أيقونات */}
            <div className="view-modes">
              <button
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
              >
                شبكة
              </button>
              <button
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
              >
                قائمة
              </button>
            </div>
          </div>
        </div>

        {/* Filters Sidebar */}
        {showFilters && (
          <div className="filters-sidebar">
            <h3>التصنيفات</h3>
            <ul className="category-list">
              <li>
                <Link to="/products" className={!categoryParam ? "active" : ""}>
                  كل الأقمشة
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/products?category=${cat.id}`}
                    className={categoryParam === cat.id ? "active" : ""}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className={`products-grid ${viewMode}`}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-products">
            <p>لا توجد أقمشة</p>
            {categoryParam && (
              <Link to="/products" className="btn btn-primary">
                عرض كل الأقمشة
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
