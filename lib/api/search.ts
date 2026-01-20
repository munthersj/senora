import { api } from "./api";
import type { SearchResponse, Paginated, ProductDTO } from "@/lib/types/home";

export async function searchProducts(args: {
  search: string;
  category?: string;
  page?: number;
  per_page?: number;
}) {
  const { search, category, page = 1, per_page = 15 } = args;

  const body: Record<string, any> = { search };
  if (category) body.category = category;

  const res = await api.post<SearchResponse>("/search", body, {
    params: { page, per_page },
    headers: { Accept: "application/json" },
  });

  // ✅ رجّع الشكل اللي باقي الكود متوقعه: Paginated<ProductDTO>
  return res.data.products;
}
