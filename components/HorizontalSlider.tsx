"use client";

import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/products";

export default function HorizontalSlider() {
  return (
    <section className="relative overflow-hidden rounded-[40px] bg-white/40 ring-1 ring-black/5">
      <h2 className="mb-8 text-center text-2xl font-bold text-[#004439]">
        منتجات مختارة
      </h2>
      <p className="mx-auto mb-10 max-w-xl text-center text-sm text-[#0f3f3a]/70">
        مجموعة من القطع المميزة التي تجمع بين الأناقة اليومية والفخامة الهادئة،
        مختارة بعناية لتناسب جميع الأذواق.
      </p>

      <div className="group relative overflow-hidden">
        {/* تدرّج حواف لقصّ ناعم + فخامة */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white via-white/70 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white via-white/70 to-transparent" />

        {/* ✅ حركة تلقائية أنعم (CSS marquee موجودة بالـ globals.css) */}
        <div className="marquee flex w-max items-center gap-4 sm:gap-6 px-4">
          {[...products, ...products].map((p, i) => (
            <Link
              key={`${p.id}-${i}`}
              href={`/products/${p.id}`}
              className="relative shrink-0 overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-black/5 transition-transform duration-500 will-change-transform hover:scale-[1.06]"
            >
              {/* حجم أكبر + ارتفاع ثابت حتى ما يبين مقطوش من تحت */}
              <div className="relative h-[250px] w-[180px] sm:h-[290px] sm:w-[210px] md:h-[320px] md:w-[235px]">
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 180px, (max-width: 768px) 210px, 235px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-transparent" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
