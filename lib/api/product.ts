import { api } from "./api";
import type { ProductDTO, CategoryDTO, Paginated } from "@/lib/types/home";

/** ---------- Product Details ---------- */
export type SingleProductResponse = {
  data: ProductDTO;
};

export async function fetchProductById(id: string) {
  const res = await api.get<SingleProductResponse>(
    `/products/${encodeURIComponent(id)}`
  );
  return res.data.data;
}

/** ---------- Products Listing (Paginated) ---------- */
export async function fetchProductsPage(params?: {
  page?: number;
  per_page?: number;
  q?: string;
}) {
  const page = params?.page ?? 1;
  const per_page = params?.per_page ?? 15;
  const q = (params?.q ?? "").trim();

  const res = await api.get<Paginated<ProductDTO>>(`/products`, {
    params: {
      page,
      per_page,
      ...(q ? { q } : {}),
    },
  });

  return res.data;
}

/** ---------- Categories (for tabs) ---------- */
export async function fetchCategories() {
  // حسب الريسبونس يلي بعتو: { data: CategoryDTO[] }
  const res = await api.get<{ data: CategoryDTO[] }>(`/categories`);
  return res.data.data;
}

/** ---------- Category Products (Paginated) ---------- */
export async function fetchCategoryProductsPage(
  categoryId: string,
  params?: { page?: number; per_page?: number; q?: string }
) {
  const page = params?.page ?? 1;
  const per_page = params?.per_page ?? 15;
  const q = (params?.q ?? "").trim();

  const res = await api.get<Paginated<ProductDTO>>(
    `/categories/${encodeURIComponent(categoryId)}/products`,
    {
      params: {
        page,
        per_page,
        ...(q ? { q } : {}),
      },
    }
  );
console.log(res)
  return res.data;
}
