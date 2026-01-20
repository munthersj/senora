"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";
import ProductRowSlider from "@/components/ProductRowSlider";

import type {
  Paginated,
  CategoryWithProductsDTO,
  ProductDTO,
} from "@/lib/types/home";

type Props = {
  categories: Paginated<CategoryWithProductsDTO>;
  className?: string;
  perPage?: number; // فقط للنداء لما نغير صفحة
};

type Tab = { id: string; name: string };

export default function ProductSliderCat({
  categories,
  className,
  perPage = 12,
}: Props) {
  // ======= UI Tabs =======
  const tabs: Tab[] = useMemo(() => {
    const list = categories?.data ?? [];
    return [
      { id: "all", name: "الكل" },
      ...list.map((c) => ({ id: c.id, name: c.name })),
    ];
  }, [categories]);

  const [activeId, setActiveId] = useState<string>(tabs[0]?.id ?? "all");

  // ======= Local state for pagination + fetched pages =======
  const [page, setPage] = useState<number>(
    Number(categories?.meta?.current_page ?? 1)
  );
  const [lastPage, setLastPage] = useState<number>(
    Number(categories?.meta?.last_page ?? 1)
  );
  const [loading, setLoading] = useState<boolean>(false);

  // هون نخزن الداتا اللي رح نعرضها (قائمة الكاتيجوري مع منتجاتها)
  const [data, setData] = useState<CategoryWithProductsDTO[]>(
    categories?.data ?? []
  );

  // Sync initial when parent changes
  useEffect(() => {
    setData(categories?.data ?? []);
    setPage(Number(categories?.meta?.current_page ?? 1));
    setLastPage(Number(categories?.meta?.last_page ?? 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    categories?.meta?.current_page,
    categories?.meta?.last_page,
    categories?.data?.length,
  ]);

  // إذا تغيّر tabs (من السيرفر) رجّع activeId لو صار مش موجود
  useEffect(() => {
    setActiveId((prev) => (tabs.some((t) => t.id === prev) ? prev : "all"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.length]);

  // ======= Helpers =======
  const activeCategory = useMemo(() => {
    if (activeId === "all") return null;
    return (data ?? []).find((c) => c.id === activeId) ?? null;
  }, [activeId, data]);

  const visibleProducts: ProductDTO[] = useMemo(() => {
    // "الكل": بنجمع منتجات كل الكاتيجوري (ممكن تصير كبيرة، بس بالهوم عادة محدودة)
    if (activeId === "all") {
      const all = (data ?? []).flatMap((c) => c.products ?? []);
      return all;
    }
    return activeCategory?.products ?? [];
  }, [activeId, data, activeCategory]);

  // ======= Pagination fetch (same /api endpoint) =======
  async function fetchCategorySection(nextPage: number) {
    setLoading(true);
    try {
      const base =
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";
      // الريسبونس تبع الهوم هو /api مع page/per_page
      const res = await fetch(`${base}?page=${nextPage}&per_page=${perPage}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch categories page");
      const json = await res.json();

      // لازم يكون عنده category_with_its_product بشكل Paginated
      const paginated: Paginated<CategoryWithProductsDTO> =
        json?.category_with_its_product;

      setData(paginated?.data ?? []);
      setPage(Number(paginated?.meta?.current_page ?? nextPage));
      setLastPage(Number(paginated?.meta?.last_page ?? lastPage));
    } catch (e) {
      // لا تعمل crash
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const canPrev = page > 1 && !loading;
  const canNext = page < lastPage && !loading;

  // أزرار الصفحات (شكل لطيف وما يطوّل)
  const pageButtons = useMemo(() => {
    const total = lastPage;
    const current = page;

    if (total <= 1) return [];

    const result: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    for (let i = start; i <= end; i++) result.push(i);

    // تأكد يظهر 1 وآخر صفحة لما يكون بعيد
    if (result[0] !== 1) result.unshift(1);
    if (result[result.length - 1] !== total) result.push(total);

    // remove duplicates
    return Array.from(new Set(result));
  }, [page, lastPage]);

  return (
    <section className={cn("space-y-2", className)}>
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => {
          const isActive = t.id === activeId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-brandGold text-brandGreen"
                  : "border border-black/10 bg-white text-black/70 hover:border-brandGreen/30 hover:text-brandGreen"
              )}
            >
              {t.name}
            </button>
          );
        })}

        <Link
          href={
            activeId === "all"
              ? "/products"
              : `/products?cat=${encodeURIComponent(activeId)}`
          }
          className="ms-auto rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/70 transition hover:border-brandGreen/30 hover:text-brandGreen"
        >
          عرض الكل
        </Link>
      </div>

      {/* Slider */}
      <div className="relative">
        {/* Loading overlay لطيف بدون تخريب UI */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm">
            <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/60">
              جارِ التحميل...
            </div>
          </div>
        )}

        <ProductRowSlider products={visibleProducts ?? []} />
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => fetchCategorySection(page - 1)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              canPrev
                ? "border border-black/10 bg-white text-black/70 hover:border-brandGreen/30 hover:text-brandGreen"
                : "bg-black/5 text-black/30"
            )}
          >
            السابق
          </button>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {pageButtons.map((p, idx) => {
              // نقاط بين الصفحات لما يصير قفز
              const prev = pageButtons[idx - 1];
              const gap = prev && p - prev > 1;

              return (
                <div key={p} className="flex items-center gap-2">
                  {gap && <span className="px-1 text-black/40">…</span>}
                  <button
                    type="button"
                    onClick={() => fetchCategorySection(p)}
                    disabled={loading}
                    className={cn(
                      "min-w-[40px] rounded-full px-3 py-2 text-sm font-semibold transition",
                      p === page
                        ? "bg-brandGreen text-white"
                        : "border border-black/10 bg-white text-black/70 hover:border-brandGreen/30 hover:text-brandGreen"
                    )}
                  >
                    {p}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!canNext}
            onClick={() => fetchCategorySection(page + 1)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              canNext
                ? "border border-black/10 bg-white text-black/70 hover:border-brandGreen/30 hover:text-brandGreen"
                : "bg-black/5 text-black/30"
            )}
          >
            التالي
          </button>
        </div>
      )}
    </section>
  );
}
