import { api } from "./api";

export type CategoryDTO = {
  id: string;
  name: string;
  is_active: number;
  image: string | null;
  created_at: string;
  updated_at: string;
};

export type LaravelMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type LaravelPaginated<T> = {
  data: T[];
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
  meta?: LaravelMeta;
};

/** GET /api/categories?page=1 */
export async function getCategoriesPage(page = 1) {
  const res = await api.get<LaravelPaginated<CategoryDTO>>(
    `/categories?page=${page}`
  );
  return res.data;
}

/**
 * يجلب كل الأصناف عبر كل الصفحات (إذا كان last_page > 1)
 * + يرجّع فقط الفعّالة is_active=1
 */
export async function getAllActiveCategories() {
  const first = await getCategoriesPage(1);
  const all: CategoryDTO[] = [...(first.data ?? [])];

  const lastPage = first.meta?.last_page ?? 1;
  for (let p = 2; p <= lastPage; p++) {
    const pageRes = await getCategoriesPage(p);
    all.push(...(pageRes.data ?? []));
  }

  return all.filter((c) => c.is_active === 1);
}
