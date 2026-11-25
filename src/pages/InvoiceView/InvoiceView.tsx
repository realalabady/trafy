import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getDoc } from "firebase/firestore";
import { storeDoc } from "../../config/store";
import { useStore } from "../../store/useStore";
import InvoiceDocument from "../../components/Invoice/Invoice";
import type { FirestoreOrder } from "../../services/firestore";
import { resolveInvoiceNumber } from "../../utils/invoice";
import "./InvoiceView.css";

type LoadState = "loading" | "ready" | "denied" | "missing";

// صفحة الفاتورة: تقرأ الطلب وتعرض المستند، وشريط أدوات يختفي عند الطباعة.
// لا تحتاج تحقّقاً من الصلاحية في الواجهة: قواعد Firestore تسمح بقراءة الطلب
// لصاحبه أو لأدمن المتجر فقط، فطلب الغريب يفشل بـ permission-denied ونلتقطه.
const InvoiceView: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { businessInfo, storeInfo } = useStore();
  const [order, setOrder] = useState<FirestoreOrder | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!orderId) {
        setState("missing");
        return;
      }
      try {
        const snap = await getDoc(storeDoc("orders", orderId));
        if (!active) return;
        if (!snap.exists()) {
          setState("missing");
          return;
        }
        const data = snap.data();
        setOrder({
          id: snap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as FirestoreOrder);
        setState("ready");
      } catch (err) {
        if (!active) return;
        console.error("Error loading invoice:", err);
        setState("denied");
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [orderId]);

  // عنوان الصفحة يصبح رقم الفاتورة، فيقترحه المتصفح اسماً لملف PDF عند
  // "الحفظ كـ PDF" بدل عنوان الموقع.
  useEffect(() => {
    if (!order) return;
    const previous = document.title;
    document.title = `فاتورة ${resolveInvoiceNumber(
      order,
      businessInfo.invoicePrefix,
    )}`;
    return () => {
      document.title = previous;
    };
  }, [order, businessInfo.invoicePrefix]);

  if (state === "loading") {
    return (
      <div className="invoice-view">
        <p className="invoice-view-state">جاري تحميل الفاتورة…</p>
      </div>
    );
  }

  if (state !== "ready" || !order) {
    return (
      <div className="invoice-view">
        <div className="invoice-view-state">
          <h1>
            {state === "missing"
              ? "لا توجد فاتورة بهذا الرقم"
              : "غير مصرح بالوصول لهذه الفاتورة"}
          </h1>
          <p>
            {state === "missing"
              ? "تأكّد من الرابط، أو افتح الفاتورة من صفحة طلباتك."
              : "الفاتورة تُعرض لصاحب الطلب أو لإدارة المتجر فقط. سجّل الدخول بالحساب الذي أنشأ الطلب."}
          </p>
          <div className="invoice-view-actions">
            <Link to="/account" className="btn btn-primary">
              طلباتي
            </Link>
            <Link to="/" className="btn btn-secondary">
              الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-view">
      <div className="invoice-toolbar">
        <Link to="/account" className="invoice-toolbar-back">
          ← طلباتي
        </Link>
        <div className="invoice-toolbar-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.print()}
          >
            طباعة / حفظ PDF
          </button>
        </div>
      </div>

      <p className="invoice-toolbar-hint">
        اختر «الحفظ كـ PDF» في نافذة الطباعة للحصول على ملف الفاتورة.
      </p>

      <InvoiceDocument
        order={order}
        business={businessInfo}
        storeInfo={storeInfo}
      />
    </div>
  );
};

export default InvoiceView;
