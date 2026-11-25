import React from "react";
import type { FirestoreOrder } from "../../services/firestore";
import type { BusinessInfo } from "../../config/business";
import type { StoreInfo } from "../../store/useStore";
import {
  computeInvoiceTotals,
  formatInvoiceDate,
  formatInvoiceDateEn,
  formatSAR,
  paymentLabel,
  resolveInvoiceNumber,
} from "../../utils/invoice";
import { amountToArabicWords } from "../../utils/arabicNumberWords";
import "./Invoice.css";

interface InvoiceProps {
  order: FirestoreOrder;
  business: BusinessInfo;
  storeInfo: StoreInfo;
}

// الإنجليزية في نفس السطر لا تحته: السطر الثاني كان يضاعف ارتفاع كل حقل ويترك
// نصف الصفحة فارغاً على الجوال.
const L: React.FC<{ ar: string; en: string }> = ({ ar, en }) => (
  <>
    {ar} <span className="invoice-en">{en}</span>
  </>
);

// حقل واحد: تسمية صغيرة ثم قيمة. الوحدة التي يتكرر بها المستند كله.
const Field: React.FC<{
  ar: string;
  en: string;
  children: React.ReactNode;
  mono?: boolean;
  wide?: boolean;
}> = ({ ar, en, children, mono, wide }) => (
  <div className={wide ? "invoice-field invoice-field-wide" : "invoice-field"}>
    <span className="invoice-key">
      <L ar={ar} en={en} />
    </span>
    <strong className={mono ? "invoice-val price" : "invoice-val"}>
      {children}
    </strong>
  </div>
);

