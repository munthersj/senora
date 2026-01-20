"use client";

import { useMemo, useState, useRef } from "react";
import Container from "@/components/Container";
import ProductGrid from "@/components/ProductGrid";
import ProductsSearchForm from "@/components/ProductsSearchForm";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useEffect } from "react";

import type { Paginated, ProductDTO } from "@/lib/types/home";
import {
  fetchCategoryProductsPage,
  fetchProductsPage,
} from "@/lib/api/product";
import { searchProducts } from "@/lib/api/search";
type CategoryTab = { id: string; name: string };

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
  categories: CategoryTab[];
  perPage?: number;
}) {
  const tabs = useMemo(
    () => [{ id: "all", name: "الكل" }, ...categories],
    [categories],
  );

  const [activeCatId, setActiveCatId] = useState<string>("all");

  const [items, setItems] = useState<ProductDTO[]>(initial.data ?? []);
  const [meta, setMeta] = useState(initial.meta);

  const [mode, setMode] = useState<Mode>({ kind: "all" });
  const [loading, setLoading] = useState(false);

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

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const isActive = t.id === activeCatId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabChange(t.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-brandGold text-brandGreen"
                  : "border border-black/10 bg-white text-black/70 hover:border-brandGreen/30 hover:text-brandGreen",
              )}
            >
              {t.name}
            </button>
          );
        })}

        {/* badge على اليمين */}
        <div className="ms-auto flex items-center gap-2">
          <Badge variant="gold">
            صفحة {page} / {lastPage}
          </Badge>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-8">
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
    </Container>
  );
}
