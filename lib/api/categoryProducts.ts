import { api } from "./api";

export type ProductDTO = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  custom_tailoring: number;
  visitor: number;
  orders_count: number;
  colors: string[];
  sizes: number[];
  images: string[];
  videos: string[];
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

/** GET /api/categories/:id/products?page=1 */
export async function getCategoryProductsPage(categoryId: string, page = 1) {
  const res = await api.get<LaravelPaginated<ProductDTO>>(
    `/categories/${encodeURIComponent(categoryId)}/products?page=${page}`
  );
  return res.data;
}
