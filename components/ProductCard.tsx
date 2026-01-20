import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui";
import type { Product } from "@/lib/products";
const FALLBACK = "/products/abaya-1.svg";

export default function ProductCard({ product }: { product: Product }) {
  const img =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : "";

  const src = img ? img : FALLBACK;

  return (
    <Link
      href={`/products/${encodeURIComponent(product.id)}`}
      className="
        group block h-full overflow-hidden rounded-2xl
        border border-black/5 bg-white/85 md:backdrop-blur
        shadow-soft transition-transform duration-300
        md:hover:-translate-y-1 md:hover:shadow-xl
      "
    >
      {/* ✅ Image wrapper لازم يكون rounded + overflow-hidden حتى ما تبين حواف مربعة بالأنميشن */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-2xl bg-black/5">
        <Image
          src={src}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 70vw, 260px"
          className="
            object-cover
            transition-transform duration-700 ease-out
            will-change-transform
            md:group-hover:scale-[1.08]
          "
        />

        {/* ✅ Luxury overlay خفيف */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent opacity-70" />

        {/* ✅ Shine خفيف فاخر عند hover */}
        <div
          className="
            pointer-events-none absolute -left-1/2 top-0 h-full w-1/2
            bg-gradient-to-r from-transparent via-white/25 to-transparent
            opacity-0 md:group-hover:opacity-100
            transition-opacity duration-500
            rotate-12
          "
        />

        {/* ✅ Badges يمين للـ RTL */}
        <div className="absolute right-3 top-3 z-10 flex flex-wrap gap-2">
          {product.topSeller && <Badge variant="gold">الأكثر مبيعاً</Badge>}
          {product.trending && <Badge>رائج</Badge>}
        </div>
      </div>

      {/* ✅ Content ثابت الارتفاع قدر الإمكان */}
      <div className="flex flex-col gap-2 p-4 text-right">
        {/* الاسم ثابت سطر واحد */}
        <div className="text-sm font-semibold text-black/80 line-clamp-1">
          {product.name}
        </div>

        {/* التصنيف */}
        <div className="text-xs text-black/50 line-clamp-1">
          {product.category}
        </div>

        {/* السعر */}
        <div className="mt-1 flex items-baseline justify-between">
          <div className="text-base font-bold text-brandGreen">
            {product.price} {product.currency ?? "USD"}
          </div>
          {/* <div className="text-[11px] text-black/40">#{product.id}</div> */}
        </div>

        {/* tags: حافظ على مساحة ثابتة حتى ما تتفاوت الكروت */}
        <div className="mt-2 flex min-h-[28px] flex-wrap gap-2">
          {(product.tags ?? []).slice(0, 2).map((t) => (
            <span
              key={t}
              className="
                rounded-full bg-black/5 px-2.5 py-1
                text-xs text-black/60
                transition-colors duration-300
                group-hover:bg-[#e1c254]/20
              "
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
