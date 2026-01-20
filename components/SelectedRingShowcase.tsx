"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ProductDTO } from "@/lib/types/home";
import type { Product } from "@/lib/products";

import { cn } from "@/lib/cn";
import { Badge, PrimaryButton, SecondaryButton } from "@/components/ui";

function priceLabel(p: Product) {
  return `${p.price} ${p.currency}`;
}
function toUIProduct(dto: ProductDTO): Product {
  return {
    id: dto.id,
    name: dto.name,
    price: dto.price,
    currency: "USD", // أو "AED" حسب مشروعك
    description: dto.description ?? "",
    images:
      dto.images && dto.images.length > 0
        ? dto.images
        : ["/products/dress-2.svg"],
    category: "فساتين", // قيمة افتراضية (UI قد لا يستخدمها هنا)
    tags: dto.colors?.length ? dto.colors.slice(0, 6) : ["رائج الآن"], // بدل tags
    details: [
      { label: "الطلبات", value: String(dto.orders_count ?? 0) },
      { label: "الزيارات", value: String(dto.visitor ?? 0) },
      {
        label: "مقاسات",
        value: dto.sizes?.length ? dto.sizes.join(", ") : "-",
      },
    ],
    options: {
      sizes: dto.sizes?.map(String) ?? [],
      colors: dto.colors?.map((name) => ({ name })) ?? [],
    },
    topSeller: false,
    trending: true,
  };
}

