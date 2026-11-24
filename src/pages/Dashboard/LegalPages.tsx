import React, { useEffect, useMemo, useState } from "react";
import {
  Save,
  Loader,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  ExternalLink,
  FileText,
  Truck,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { useToast } from "../../components/Toast/Toast";
import { getLegalContent, updateLegalContent } from "../../services/firestore";
import {
  DEFAULT_LEGAL_CONTENT,
  LEGAL_PAGE_META,
  cloneLegalContent,
  mergeLegalContent,
  type FaqCategory,
  type LegalContent,
  type LegalDocKey,
  type LegalDocument,
  type LegalListType,
  type LegalSection,
} from "../../data/legalContent";
import "./LegalPages.css";

type TabKey = keyof LegalContent;

const tabs: { id: TabKey; label: string; icon: typeof FileText }[] = [
  { id: "returns", label: "الاسترجاع والاستبدال", icon: RotateCcw },
  { id: "shipping", label: "الشحن والتوصيل", icon: Truck },
  { id: "privacy", label: "الخصوصية", icon: ShieldCheck },
  { id: "faq", label: "الأسئلة الشائعة", icon: HelpCircle },
];

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const emptySection = (): LegalSection => ({
  id: newId("section"),
  heading: "قسم جديد",
  body: "",
  listType: "none",
  items: [],
  highlight: "",
});

/** نقل عنصر داخل مصفوفة؛ يعيد نفس المصفوفة إذا كانت الوجهة خارج الحدود */
const move = <T,>(list: T[], index: number, delta: number): T[] => {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

const LegalPages: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("returns");
  const [content, setContent] = useState<LegalContent>(() =>
    cloneLegalContent(DEFAULT_LEGAL_CONTENT),
  );
  const [savedSnapshot, setSavedSnapshot] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // تُحمّل مرة واحدة (getDoc لا onSnapshot): اشتراك حي أثناء الكتابة يعني أن
  // حفظك الخاص يعيد كتابة ما تحت يدك ويفقد ما لم يُحفظ بعد.
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await getLegalContent();
        const merged = mergeLegalContent(stored);
        setContent(merged);
        setSavedSnapshot(JSON.stringify(merged));
      } catch (error) {
        console.error("Error loading legal content:", error);
        showToast("تعذّر تحميل محتوى الصفحات القانونية", "error");
        setSavedSnapshot(JSON.stringify(cloneLegalContent(DEFAULT_LEGAL_CONTENT)));
      } finally {
        setLoading(false);
      }
    };
    load();
    // showToast ثابت من الـ context؛ التحميل مرة واحدة عند فتح الصفحة.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDirty = useMemo(
    () => !loading && JSON.stringify(content) !== savedSnapshot,
    [content, savedSnapshot, loading],
  );

  // تحذير عند مغادرة الصفحة وفيها تعديلات غير محفوظة
  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLegalContent(content);
      setSavedSnapshot(JSON.stringify(content));
      showToast("تم حفظ الصفحات القانونية ونشرها في المتجر", "success");
    } catch (error) {
      console.error("Error saving legal content:", error);
      showToast("تعذّر الحفظ. تأكد من صلاحيات الأدمن ثم أعد المحاولة", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    const label = LEGAL_PAGE_META[activeTab].label;
    if (
      !window.confirm(
        `استعادة النص الافتراضي لصفحة "${label}"؟ سيُستبدل ما هو مكتوب الآن في هذه الصفحة فقط، ولن يُنشر حتى تضغط "حفظ ونشر".`,
      )
    ) {
      return;
    }
    setContent((prev) => ({
      ...prev,
      [activeTab]: cloneLegalContent(DEFAULT_LEGAL_CONTENT[activeTab]),
    }));
    showToast("تمت استعادة النص الافتراضي — اضغط حفظ لنشره", "info");
  };

  // ==================== محرر الصفحات ذات الأقسام ====================

  const patchDoc = (key: LegalDocKey, patch: Partial<LegalDocument>) =>
    setContent((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const patchSection = (
    key: LegalDocKey,
    index: number,
    patch: Partial<LegalSection>,
  ) =>
    setContent((prev) => {
      const sections = prev[key].sections.map((section, i) =>
        i === index ? { ...section, ...patch } : section,
      );
      return { ...prev, [key]: { ...prev[key], sections } };
    });

  const setSections = (key: LegalDocKey, sections: LegalSection[]) =>
    setContent((prev) => ({ ...prev, [key]: { ...prev[key], sections } }));

  const renderDocEditor = (key: LegalDocKey) => {
    const doc = content[key];
    return (
      <>
        <div className="legal-admin-card">
          <div className="legal-admin-card-head">
            <FileText size={20} />
            <h2>رأس الصفحة</h2>
          </div>
          <div className="legal-admin-body">
            <div className="legal-admin-row">
              <div className="legal-admin-field">
                <label>عنوان الصفحة</label>
                <input
                  type="text"
                  value={doc.title}
                  onChange={(e) => patchDoc(key, { title: e.target.value })}
                />
              </div>
              <div className="legal-admin-field">
                <label>آخر تحديث</label>
                <input
                  type="text"
                  value={doc.lastUpdated}
                  placeholder="نوفمبر 2026"
                  onChange={(e) =>
                    patchDoc(key, { lastUpdated: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="legal-admin-field">
              <label>الوصف تحت العنوان</label>
              <input
                type="text"
                value={doc.subtitle}
                onChange={(e) => patchDoc(key, { subtitle: e.target.value })}
              />
            </div>
          </div>
        </div>

        {doc.sections.map((section, index) => (
          <div className="legal-admin-card" key={section.id}>
            <div className="legal-admin-card-head">
              <span className="legal-admin-index">{index + 1}</span>
              <h2 className="legal-admin-section-title">
                {section.heading || "قسم بلا عنوان"}
              </h2>
              <div className="legal-admin-actions">
                <button
                  type="button"
                  title="تحريك لأعلى"
                  disabled={index === 0}
                  onClick={() =>
                    setSections(key, move(doc.sections, index, -1))
                  }
                >
                  <ChevronUp size={18} />
                </button>
                <button
                  type="button"
                  title="تحريك لأسفل"
                  disabled={index === doc.sections.length - 1}
                  onClick={() => setSections(key, move(doc.sections, index, 1))}
                >
                  <ChevronDown size={18} />
                </button>
                <button
                  type="button"
                  className="danger"
                  title="حذف القسم"
                  onClick={() => {
                    if (window.confirm("حذف هذا القسم؟")) {
                      setSections(
                        key,
                        doc.sections.filter((_, i) => i !== index),
                      );
                    }
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="legal-admin-body">
              <div className="legal-admin-field">
                <label>عنوان القسم</label>
                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) =>
                    patchSection(key, index, { heading: e.target.value })
                  }
                />
              </div>

              <div className="legal-admin-field">
                <label>
                  الفقرة
                  <span className="legal-admin-hint">
                    أحِط النص بـ ** لإبرازه، مثل: **7 أيام**
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={section.body}
                  onChange={(e) =>
                    patchSection(key, index, { body: e.target.value })
                  }
                />
              </div>

              <div className="legal-admin-field">
                <label>نوع القائمة</label>
                <select
                  value={section.listType}
                  onChange={(e) =>
                    patchSection(key, index, {
                      listType: e.target.value as LegalListType,
                    })
                  }
                >
                  <option value="none">بدون قائمة</option>
                  <option value="ul">نقاط</option>
                  <option value="ol">خطوات مرقّمة</option>
                </select>
              </div>

              {section.listType !== "none" && (
                <div className="legal-admin-field">
                  <label>بنود القائمة</label>
                  {section.items.map((item, itemIndex) => (
                    <div className="legal-admin-item-row" key={itemIndex}>
                      <span className="legal-admin-bullet">
                        {section.listType === "ol" ? `${itemIndex + 1}.` : "•"}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          patchSection(key, index, {
                            items: section.items.map((value, i) =>
                              i === itemIndex ? e.target.value : value,
                            ),
                          })
                        }
                      />
                      <button
                        type="button"
                        className="danger"
                        title="حذف البند"
                        onClick={() =>
                          patchSection(key, index, {
                            items: section.items.filter(
                              (_, i) => i !== itemIndex,
                            ),
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="legal-admin-add small"
                    onClick={() =>
                      patchSection(key, index, {
                        items: [...section.items, ""],
                      })
                    }
                  >
                    <Plus size={16} />
                    إضافة بند
                  </button>
                </div>
              )}

              <div className="legal-admin-field">
                <label>
                  ملاحظة مميزة
                  <span className="legal-admin-hint">
                    تظهر داخل صندوق ملوّن أسفل القسم — اتركها فارغة لإخفائها
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={section.highlight}
                  onChange={(e) =>
                    patchSection(key, index, { highlight: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="legal-admin-add"
          onClick={() => setSections(key, [...doc.sections, emptySection()])}
        >
          <Plus size={18} />
          إضافة قسم جديد
        </button>

        <div className="legal-admin-card">
          <div className="legal-admin-card-head">
            <HelpCircle size={20} />
            <h2>صندوق التواصل في نهاية الصفحة</h2>
          </div>
          <div className="legal-admin-body">
            <div className="legal-admin-row">
              <div className="legal-admin-field">
                <label>العنوان</label>
                <input
                  type="text"
                  value={doc.contactTitle}
                  onChange={(e) =>
                    patchDoc(key, { contactTitle: e.target.value })
                  }
                />
              </div>
              <div className="legal-admin-field">
                <label>نص الزر</label>
                <input
                  type="text"
                  value={doc.contactButton}
                  onChange={(e) =>
                    patchDoc(key, { contactButton: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="legal-admin-field">
              <label>النص التوضيحي</label>
              <input
                type="text"
                value={doc.contactText}
                onChange={(e) => patchDoc(key, { contactText: e.target.value })}
              />
            </div>
          </div>
        </div>
      </>
    );
  };

  // ==================== محرر الأسئلة الشائعة ====================

  const setFaqCategories = (categories: FaqCategory[]) =>
    setContent((prev) => ({ ...prev, faq: { ...prev.faq, categories } }));

  const patchCategory = (index: number, patch: Partial<FaqCategory>) =>
    setFaqCategories(
      content.faq.categories.map((category, i) =>
        i === index ? { ...category, ...patch } : category,
      ),
    );

  const renderFaqEditor = () => {
    const { faq } = content;
    return (
      <>
        <div className="legal-admin-card">
          <div className="legal-admin-card-head">
            <FileText size={20} />
            <h2>رأس الصفحة</h2>
          </div>
          <div className="legal-admin-body">
            <div className="legal-admin-field">
              <label>عنوان الصفحة</label>
              <input
                type="text"
                value={faq.title}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    faq: { ...prev.faq, title: e.target.value },
                  }))
                }
              />
            </div>
            <div className="legal-admin-field">
              <label>الوصف تحت العنوان</label>
              <input
                type="text"
                value={faq.subtitle}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    faq: { ...prev.faq, subtitle: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </div>

        {faq.categories.map((category, catIndex) => (
          <div className="legal-admin-card" key={category.id}>
            <div className="legal-admin-card-head">
              <span className="legal-admin-index">{catIndex + 1}</span>
              <h2 className="legal-admin-section-title">
                {category.title || "تصنيف بلا اسم"}
              </h2>
              <div className="legal-admin-actions">
                <button
                  type="button"
                  title="تحريك لأعلى"
                  disabled={catIndex === 0}
                  onClick={() =>
                    setFaqCategories(move(faq.categories, catIndex, -1))
                  }
                >
                  <ChevronUp size={18} />
                </button>
                <button
                  type="button"
                  title="تحريك لأسفل"
                  disabled={catIndex === faq.categories.length - 1}
                  onClick={() =>
                    setFaqCategories(move(faq.categories, catIndex, 1))
                  }
                >
                  <ChevronDown size={18} />
                </button>
                <button
                  type="button"
                  className="danger"
                  title="حذف التصنيف"
                  onClick={() => {
                    if (window.confirm("حذف هذا التصنيف وكل أسئلته؟")) {
                      setFaqCategories(
                        faq.categories.filter((_, i) => i !== catIndex),
                      );
                    }
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="legal-admin-body">
              <div className="legal-admin-field">
                <label>اسم التصنيف</label>
                <input
                  type="text"
                  value={category.title}
                  onChange={(e) =>
                    patchCategory(catIndex, { title: e.target.value })
                  }
                />
              </div>

              {category.items.map((item, itemIndex) => (
                <div className="legal-admin-qa" key={item.id}>
                  <div className="legal-admin-qa-head">
                    <span>سؤال {itemIndex + 1}</span>
                    <div className="legal-admin-actions">
                      <button
                        type="button"
                        title="تحريك لأعلى"
                        disabled={itemIndex === 0}
                        onClick={() =>
                          patchCategory(catIndex, {
                            items: move(category.items, itemIndex, -1),
                          })
                        }
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        title="تحريك لأسفل"
                        disabled={itemIndex === category.items.length - 1}
                        onClick={() =>
                          patchCategory(catIndex, {
                            items: move(category.items, itemIndex, 1),
                          })
                        }
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        type="button"
                        className="danger"
                        title="حذف السؤال"
                        onClick={() =>
                          patchCategory(catIndex, {
                            items: category.items.filter(
                              (_, i) => i !== itemIndex,
                            ),
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="السؤال"
                    value={item.question}
                    onChange={(e) =>
                      patchCategory(catIndex, {
                        items: category.items.map((value, i) =>
                          i === itemIndex
                            ? { ...value, question: e.target.value }
                            : value,
                        ),
                      })
                    }
                  />
                  <textarea
                    rows={3}
                    placeholder="الإجابة"
                    value={item.answer}
                    onChange={(e) =>
                      patchCategory(catIndex, {
                        items: category.items.map((value, i) =>
                          i === itemIndex
                            ? { ...value, answer: e.target.value }
                            : value,
                        ),
                      })
                    }
                  />
                </div>
              ))}

              <button
                type="button"
                className="legal-admin-add small"
                onClick={() =>
                  patchCategory(catIndex, {
                    items: [
                      ...category.items,
                      { id: newId("faq"), question: "", answer: "" },
                    ],
                  })
                }
              >
                <Plus size={16} />
                إضافة سؤال
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="legal-admin-add"
          onClick={() =>
            setFaqCategories([
              ...faq.categories,
              { id: newId("cat"), title: "تصنيف جديد", items: [] },
            ])
          }
        >
          <Plus size={18} />
          إضافة تصنيف جديد
        </button>

        <div className="legal-admin-card">
          <div className="legal-admin-card-head">
            <HelpCircle size={20} />
            <h2>صندوق التواصل في نهاية الصفحة</h2>
          </div>
          <div className="legal-admin-body">
            <div className="legal-admin-row">
              <div className="legal-admin-field">
                <label>العنوان</label>
                <input
                  type="text"
                  value={faq.contactTitle}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      faq: { ...prev.faq, contactTitle: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="legal-admin-field">
                <label>نص الزر</label>
                <input
                  type="text"
                  value={faq.contactButton}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      faq: { ...prev.faq, contactButton: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
            <div className="legal-admin-field">
              <label>النص التوضيحي</label>
              <input
                type="text"
                value={faq.contactText}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    faq: { ...prev.faq, contactText: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="legal-admin-page">
        <div className="legal-admin-loading">
          <Loader className="spinner" size={28} />
          <p>جاري تحميل محتوى الصفحات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="legal-admin-page">
      <div className="page-header">
        <div>
          <h1>الصفحات القانونية</h1>
          <p className="legal-admin-lead">
            كل ما تكتبه هنا يظهر مباشرة للعملاء في صفحات المتجر.
          </p>
        </div>
        <div className="legal-admin-head-actions">
          {isDirty && (
            <span className="legal-admin-dirty">تغييرات غير محفوظة</span>
          )}
          <a
            className="btn btn-outline"
            href={LEGAL_PAGE_META[activeTab].path}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={18} />
            معاينة الصفحة
          </a>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleRestoreDefaults}
          >
            <RotateCcw size={18} />
            استعادة النص الافتراضي
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader className="spinner" size={18} />
            ) : (
              <Save size={18} />
            )}
            حفظ ونشر
          </button>
        </div>
      </div>

      <div className="legal-admin-layout">
        <div className="legal-admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="legal-admin-content">
          {activeTab === "faq"
            ? renderFaqEditor()
            : renderDocEditor(activeTab as LegalDocKey)}
        </div>
      </div>
    </div>
  );
};

export default LegalPages;
