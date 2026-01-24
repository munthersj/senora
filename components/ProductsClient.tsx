"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/Container";
import ProductGrid from "@/components/ProductGrid";
import ProductsSearchForm from "@/components/ProductsSearchForm";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";

import type { Paginated, ProductDTO, CategoryDTO } from "@/lib/types/home";
import {
  fetchCategoryProductsPage,
  fetchProductsPage,
} from "@/lib/api/product";
import { searchProducts } from "@/lib/api/search";

type CategoryTab = { id: string; name: string; image?: string | null };

type Mode =
  | { kind: "all" }
  | { kind: "category"; categoryId: string }
  | { kind: "search"; q: string; categoryId?: string };

export default function ProductsClient({
  initial,
  categories,
  perPage = 15,
}: {
  initial: Paginated<ProductDTO>;
  categories: CategoryDTO[]; // Updated to expect full DTO with images
  perPage?: number;
}) {
  // ======= UI Tabs =======
  const tabs: CategoryTab[] = useMemo(
    () => [
      {
        id: "all",
        name: "الكل",
        image:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
      },
      ...categories.map((c) => ({ id: c.id, name: c.name, image: c.image })),
    ],
    [categories]
  );

  const [activeCatId, setActiveCatId] = useState<string>("all");

  const [items, setItems] = useState<ProductDTO[]>(initial.data ?? []);
  const [meta, setMeta] = useState(initial.meta);

  const [mode, setMode] = useState<Mode>({ kind: "all" });
  const [loading, setLoading] = useState(false);

  // ======= Slider State =======
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // ======= Check scroll position (RTL Fixed) =======
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollLeftVal = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    // التحقق من اتجاه الصفحة (RTL / LTR)
    const isRTL = window.getComputedStyle(container).direction === "rtl";

    if (isRTL) {
      // التعامل مع RTL
      if (scrollLeftVal <= 0) {
        const absLeft = Math.abs(scrollLeftVal);
        setCanScrollLeft(absLeft < maxScroll - 10);
        setCanScrollRight(absLeft > 10);
      } else {
        setCanScrollLeft(scrollLeftVal > 10);
        setCanScrollRight(scrollLeftVal < maxScroll - 10);
      }
    } else {
      // LTR Standard
      setCanScrollLeft(scrollLeftVal > 10);
      setCanScrollRight(scrollLeftVal < maxScroll - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const timer = setTimeout(() => {
      checkScroll();
    }, 100);

    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      clearTimeout(timer);
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [tabs]);

  // ======= Scroll functions =======
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: 400, behavior: "smooth" });
  };


  async function loadPage(page: number, nextMode: Mode = mode) {
    setLoading(true);
    try {
      let res: Paginated<ProductDTO>;

      if (nextMode.kind === "all") {
        res = await fetchProductsPage({ page, per_page: perPage });
      } else if (nextMode.kind === "category") {
        res = await fetchCategoryProductsPage(nextMode.categoryId, {
          page,
          per_page: perPage,
        });
      } else {
        // search
        res = await searchProducts({
          search: nextMode.q,
          category: nextMode.categoryId,
          page,
          per_page: perPage,
        });
      }

      setItems(res.data ?? []);
      setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  }

  async function handleTabChange(id: string) {
    setActiveCatId(id);

    // إذا ما في بحث شغال: فلترة عالكاتيغوري / الكل
    const nextMode: Mode =
      id === "all" ? { kind: "all" } : { kind: "category", categoryId: id };

    setMode(nextMode);
    await loadPage(1, nextMode);
  }

  async function handleSearch(q: string, categoryId?: string) {
    // ✅ q جاي already trimmed من الفورم
    const nextMode: Mode = { kind: "search", q, categoryId };
    setMode(nextMode);
    await loadPage(1, nextMode);
  }

  const page = Number(meta?.current_page ?? 1);
  const lastPage = Number(meta?.last_page ?? 1);

  const canPrev = page > 1 && !loading;
  const canNext = page < lastPage && !loading;

  const noResults = !loading && (items?.length ?? 0) === 0;

  useEffect(() => {
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <Container className="py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black/90">المنتجات</h1>
          <p className="mt-2 text-black/60">
            تصفّح المنتجات ثم اضغط{" "}
            <span className="font-semibold">شراء عبر واتساب</span> لإتمام الطلب.
          </p>
        </div>

        <ProductsSearchForm
          defaultValue=""
          activeCategoryId={activeCatId}
          loading={loading}
          onSearch={handleSearch}
        />
      </div>

      {/* Categories Slider */}
      <div className="mt-8 relative group">
        {/* زر اليسار */}
        <button
          type="button"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white border-2 shadow-xl flex items-center justify-center transition-all duration-300",
            canScrollLeft
              ? "border-brandGreen/30 text-brandGreen hover:bg-brandGreen hover:text-white hover:scale-110 opacity-100 visible"
              : "border-gray-200 text-gray-300 opacity-0 invisible"
          )}
          aria-label="سكرول لليسار"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        {/* زر اليمين */}
        <button
          type="button"
          onClick={scrollRight}
          disabled={!canScrollRight}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white border-2 shadow-xl flex items-center justify-center transition-all duration-300",
            canScrollRight
              ? "border-brandGreen/30 text-brandGreen hover:bg-brandGreen hover:text-white hover:scale-110 opacity-100 visible"
              : "border-gray-200 text-gray-300 opacity-0 invisible"
          )}
          aria-label="سكرول لليمين"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        {/* Fade Gradients */}
        {/* Fade Gradients Removed as per user request */}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {tabs.map((t) => {
            const isActive = t.id === activeCatId;
            const hasImage = t.image;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTabChange(t.id)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl transition-all duration-300 flex-shrink-0",
                  isActive
                    ? "ring-4 ring-brandGreen shadow-xl scale-105"
                    : "hover:scale-105 hover:shadow-lg"
                )}
              >
                {/* الصورة - نسبة 4:3 */}
                <div className="relative w-[150px] h-[110px] md:w-[180px] md:h-[135px]">
                  {hasImage ? (
                    <>
                      <img
                        src={t.image!}
                        alt={t.name}
                        className={cn(
                          "h-full w-full",
                          t.image?.toLowerCase().endsWith(".svg")
                            ? "object-contain p-4"
                            : "object-cover"
                        )}
                      />
                      {/* Overlay */}
                      <div
                        className={cn(
                          "absolute inset-0 transition-all duration-300",
                          isActive
                            ? "bg-gradient-to-t from-brandGreen/90 via-brandGreen/50 to-transparent"
                            : "bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-brandGreen/80 group-hover:via-brandGreen/40"
                        )}
                      />
                    </>
                  ) : (
                    <div
                      className={cn(
                        "h-full w-full transition-all",
                        isActive
                          ? "bg-gradient-to-br from-brandGold to-brandGold/80"
                          : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-brandGreen/20 group-hover:to-brandGreen/10"
                      )}
                    />
                  )}

                  {/* النص */}
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <h3
                      className={cn(
                        "text-center text-sm font-bold transition-all line-clamp-2",
                        hasImage || isActive
                          ? "text-white drop-shadow-lg"
                          : "text-gray-700 group-hover:text-brandGreen"
                      )}
                    >
                      {t.name}
                    </h3>
                  </div>

                  {/* مؤشر النشاط */}
                  {isActive && (
                    <div className="absolute top-2 right-2 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-white shadow-lg animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Badge */}
      <div className="mt-4 flex justify-end">
        <Badge variant="gold">
          صفحة {page} / {lastPage}
        </Badge>
      </div>

      {/* Grid */}
      <div className="mt-6">
        <ProductGrid products={(items ?? []) as any} />
      </div>

      {/* Empty */}
      {noResults && (
        <div className="mt-10 rounded-3xl border border-black/5 bg-white p-8 text-center text-black/60">
          لم يتم العثور على هذا المنتج.
        </div>
      )}

      {/* Pagination (arrows) */}
      {lastPage > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={!canPrev}
            onClick={async () => {
              await loadPage(page - 1);
              document.getElementById("products-top")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className={cn(
              "rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold transition",
              canPrev
                ? "hover:border-brandGreen/30 hover:text-brandGreen"
                : "opacity-50 cursor-not-allowed",
            )}
          >
            ← السابق
          </button>

          <span className="text-sm text-black/60">
            {page} / {lastPage}
          </span>

          <button
            type="button"
            disabled={!canNext}
            onClick={async () => {
              await loadPage(page + 1);
              document.getElementById("products-top")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className={cn(
              "rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold transition",
              canNext
                ? "hover:border-brandGreen/30 hover:text-brandGreen"
                : "opacity-50 cursor-not-allowed",
            )}
          >
            التالي →
          </button>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Container>
  );
}