export default function SelectedRingShowcase({
  products,
  className,
}: {
  products: ProductDTO[]; // ✅ من الباك
  className?: string;
}) {
  const items = useMemo(
    () => products.slice(0, 8).map(toUIProduct),
    [products]
  );

  const n = items.length;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [bump, setBump] = useState(0);

  // اكتشاف الجوال لتخفيف العمق والمسافات (أداء أفضل)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // تبديل تلقائي خفيف (اختياري) + إيقاف عند hover
  useEffect(() => {
    if (paused || n <= 1) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % n);
      setBump((b) => b + 1);
    }, 5200);
    return () => window.clearInterval(id);
  }, [paused, n]);

  // إعادة تشغيل حركة "نزول/طلوع" عند كل تبديل (بدون إعادة mount للكارد)
  useEffect(() => setBump((b) => b + 1), [active]);

  const clampIndex = (i: number, len: number) => ((i % len) + len) % len;

  const goTo = (idx: number) => {
    if (n <= 0) return;
    setActive(clampIndex(idx, n));
  };

  const prev = () => goTo(active - 1);
  const next = () => goTo(active + 1);

  const p = items[active];

  return (
    <section className={cn("relative", className)} aria-label="منتجات مختارة">
      {/* خلفية فخمة لهذا القسم */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[40px]">
        <div className="absolute inset-0 bg-gradient-to-br from-brandGold/12 via-white to-brandGold/8" />
        <div className="absolute -right-20 -top-20 h-[260px] w-[260px] rounded-full bg-brandGold/14 blur-2xl md:-right-24 md:-top-24 md:h-[360px] md:w-[360px] md:bg-brandGold/18 md:blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-[260px] w-[260px] rounded-full bg-brandGreen/8 blur-2xl md:-left-24 md:-bottom-24 md:h-[360px] md:w-[360px] md:bg-brandGreen/10 md:blur-3xl" />
      </div>

      <div className="grid gap-10 rounded-[40px] border border-black/5 p-5 shadow-soft md:grid-cols-2 md:gap-16 md:p-10 lg:gap-24">
        {/* الحلقة (يمين على الديسكتوب) */}
        <div
          className="relative mx-auto h-[300px] w-full max-w-[680px] sm:h-[360px] lg:h-[420px] overflow-hidden isolate"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Coverflow 3D (نفس شكل الصورة) */}
          <div className="relative h-full w-full">
            {items.map((item, i) => {
              if (n <= 0) return null;
              // فرق دائري (يسار/يمين) بحيث أقرب مسار
              let d = (((i - active) % n) + n) % n;
              if (d > n / 2) d -= n;
              const ad = Math.abs(d);
              // ✅ على الجوال والأجهزة الأضعف: ارسم فقط 3 كاردات (يسار/وسط/يمين)
              if (ad > 1) return null;

              // صور فقط: مربعة تقريباً (مريحة على الجوال)
              const cardW = isMobile ? 220 : 270;
              const cardH = isMobile ? 290 : 360;

              // زيادة المسافة حتى لا تقترب الكاردات من النص
              const xStep = isMobile ? 190 : 255;

              const x = d * xStep;
              const scale = d === 0 ? 1 : ad === 1 ? 0.92 : 0.84;
              const ry = d * -18;
              // عمق أقل على الجوال (أداء أفضل)
              const tz = isMobile ? (d === 0 ? 35 : 12) : d === 0 ? 70 : 28;
              const baseY = d === 0 ? 0 : 10;

              const opacity = d === 0 ? 1 : ad === 1 ? 0.85 : 0.65;
              const zIndex = 50 - ad;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(i)}
                  className="ring-card focus:outline-none"
                  style={{
                    width: `${cardW}px`,
                    height: `${cardH}px`,
                    zIndex,
                    opacity,
                    transform: `translate(-50%, -50%) translateX(${x}px) translateY(${baseY}px) rotateY(${ry}deg) translateZ(${tz}px) scale(${scale})`,
                    transition:
                      "transform 820ms cubic-bezier(.2,.9,.2,1), opacity 700ms ease",
                    backfaceVisibility: "hidden",
                  }}
                  aria-label={`اختيار ${item.name}`}
                >
                  {/* ✅ الكارد: صورة فقط (التفاصيل مكتوبة بجانبها) */}
                  <div
                    className={cn(
                      "ring-card-inner relative h-full w-full overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-soft",
                      d === 0 ? "ring-1 ring-brandGold/35" : ""
                    )}
                    data-bump={d === 0 ? bump : undefined}
                    style={
                      d === 0
                        ? {
                            // إعادة تشغيل الأنيميشن بدون إعادة mount للصورة (أداء أفضل)
                            animation: `${
                              bump % 2 === 0 ? "cardBump" : "cardBump2"
                            } 820ms ease`,
                          }
                        : undefined
                    }
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-[28px]">
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 230px, 260px"
                        className="object-cover"
                        priority={d === 0}
                      />
                      {/* تظليل بسيط للفخامة بدون تكلفة كبيرة */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 text-[11px] font-extrabold text-white/80">
                        item #{String(i + 1).padStart(2, "0")}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* أزرار التنقل */}
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-2xl bg-white/85 px-3 py-3 text-lg font-black text-black/70 shadow-soft ring-1 ring-black/10 md:backdrop-blur transition hover:bg-white"
              aria-label="السابق"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-2xl bg-white/85 px-3 py-3 text-lg font-black text-black/70 shadow-soft ring-1 ring-black/10 md:backdrop-blur transition hover:bg-white"
              aria-label="التالي"
            >
              ›
            </button>

            {/* نقاط */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-2.5 w-2.5 rounded-full transition",
                    i === active
                      ? "w-10 bg-brandGold/70"
                      : "bg-black/15 hover:bg-black/25"
                  )}
                  aria-label={`اذهب إلى ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* التفاصيل (يسار على الديسكتوب) */}
        <div className="md:order-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-brandGreen ring-1 ring-black/5">
                منتجات مختارة
                <span className="text-black/30">•</span>
                لمسات فخمة
              </div>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-black/90 md:text-3xl">
                {p?.name}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-black/65 md:text-base"></p>
            </div>

            <div className="hidden md:block">
              <div className="rounded-2xl bg-brandGold/15 px-4 py-3 text-center ring-1 ring-brandGold/25">
                <div className="text-xs font-bold text-black/60">السعر</div>
                <div className="mt-1 text-lg font-extrabold text-brandGreen">
                  {p ? priceLabel(p) : ""}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {p?.tags?.slice(0, 4).map((t) => (
              <Badge key={t} variant="gold">
                {t}
              </Badge>
            ))}
          </div>

          <div className="mt-6 grid gap-3 rounded-[28px] border border-black/5 bg-white/70 p-5">
            {/* <div className="grid grid-cols-2 gap-3 text-sm">
              {p?.details?.slice(0, 4).map((d) => (
                <div
                  key={d.label}
                  className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/5"
                >
                  <div className="text-xs font-bold text-black/50">
                    {d.label}
                  </div>
                  <div className="mt-1 font-semibold text-black/80">
                    {d.value}
                  </div>
                </div>
              ))}
            </div> */}

            <div className="pt-2">
              <div className="flex flex-col gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-black/5 backdrop-blur sm:flex-row sm:items-center sm:justify-start">
                {p && (
                  <PrimaryButton
                    href={`/products/${p.id}`}
                    className="w-full sm:w-auto"
                  >
                    تفاصيل المنتج
                  </PrimaryButton>
                )}
                <SecondaryButton href="/products" className="w-full sm:w-auto">
                  عرض كل المنتجات
                </SecondaryButton>
              </div>
            </div>

            {p && (
              <div className="text-xs font-semibold text-black/55">
                أو اختر منتجًا آخر من الحلقة — التبديل سلس وممتع.
              </div>
            )}
          </div>

          {/* شريط سعر للجوال */}
          {p && (
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-brandGold/12 px-4 py-3 ring-1 ring-brandGold/25 md:hidden">
              <div className="text-sm font-bold text-black/70">السعر</div>
              <div className="text-base font-extrabold text-brandGreen">
                {priceLabel(p)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