// الفاتورة — مستند للطباعة. عرض فقط: كل الأرقام من اللقطة المثبّتة على الطلب،
// لا من إعدادات المتجر الحالية.
const Invoice: React.FC<InvoiceProps> = ({ order, business, storeInfo }) => {
  const totals = computeInvoiceTotals(order);
  const serial = resolveInvoiceNumber(order, business.invoicePrefix);
  const payment = paymentLabel(order.paymentMethod);
  const paid = order.paymentStatus === "paid";

  const legalName = business.legalName || storeInfo.storeName || "ترفي";
  const words = amountToArabicWords(totals.total);
  const address = order.address;

  const paymentState = paid
    ? { ar: "مدفوعة", en: "Paid" }
    : order.paymentMethod === "cash"
      ? { ar: "تُدفع عند الاستلام", en: "Payable on delivery" }
      : { ar: "غير مدفوعة", en: "Unpaid" };

  const shippingLine = address
    ? [address.street, address.building, address.district, address.city]
        .filter(Boolean)
        .join("، ")
    : order.shippingAddress || "—";

  return (
    <article className="invoice" dir="rtl" lang="ar">
      {/* ==================== الترويسة ==================== */}
      <header className="invoice-head">
        {business.logoUrl ? (
          <img className="invoice-logo" src={business.logoUrl} alt={legalName} />
        ) : (
          <p className="invoice-wordmark display">{legalName}</p>
        )}
        {business.legalNameEn && (
          <p className="invoice-wordmark-en">{business.legalNameEn}</p>
        )}

        <h1 className="invoice-title display">
          {totals.isTaxInvoice ? "فاتورة ضريبية مبسطة" : "فاتورة"}
        </h1>
        <p className="invoice-title-en">
          {totals.isTaxInvoice ? "Simplified Tax Invoice" : "Invoice"}
        </p>
      </header>

      {/* ==================== بيانات الفاتورة ==================== */}
      <section className="invoice-block invoice-grid-3">
        <Field ar="رقم الفاتورة" en="Invoice No." mono wide>
          {serial}
        </Field>
        {/* العربي للتاريخ، والسطر الإنجليزي أسفله يحمل الوقت الدقيق. خلط
            الاتجاهين في سطر واحد كان يبعثر ترتيب الأرقام (bidi). */}
        <Field ar="تاريخ الإصدار" en="Issue Date">
          {formatInvoiceDate(order.createdAt)}
          <span className="invoice-sub price" dir="ltr">
            {formatInvoiceDateEn(order.createdAt)}
          </span>
        </Field>
        <Field ar="رقم الطلب" en="Order No." mono>
          {order.id.slice(-8).toUpperCase()}
        </Field>
      </section>

      {/* ==================== الطرفان ==================== */}
      <section className="invoice-parties">
        <div className="invoice-party">
          <h2 className="invoice-party-title">
            <L ar="مصدرة من" en="From" />
          </h2>
          <p className="invoice-party-name">{legalName}</p>
          <dl className="invoice-party-list">
            {business.crNumber && (
              <div>
                <dt>
                  <L ar="السجل التجاري" en="CR" />
                </dt>
                <dd className="price">{business.crNumber}</dd>
              </div>
            )}
            {business.crUnifiedNumber && (
              <div>
                <dt>
                  <L ar="الرقم الموحد" en="Unified" />
                </dt>
                <dd className="price">{business.crUnifiedNumber}</dd>
              </div>
            )}
            {/* الرقم الضريبي لا يُطبع إلا إذا كان المتجر مسجّلاً فعلاً. */}
            {totals.isTaxInvoice && (
              <div>
                <dt>
                  <L ar="الرقم الضريبي" en="VAT" />
                </dt>
                <dd className="price">{order.invoiceVatNumber}</dd>
              </div>
            )}
          </dl>
          <p className="invoice-party-line">
            {business.addressAr || storeInfo.storeAddress}
          </p>
          {storeInfo.storePhone && (
            <p className="invoice-party-line price">{storeInfo.storePhone}</p>
          )}
          {storeInfo.storeEmail && (
            <p className="invoice-party-line">{storeInfo.storeEmail}</p>
          )}
        </div>

        <div className="invoice-party">
          <h2 className="invoice-party-title">
            <L ar="مصدرة إلى" en="To" />
          </h2>
          <p className="invoice-party-name">
            {address?.fullName || order.customer || "—"}
          </p>
          {(address?.phone || order.phone) && (
            <p className="invoice-party-line price">
              {address?.phone || order.phone}
            </p>
          )}
          {order.email && (
            <p className="invoice-party-line">{order.email}</p>
          )}
          <p className="invoice-party-line">{shippingLine}</p>
          {address?.nationalAddress && (
            <p className="invoice-party-line price">
              العنوان الوطني: {address.nationalAddress}
            </p>
          )}
        </div>
      </section>

      {/* ==================== الدفع ==================== */}
      <section className="invoice-block invoice-grid-3">
        <Field ar="المبلغ" en="Amount" mono>
          {formatSAR(totals.total)}
        </Field>
        <Field ar="طريقة الدفع" en="Payment Method">
          {payment.ar}
        </Field>
        <Field ar="حالة الدفع" en="Status">
          <span className={paid ? "invoice-paid" : "invoice-unpaid"}>
            {paymentState.ar}
          </span>
        </Field>
      </section>

      {/* ==================== البنود ==================== */}
      <table className="invoice-items">
        <thead>
          <tr>
            <th className="invoice-col-no">#</th>
            <th>
              <L ar="المنتج" en="Item" />
            </th>
            <th className="invoice-col-num">
              <L ar="الكمية" en="Qty" />
            </th>
            <th className="invoice-col-num">
              <L ar="السعر" en="Price" />
            </th>
            <th className="invoice-col-num">
              <L ar="المجموع" en="Total" />
            </th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, index) => (
            <tr key={`${item.productId}-${index}`}>
              <td className="invoice-col-no price">{index + 1}</td>
              <td className="invoice-col-name">{item.name}</td>
              <td className="invoice-col-num price">{item.quantity}</td>
              <td className="invoice-col-num price">{formatSAR(item.price)}</td>
              <td className="invoice-col-num price">
                {formatSAR(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ==================== المجاميع ==================== */}
      <section className="invoice-foot">
        <div className="invoice-words">
          <span className="invoice-key">
            <L ar="المبلغ كتابةً" en="In Words" />
          </span>
          <p>{words || "—"}</p>
          {order.notes && (
            <>
              <span className="invoice-key invoice-notes-key">
                <L ar="ملاحظات" en="Notes" />
              </span>
              <p className="invoice-notes">{order.notes}</p>
            </>
          )}
        </div>

        <dl className="invoice-totals">
          <div>
            <dt>
              <L ar="المجموع الفرعي" en="Subtotal" />
            </dt>
            <dd className="price">{formatSAR(totals.subtotal)}</dd>
          </div>
          <div>
            <dt>
              <L ar="الشحن" en="Shipping" />
            </dt>
            <dd className="price">
              {totals.shipping > 0 ? formatSAR(totals.shipping) : "مجاني"}
            </dd>
          </div>

          {/* الأسعار شاملة للضريبة نظاماً، فالضريبة مستخرجة من الإجمالي لا
              مضافة إليه — المبلغ المحصّل لا يتغيّر. */}
          {totals.isTaxInvoice && (
            <>
              <div>
                <dt>
                  <L ar="قبل الضريبة" en="Taxable" />
                </dt>
                <dd className="price">{formatSAR(totals.netTotal)}</dd>
              </div>
              <div>
                <dt>
                  <L
                    ar={`ضريبة القيمة المضافة ${totals.vatRate}%`}
                    en={`VAT ${totals.vatRate}%`}
                  />
                </dt>
                <dd className="price">{formatSAR(totals.vatAmount)}</dd>
              </div>
            </>
          )}

          <div className="invoice-grand">
            <dt>
              <L ar="الإجمالي المستحق" en="Total Due" />
            </dt>
            <dd className="price">{formatSAR(totals.total)}</dd>
          </div>
        </dl>
      </section>

      {/* ==================== التحقق النظامي ==================== */}
      <footer className="invoice-verify">
        {business.crVerifyUrl && (
          <div className="invoice-qr">
            <img src="/images/cr-qr.svg" alt="" width={88} height={88} />
          </div>
        )}
        <div className="invoice-verify-body">
          <img
            className="invoice-sbc"
            src="/images/sbc-logo.svg"
            alt="المركز السعودي للتنافسية والأعمال"
            width={247}
            height={48}
          />
          <p className="invoice-verify-text">
            امسح الرمز للتحقق من السجل التجاري لدى المركز السعودي للأعمال.
          </p>
          {business.invoiceNotes && (
            <p className="invoice-verify-text">{business.invoiceNotes}</p>
          )}
          <p className="invoice-issued">
            فاتورة صادرة إلكترونياً ولا تحتاج إلى توقيع أو خاتم ·
            Electronically issued, no signature required.
          </p>
        </div>
      </footer>
    </article>
  );
};

export default Invoice;
