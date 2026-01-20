"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";

const INTERVAL_MS = 6000;

type LatestProduct = {
  id: string;
  name: string;
  price: number;
  currency?: string; // من الباك غالباً مو موجود
  images: string[]; // ممكن تكون فاضية
};

function getHeroImage(p?: { images?: string[] }) {
  const first = p?.images?.[0];
  return first && first.length > 0 ? first : "/products/dress-1.svg";
}

export default function AutoMarquee({
  className,
  items,
}: {
  className?: string;
  /** latest_products من الباك */
  items?: LatestProduct[];
}) {
  // ✅ لو ما وصلنا items من الباك (أو كانت فاضية) استخدم الداتا المحلية كـ fallback
  const list = useMemo(() => {
    return items as unknown as LatestProduct[];
  }, [items]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const timerRef = useRef<number | null>(null);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % list.length);
  }, [list.length]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      next();
    }, INTERVAL_MS);
  }, [clearTimer, next]);

  useEffect(() => {
    if (paused) {
      clearTimer();
      return;
    }
    startTimer();
    return clearTimer;
  }, [paused, startTimer, clearTimer]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== "visible") clearTimer();
      else if (!paused) startTimer();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [paused, startTimer, clearTimer]);

  const safeIndex = list.length ? index % list.length : 0;
  const p = list[safeIndex];

  if (!p) return null;

  return (
    <section
      className={cn(
        "max-w-[1400px] mx-auto px-3 sm:px-4 section-fade",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[34px] border border-black/5 shadow-soft md:shadow-2xl",
          "bg-gradient-to-br from-white/70 to-white/30 md:backdrop-blur",
        )}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative h-[350px] sm:h-[430px] lg:h-[490px]">
          <Link href={`/products/${p.id}`} className="absolute inset-0">
            <div key={p.id} className="absolute inset-0 hero-fade-depth">
              <div className="absolute inset-0 overflow-hidden rounded-[34px]">
                <Image
                  src={getHeroImage(p)}
                  alt={p.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(225,194,84,0.25),transparent_55%)]" />

              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-[#004439]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e1c254]" />
                  عروض مميزة
                </span>

                <span className="rounded-full bg-[#004439]/90 px-4 py-2 text-sm font-semibold text-white">
                  الأكثر طلباً
                </span>
              </div>

              <div className="absolute bottom-0 w-full p-5 sm:p-8 lg:p-10">
                <div className="max-w-2xl">
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                    {p.name}
                  </h2>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full bg-[#e1c254] px-6 py-3 text-sm font-bold text-[#004439] shadow-lg">
                      عرض التفاصيل
                    </span>
                    <span className="inline-flex rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/25">
                      توصيل سريع داخل الإمارات
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {list.slice(0, Math.min(6, list.length)).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`انتقال إلى المنتج ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2.5 rounded-full transition-all",
                i === safeIndex
                  ? "w-10 bg-[#e1c254]"
                  : "w-2.5 bg-white/50 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
