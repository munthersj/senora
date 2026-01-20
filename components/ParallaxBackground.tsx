"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export default function ParallaxBackground({
  className,
}: {
  className?: string;
}) {
  // ✅ الأداء على الجوال: طبقات blur كبيرة + fixed + scroll RAF قد تكون ثقيلة.
  // لذلك نفعلها فقط على الشاشات المتوسطة+ ومع عدم تفعيل reduce-motion.
  const [enabled, setEnabled] = useState(false);

  const rafRef = useRef<number | null>(null);
  const yRef = useRef(0);

  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 768px)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      const ok = !mqMobile.matches && !mqReduce.matches;
      setEnabled(ok);
    };

    update();
    mqMobile.addEventListener?.("change", update);
    mqReduce.addEventListener?.("change", update);

    return () => {
      mqMobile.removeEventListener?.("change", update);
      mqReduce.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onScroll = () => {
      yRef.current = window.scrollY || 0;

      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        const y = yRef.current;

        // طبقات تتحرك بسرعات مختلفة (خفيف)
        const l1 = document.getElementById("px-layer-1");
        const l2 = document.getElementById("px-layer-2");
        const l3 = document.getElementById("px-layer-3");

        if (l1) l1.style.transform = `translate3d(0, ${y * 0.08}px, 0)`;
        if (l2) l2.style.transform = `translate3d(0, ${y * 0.14}px, 0)`;
        if (l3) l3.style.transform = `translate3d(0, ${y * 0.2}px, 0)`;

        rafRef.current = null;
      });
    };

    // أول تشغيل
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      {/* Gold glow (أبطأ) */}
      <div
        id="px-layer-1"
        className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(225,194,84,0.42), transparent 62%)",
        }}
      />

      {/* Soft green-tint glow (خفيف جداً للهوية - فاتح) */}
      <div
        id="px-layer-2"
        className="absolute top-[20vh] right-[-140px] h-[520px] w-[520px] rounded-full blur-3xl opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(0,68,57,0.20), transparent 64%)",
        }}
      />

      {/* خطوط فخمة خفيفة */}
      <div
        id="px-layer-3"
        className="absolute left-0 top-[55vh] h-[520px] w-[110%] opacity-[0.10]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(225,194,84,0.35), transparent)",
          transform: "skewY(-6deg)",
        }}
      />
    </div>
  );
}
