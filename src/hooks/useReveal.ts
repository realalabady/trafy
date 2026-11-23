import { useEffect, useRef } from "react";

/**
 * ظهور هادئ عند التمرير عبر IntersectionObserver.
 * بلا GSAP: تبعية لا تستحق نفسها في متجر يُفتح يومياً — انظر BRAND.md §6.
 *
 * مبدأ أساسي: الحركة زينة، والمحتوى ليس كذلك. إذا تعثّر المراقب لأي سبب
 * (ترتيب تحميل الخطوط، إعادة تخطيط، متصفح قديم) يجب أن يظهر كل شيء، لا أن
 * يبقى مخفياً. لذلك هنا ثلاث طبقات: فحص فوري لما هو داخل الشاشة، ثم مراقب،
 * ثم مؤقّت أمان يكشف الباقي.
 */
const FAILSAFE_MS = 1200;

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets: HTMLElement[] = root.classList.contains("reveal")
      ? [root]
      : Array.from(root.querySelectorAll<HTMLElement>(".reveal"));

    if (targets.length === 0) return;

    const show = (el: Element) => el.classList.add("is-visible");

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      targets.forEach(show);
      return;
    }

    targets.forEach((el, i) => el.style.setProperty("--i", String(i % 6)));

    // 1) ما هو ظاهر الآن يظهر فوراً، بلا انتظار دورة المراقب.
    const inView = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.92 && r.bottom > 0;
    };
    const pending = targets.filter((el) => {
      if (inView(el)) {
        show(el);
        return false;
      }
      return true;
    });

    // 2) الباقي بالمراقب.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    pending.forEach((el) => observer.observe(el));

    // 3) مؤقّت أمان: لا يبقى محتوى مخفياً بسبب حركة.
    const failsafe = window.setTimeout(() => {
      pending.forEach((el) => {
        if (inView(el)) show(el);
      });
    }, FAILSAFE_MS);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return ref;
}
