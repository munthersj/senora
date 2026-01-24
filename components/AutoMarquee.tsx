"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";

const INTERVAL_MS = 6000;

export type ImageDTO = {
    id: number;
    url: string;
};

type LatestProduct = {
    id: string;
    name: string;
    price: number;
    currency?: string;
    images: ImageDTO[];
};

function getHeroImage(p?: { images?: ImageDTO[] }) {
    const first = p?.images?.[0];
    return first && first.url.length > 0 ? first.url : "/products/dress-1.svg";
}

type DotModel =
    | { type: "dot"; idx: number }
    | { type: "gap"; key: string };

function buildDotModel(total: number, active: number, maxVisible = 7): DotModel[] {
    if (total <= maxVisible) {
        return Array.from({ length: total }, (_, i) => ({ type: "dot", idx: i }));
    }

    // نعرض: [0] ... window ... ... [last]
    const last = total - 1;
    const middleCount = maxVisible - 2; // نحجز للأول والأخير
    const half = Math.floor(middleCount / 2);

    // نافذة حول الـ active لكن داخل (1..last-1)
    let start = active - half;
    let end = start + middleCount - 1;

    if (start < 1) {
        start = 1;
        end = start + middleCount - 1;
    }
    if (end > last - 1) {
        end = last - 1;
        start = end - middleCount + 1;
    }

    const out: DotModel[] = [{ type: "dot", idx: 0 }];

    if (start > 1) out.push({ type: "gap", key: "gap-left" });

    for (let i = start; i <= end; i++) out.push({ type: "dot", idx: i });

    if (end < last - 1) out.push({ type: "gap", key: "gap-right" });

    out.push({ type: "dot", idx: last });

    return out;
}

export default function AutoMarquee({
                                        className,
                                        items,
                                    }: {
    className?: string;
    items?: LatestProduct[];
}) {
    const list = useMemo(() => (items ?? []) as LatestProduct[], [items]);

    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    // لو تغيرت الليست ونقصت: تأكد ما يطلع index برا
    useEffect(() => {
        if (!list.length) return;
        setIndex((i) => Math.min(i, list.length - 1));
    }, [list.length]);

    const timerRef = useRef<number | null>(null);

    const clearTimer = useCallback(() => {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
    }, []);

    const next = useCallback(() => {
        if (!list.length) return;
        setIndex((i) => (i + 1) % list.length);
    }, [list.length]);

    const prev = useCallback(() => {
        if (!list.length) return;
        setIndex((i) => (i - 1 + list.length) % list.length);
    }, [list.length]);

    const startTimer = useCallback(() => {
        clearTimer();
        if (!list.length) return;
        timerRef.current = window.setInterval(() => {
            if (document.visibilityState !== "visible") return;
            next();
        }, INTERVAL_MS);
    }, [clearTimer, next, list.length]);

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

    // -----------------------------
    // ✅ Swipe (Mobile)
    // -----------------------------
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const touchLocked = useRef<"x" | "y" | null>(null);
    const swipeFired = useRef(false);

    const SWIPE_THRESHOLD = 35;

    const onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;
        const t = e.touches[0];
        touchStartX.current = t.clientX;
        touchStartY.current = t.clientY;
        touchLocked.current = null;
        swipeFired.current = false;
        setPaused(true);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const t = e.touches[0];

        const dx = t.clientX - touchStartX.current;
        const dy = t.clientY - touchStartY.current;

        if (!touchLocked.current) {
            touchLocked.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        }

        if (touchLocked.current === "x") {
            e.preventDefault();
        }

        if (
            touchLocked.current === "x" &&
            !swipeFired.current &&
            Math.abs(dx) >= SWIPE_THRESHOLD
        ) {
            swipeFired.current = true;

            // ✅ سحب يسار->يمين = prev
            // ✅ سحب يمين->يسار = next
            if (dx > 0) prev();
            else next();
        }
    };

    const onTouchEnd = () => {
        touchStartX.current = null;
        touchStartY.current = null;
        touchLocked.current = null;
        swipeFired.current = false;
        setPaused(false);
    };

    const safeIndex = list.length ? index % list.length : 0;
    const p = list[safeIndex];
    if (!p) return null;

    // ✅ Pagination ذكي (بدون شكل مزعج)
    const dots = useMemo(
        () => buildDotModel(list.length, safeIndex, 7),
        [list.length, safeIndex],
    );

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
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{ touchAction: "pan-y" }}
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
                                    priority
                                />
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(225,194,84,0.25),transparent_55%)]" />

                            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-[#004439]">
                                  <span className="h-2.5 w-2.5 rounded-full bg-[#e1c254]" />
                                 المضافة حديثاً
                                </span>


                            </div>

                            <div className="absolute bottom-0 w-full p-5 sm:p-8 lg:p-10">
                                <div className="max-w-2xl">
                                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                                        {p.name}
                                    </h2>

                                    <div className="mt-5 flex flex-wrap items-center gap-3">

                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>

                </div>

                {/* ✅ Pagination أنيق (7 عناصر + …) + عدّاد */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                  {/*  <div className="flex items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 backdrop-blur ring-1 ring-white/10">*/}
                  {/*      {dots.map((d) => {*/}
                  {/*          if (d.type === "gap") {*/}
                  {/*              return (*/}
                  {/*                  <span*/}
                  {/*                      key={d.key}*/}
                  {/*                      className="px-1 text-[12px] font-black text-white/70 select-none"*/}
                  {/*                      aria-hidden="true"*/}
                  {/*                  >*/}
                  {/*  …*/}
                  {/*</span>*/}
                  {/*              );*/}
                  {/*          }*/}

                  {/*          const i = d.idx;*/}
                  {/*          const isActive = i === safeIndex;*/}

                  {/*          return (*/}
                  {/*              <button*/}
                  {/*                  key={i}*/}
                  {/*                  type="button"*/}
                  {/*                  aria-label={`انتقال إلى المنتج ${i + 1}`}*/}
                  {/*                  onClick={(e) => {*/}
                  {/*                      e.preventDefault();*/}
                  {/*                      e.stopPropagation();*/}
                  {/*                      setIndex(i);*/}
                  {/*                  }}*/}
                  {/*                  className={cn(*/}
                  {/*                      "h-2.5 rounded-full transition-all",*/}
                  {/*                      isActive*/}
                  {/*                          ? "w-10 bg-[#e1c254]"*/}
                  {/*                          : "w-2.5 bg-white/50 hover:bg-white/70",*/}
                  {/*                  )}*/}
                  {/*              />*/}
                  {/*          );*/}
                  {/*      })}*/}
                  {/*  </div>*/}

                    <div className="text-[12px] font-bold text-white/80 drop-shadow">
                        {safeIndex + 1} / {list.length}
                    </div>
                </div>
            </div>
        </section>
    );
}
