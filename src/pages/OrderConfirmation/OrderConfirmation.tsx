import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getDoc } from "firebase/firestore";
import { storeDoc } from "../../config/store";
import { useStore } from "../../store/useStore";
import "./OrderConfirmation.css";

interface ConfirmationOrder {
  id: string;
  total?: number;
  paymentStatus?: string;
  status?: string;
  customer?: string;
}

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { storeInfo } = useStore();
  const [order, setOrder] = useState<ConfirmationOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(storeDoc("orders", orderId));
        if (active && snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() } as ConfirmationOrder);
        }
      } catch (err) {
        console.error("Error loading order confirmation:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [orderId]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: storeInfo.currency || "SAR",
    }).format(price);

  const orderNumber = orderId ? orderId.slice(-8).toUpperCase() : "";

  return (
    <div className="order-confirmation-page">
      <div className="container">
        <div className="confirmation-card">
          {loading ? (
            <div className="confirmation-loading">
              <p>جاري تحميل تفاصيل الطلب…</p>
            </div>
          ) : (
            <>
              <div className="confirmation-icon" aria-hidden="true">
              </div>
              <h1>تم استلام طلبك بنجاح!</h1>
              <p className="confirmation-subtitle">
                شكراً لك على الشراء من {storeInfo.storeName || "متجرنا"}
              </p>

              <div className="confirmation-order-box">
                <span className="label">رقم الطلب</span>
                <span className="order-number">#{orderNumber}</span>
              </div>

              {order?.total != null && (
                <div className="confirmation-total">
                  <span>الإجمالي: </span>
                  <strong>{formatPrice(order.total)}</strong>
                </div>
              )}

              {order?.paymentStatus === "paid" && (
                <div className="confirmation-paid">تم الدفع بنجاح ✓</div>
              )}

              <div className="confirmation-actions">
                {/* الفاتورة أولاً: هي ما يحتاجه العميل فور الدفع. */}
                <Link
                  to={`/invoice/${orderId}`}
                  className="btn btn-primary"
                >
                  تحميل الفاتورة
                </Link>
                <Link to="/account" className="btn btn-outline">
                  عرض طلباتي
                </Link>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate("/products")}
                >
                  مواصلة التسوق
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
