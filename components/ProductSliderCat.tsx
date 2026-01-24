"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    perPage?: number;
};

type Tab = { id: string; name: string; image?: string | null };

export default function ProductSliderCat({
    categories,
    className,
    perPage = 12,
}: Props) {
    // ======= UI Tabs =======
    const tabs: Tab[] = useMemo(() => {
        const list = categories?.data ?? [];
        return [
            {
                id: "all",
                name: "الكل",
                image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
            },
            ...list.map((c) => ({ id: c.id, name: c.name, image: c.image })),
        ];
    }, [categories]);

    const [activeId, setActiveId] = useState<string>(tabs[0]?.id ?? "all");

    // ======= Slider State =======
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // ======= Local state for pagination + fetched pages =======
    const [page, setPage] = useState<number>(
        Number(categories?.meta?.current_page ?? 1)
    );
    const [lastPage, setLastPage] = useState<number>(
        Number(categories?.meta?.last_page ?? 1)
    );
    const [loading, setLoading] = useState<boolean>(false);

    const [data, setData] = useState<CategoryWithProductsDTO[]>(
        categories?.data ?? []
    );

    // Sync initial when parent changes
    useEffect(() => {
        setData(categories?.data ?? []);
        setPage(Number(categories?.meta?.current_page ?? 1));
        setLastPage(Number(categories?.meta?.last_page ?? 1));
    }, [
        categories?.meta?.current_page,
        categories?.meta?.last_page,
        categories?.data?.length,
    ]);

    // إذا تغيّر tabs (من السيرفر) رجّع activeId لو صار مش موجود
    useEffect(() => {
        setActiveId((prev) => (tabs.some((t) => t.id === prev) ? prev : "all"));
    }, [tabs.length]);

    // ======= Check scroll position =======
    const checkScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollLeftVal = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;

        // التحقق من اتجاه الصفحة (RTL / LTR)
        const isRTL = window.getComputedStyle(container).direction === "rtl";

        if (isRTL) {
            // التعامل مع RTL (في المتصفحات الحديثة تكون القيم سالبة أو صفر)
            if (scrollLeftVal <= 0) {
                const absLeft = Math.abs(scrollLeftVal);
                // زر اليسار (للأمام في RTL) يظهر إذا لم نصل للنهاية
                setCanScrollLeft(absLeft < maxScroll - 10);
                // زر اليمين (للخلف في RTL) يظهر إذا تحركنا من البداية
                setCanScrollRight(absLeft > 10);
            } else {
                // (احتياطي) بعض المتصفحات القديمة قد تستخدم قيم موجبة معكوسة
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

        container.scrollBy({
            left: -400,
            behavior: "smooth",
        });
    };

    const scrollRight = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        container.scrollBy({
            left: 400,
            behavior: "smooth",
        });
    };

    // ======= Helpers =======
    const activeCategory = useMemo(() => {
        if (activeId === "all") return null;
        return (data ?? []).find((c) => c.id === activeId) ?? null;
    }, [activeId, data]);

    const visibleProducts: ProductDTO[] = useMemo(() => {
        if (activeId === "all") {
            const all = (data ?? []).flatMap((c) => c.products ?? []);
            return all;
        }
        return activeCategory?.products ?? [];
    }, [activeId, data, activeCategory]);

    // ======= Pagination fetch =======
    async function fetchCategorySection(nextPage: number) {
        setLoading(true);
        try {
            const base =
                process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";
            const res = await fetch(`${base}?page=${nextPage}&per_page=${perPage}`, {
                cache: "no-store",
            });

            if (!res.ok) throw new Error("Failed to fetch categories page");
            const json = await res.json();

            const paginated: Paginated<CategoryWithProductsDTO> =
                json?.category_with_its_product;

            setData(paginated?.data ?? []);
            setPage(Number(paginated?.meta?.current_page ?? nextPage));
            setLastPage(Number(paginated?.meta?.last_page ?? lastPage));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const canPrev = page > 1 && !loading;
    const canNext = page < lastPage && !loading;

    const pageButtons = useMemo(() => {
        const total = lastPage;
        const current = page;

        if (total <= 1) return [];

        const result: number[] = [];
        const start = Math.max(1, current - 2);
        const end = Math.min(total, current + 2);

        for (let i = start; i <= end; i++) result.push(i);

        if (result[0] !== 1) result.unshift(1);
        if (result[result.length - 1] !== total) result.push(total);

        return Array.from(new Set(result));
    }, [page, lastPage]);

    return (
        <section className={cn("space-y-6", className)}>
            {/* Categories Slider - تصميم جديد مع سكرول */}
            <div className="relative group">
                {/* زر اليسار */}
                <button
                    type="button"
                    onClick={scrollLeft}
                    disabled={!canScrollLeft}
                    className={cn(
                        "absolute left-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white border-2 shadow-xl flex items-center justify-center transition-all duration-300",
                        canScrollLeft
                            ? "border-brandGreen/30 text-brandGreen hover:bg-brandGreen hover:text-white hover:scale-110 opacity-100 visible"
                            : "border-gray-200 text-gray-300 opacity-0 invisible"
                    )}
                    aria-label="سكرول لليسار"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>

                {/* زر اليمين */}
                <button
                    type="button"
                    onClick={scrollRight}
                    disabled={!canScrollRight}
                    className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white border-2 shadow-xl flex items-center justify-center transition-all duration-300",
                        canScrollRight
                            ? "border-brandGreen/30 text-brandGreen hover:bg-brandGreen hover:text-white hover:scale-110 opacity-100 visible"
                            : "border-gray-200 text-gray-300 opacity-0 invisible"
                    )}
                    aria-label="سكرول لليمين"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>

                {/* Fade Gradients */}
                {/* Fade Gradients Removed as per user request */}

                {/* Scrollable Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    {tabs.map((t) => {
                        const isActive = t.id === activeId;
                        const hasImage = t.image;

                        return (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setActiveId(t.id)}
                                className={cn(
                                    "group relative overflow-hidden rounded-2xl transition-all duration-300 flex-shrink-0",
                                    isActive
                                        ? "ring-4 ring-brandGreen shadow-xl scale-105"
                                        : "hover:scale-105 hover:shadow-lg"
                                )}
                            >
                                {/* الصورة - نسبة 4:3 */}
                                <div className="relative w-[180px] h-[135px]">
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
                                        <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-white shadow-lg animate-pulse" />
                                    )}
                                </div>
                            </button>
                        );
                    })}

                    {/* زر عرض الكل */}
                    <Link
                        href={
                            activeId === "all"
                                ? "/products"
                                : `/products?cat=${encodeURIComponent(activeId)}`
                        }
                        className="flex-shrink-0 flex items-center justify-center rounded-2xl border-2 border-brandGreen/20 bg-white px-8 text-base font-bold text-brandGreen transition-all hover:border-brandGreen hover:bg-brandGreen hover:text-white hover:shadow-lg w-[180px]"
                    >
                        <span className="text-center">
                            عرض الكل <br />←
                        </span>
                    </Link>
                </div>
            </div>

            {/* Products Slider */}
            <div className="relative">
                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-brandGreen border-t-transparent" />
                            <span className="text-base font-semibold text-brandGreen">
                                جارِ التحميل...
                            </span>
                        </div>
                    </div>
                )}

                <ProductRowSlider products={visibleProducts ?? []} />
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                        type="button"
                        disabled={!canPrev}
                        onClick={() => fetchCategorySection(page - 1)}
                        className={cn(
                            "rounded-xl px-5 py-2.5 text-sm font-semibold transition-all",
                            canPrev
                                ? "border-2 border-brandGreen/20 bg-white text-brandGreen hover:bg-brandGreen hover:text-white hover:shadow-md"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        ← السابق
                    </button>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {pageButtons.map((p, idx) => {
                            const prev = pageButtons[idx - 1];
                            const gap = prev && p - prev > 1;

                            return (
                                <div key={p} className="flex items-center gap-2">
                                    {gap && (
                                        <span className="px-1 text-lg font-bold text-gray-400">
                                            …
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => fetchCategorySection(p)}
                                        disabled={loading}
                                        className={cn(
                                            "min-w-[44px] rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
                                            p === page
                                                ? "bg-brandGreen text-white shadow-md scale-110"
                                                : "border-2 border-gray-200 bg-white text-gray-700 hover:border-brandGreen/30 hover:text-brandGreen hover:shadow-sm"
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
                            "rounded-xl px-5 py-2.5 text-sm font-semibold transition-all",
                            canNext
                                ? "border-2 border-brandGreen/20 bg-white text-brandGreen hover:bg-brandGreen hover:text-white hover:shadow-md"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
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
        </section>
    );
}