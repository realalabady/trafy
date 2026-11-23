import React from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../types";
import { useStore } from "../../store/useStore";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product;
}

// بطاقة قماش: صورة كبيرة + مواصفة بخط أحادي. بلا أيقونات وبلا تقييمات مُختلقة.
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, categories } = useStore();
  const wishlisted = isInWishlist(product.id);

  const categoryName =
    categories.find((c) => c.id === product.category)?.name || product.category;

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(price);

  const soldOut = product.stock === 0;

  return (
    <article className="product-card">
      <Link
        to={`/product/${product.id}`}
        className="product-image photo-frame"
        aria-label={product.name}
      >
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="photo"
            width="600"
            height="750"
          />
        ) : (
          <span className="product-image-empty meta">لا توجد صورة</span>
        )}

        {(discount > 0 || soldOut) && (
          <div className="product-tags">
            {discount > 0 && !soldOut && (
              <span className="product-tag product-tag-sale">
                −{discount}٪
              </span>
            )}
            {soldOut && <span className="product-tag">نفدت</span>}
          </div>
        )}
      </Link>

      <div className="product-content">
        {categoryName && (
          <span className="product-category meta">{categoryName}</span>
        )}

        <h3 className="product-title">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        <div className="product-pricing">
          <span className="current-price price">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="old-price price">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <div className="product-foot">
          <button
            className="add-to-cart-btn"
            onClick={() => addToCart(product)}
            disabled={soldOut}
          >
            {soldOut ? "غير متوفر" : "أضف للسلة"}
          </button>
          <button
            className={`save-btn ${wishlisted ? "is-saved" : ""}`}
            aria-pressed={wishlisted}
            onClick={() => toggleWishlist(product.id)}
          >
            {wishlisted ? "محفوظ" : "حفظ"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
