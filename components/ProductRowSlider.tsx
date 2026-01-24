"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import type { ProductDTO } from "@/lib/types/home";

import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/cn";
function toUIProduct(dto: ProductDTO): Product {
  return {
    id: dto.id,
    name: dto.name,
    price: dto.price,
    currency: "USD", // أو "AED" حسب مشروعك
    description: dto.description ?? "",
    images: dto.images,
    categories: dto.categories,
    colors: dto.colors?.length ? dto.colors.slice(0, 6) : ["الأكثر مبيعاً"],
    details: [
      { label: "الطلبات", value: String(dto.orders_count ?? 0) },
      { label: "الزيارات", value: String(dto.visitor ?? 0) },
    ],
    options: {
      sizes: dto.sizes?.map(String) ?? [],
      // colors: dto.colors?.map((name) => ({ name })) ?? [],
    },
    topSeller: true,
    trending: false,
  };
}

function ArrowBtn({
  dir,
  onClick,
  className,
}: {
  dir: "left" | "right";
  onClick: () => void;
  className?: string;
}) {
  const label = dir === "left" ? "السابق" : "التالي";
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 z-10 -translate-y-1/2",
        "rounded-full border border-black/10 bg-white/85 p-3 shadow-soft md:backdrop-blur",
        "transition hover:bg-white",
        dir === "left" ? "left-2" : "right-2",
        className,
      )}
    >
      <span className="text-lg leading-none text-black/70">
        {dir === "left" ? "›" : "‹"}
      </span>
    </button>
  );
}

export default function ProductRowSlider({
  products,
  className,
}: {
  products: ProductDTO[];
  className?: string;
}) {
  const uiProducts = useMemo(() => products.map(toUIProduct), [products]);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);

  // ✅ حجم “قفزة” السهم حسب عرض كارد واحد تقريباً
  const step = useMemo(() => 320, []);

  const scrollBy = (dx: number) => {
    wrapRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  };

  // ✅ Auto-scroll خفيف (يتوقف على hover)
  useEffect(() => {
    if (paused) return;

    const el = wrapRef.current;
    if (!el) return;

    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;

      const max = el.scrollWidth - el.clientWidth;
      const next = el.scrollLeft + step;

      // إذا وصل آخر السطر، رجّعه للبداية بنعومة
      if (next >= max - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 4500);

    return () => window.clearInterval(id);
  }, [paused, step]);

  return (
    <div className={cn("relative", className)}>
      <ArrowBtn
        dir="right"
        onClick={() => scrollBy(step)}
        className="hidden md:inline-flex"
      />
      <ArrowBtn
        dir="left"
        onClick={() => scrollBy(-step)}
        className="hidden md:inline-flex"
      />

      <div
        ref={wrapRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className={cn(
          "flex gap-5 overflow-x-auto scroll-smooth",
          "px-4 md:px-12 py-2",
          "no-scrollbar",
        )}
      >
        {uiProducts.map((p) => (
          <div key={p.id} className="w-[220px] md:w-[260px] shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
