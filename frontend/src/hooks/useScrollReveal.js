import { useEffect } from "react";

/** Reveal a section once. Content stays visible if motion or observers are unavailable. */
export default function useScrollReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!root || !window.IntersectionObserver || preference.matches) return;

    const elements = [...root.querySelectorAll("[data-reveal]")];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          target.dataset.revealState = "visible";
          observer.unobserve(target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );

    elements.forEach((element) => {
      element.dataset.revealState = "waiting";
      observer.observe(element);
    });

    const showAll = () => {
      if (!preference.matches) return;
      observer.disconnect();
      elements.forEach((element) => {
        element.dataset.revealState = "visible";
      });
    };
    preference.addEventListener("change", showAll);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", showAll);
      elements.forEach((element) => {
        delete element.dataset.revealState;
      });
    };
  }, [rootRef]);
}
