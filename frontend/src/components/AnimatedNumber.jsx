import { useEffect, useRef } from "react";

export default function AnimatedNumber({ value, pad = 0 }) {
  const ref = useRef(null);
  const target = Number(value) || 0;
  const finalText = String(target).padStart(pad, "0");

  useEffect(() => {
    const element = ref.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || preference.matches || !window.IntersectionObserver) return;
    let frame;
    const finish = () => {
      cancelAnimationFrame(frame);
      element.textContent = finalText;
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / 850, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent =
            progress === 1
              ? finalText
              : String(Math.round(target * eased)).padStart(pad, "0");
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        if (!preference.matches) frame = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    preference.addEventListener("change", finish);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", finish);
      finish();
    };
  }, [target, pad, finalText]);

  return (
    <span className="animated-number" aria-label={finalText}>
      <span ref={ref} aria-hidden="true">
        {finalText}
      </span>
    </span>
  );
}
