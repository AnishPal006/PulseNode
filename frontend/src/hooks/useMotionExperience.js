import { useEffect, useState } from "react";

/** Frame-batched pointer depth; no continuous JavaScript animation loop. */
export default function useMotionExperience(rootRef) {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const enabled = !paused && !reduced;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;

    let pointerFrame = 0;
    let scrollFrame = 0;
    const surfaces = [...root.querySelectorAll("[data-pointer-surface]")];
    const zones = [...root.querySelectorAll("[data-motion-zone]")];
    const scenes = [...root.querySelectorAll("[data-scroll-scene]")];
    const pinnedLayout = window.matchMedia(
      "(min-width: 960px) and (min-height: 620px)",
    );
    const observer = window.IntersectionObserver
      ? new IntersectionObserver((entries) => {
          entries.forEach(({ target, isIntersecting }) => {
            target.dataset.motionVisible = String(isIntersecting);
          });
        })
      : null;
    zones.forEach((zone) => observer?.observe(zone));

    const updateVisibility = () => {
      root.dataset.motionHidden = String(document.hidden);
    };
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);

    const resetSurface = (surface) => {
      ["--pointer-x", "--pointer-y", "--tilt-x", "--tilt-y"].forEach((key) =>
        surface.style.removeProperty(key),
      );
    };
    const bindings = surfaces.map((surface) => {
      const move = (event) => {
        if (event.pointerType !== "mouse") return;
        cancelAnimationFrame(pointerFrame);
        pointerFrame = requestAnimationFrame(() => {
          const bounds = surface.getBoundingClientRect();
          const x = Math.max(
            0,
            Math.min(1, (event.clientX - bounds.left) / bounds.width),
          );
          const y = Math.max(
            0,
            Math.min(1, (event.clientY - bounds.top) / bounds.height),
          );
          surface.style.setProperty("--pointer-x", `${x * 100}%`);
          surface.style.setProperty("--pointer-y", `${y * 100}%`);
          surface.style.setProperty("--tilt-x", `${(0.5 - y) * 5}deg`);
          surface.style.setProperty("--tilt-y", `${(x - 0.5) * 5}deg`);
        });
      };
      const leave = () => {
        cancelAnimationFrame(pointerFrame);
        resetSurface(surface);
      };
      surface.addEventListener("pointermove", move, { passive: true });
      surface.addEventListener("pointerleave", leave);
      return { surface, move, leave };
    });

    const updateProgress = () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress =
          max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
        root.style.setProperty("--scroll-progress", progress);

        // Read scene geometry together, then write compositor-only transforms.
        const sceneProgress = scenes.map((scene) => {
          // offsetTop excludes this scene's animated transform, avoiding feedback
          // between the scroll measurement and the position it drives.
          let layoutTop = 0;
          let ancestor = scene;
          while (ancestor) {
            layoutTop += ancestor.offsetTop;
            ancestor = ancestor.offsetParent;
          }
          const top = layoutTop - window.scrollY;
          let value;
          if (
            scene.dataset.scrollScene === "showcase" &&
            pinnedLayout.matches
          ) {
            const stage = scene.querySelector(".scroll-stage");
            const distance = Math.max(
              1,
              scene.offsetHeight - stage.offsetHeight,
            );
            value = (88 - top) / distance;
          } else {
            value =
              (window.innerHeight * 0.9 - top) / (window.innerHeight * 0.65);
          }
          const bounded = Math.max(0, Math.min(1, value));
          return bounded * bounded * (3 - 2 * bounded);
        });
        scenes.forEach((scene, index) => {
          scene.style.setProperty(
            "--scene-progress",
            sceneProgress[index].toFixed(4),
          );
        });
      });
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      cancelAnimationFrame(pointerFrame);
      cancelAnimationFrame(scrollFrame);
      observer?.disconnect();
      zones.forEach((zone) => delete zone.dataset.motionVisible);
      delete root.dataset.motionHidden;
      root.style.removeProperty("--scroll-progress");
      scenes.forEach((scene) => scene.style.removeProperty("--scene-progress"));
      document.removeEventListener("visibilitychange", updateVisibility);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      bindings.forEach(({ surface, move, leave }) => {
        surface.removeEventListener("pointermove", move);
        surface.removeEventListener("pointerleave", leave);
        resetSurface(surface);
      });
    };
  }, [enabled, rootRef]);

  return {
    paused,
    reduced,
    enabled,
    toggleMotion: () => setPaused((value) => !value),
  };
}
