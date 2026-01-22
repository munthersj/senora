import type { ProductDTO, CategoryDTO, Paginated } from "@/lib/types/home";
import { serverGetJSON } from "./serverFetch";

/**
 * Server-side (ISR) versions of product/category endpoints.
 * Keep axios versions for client-side interactions (token/localStorage).
 */

export async function fetchProductsPageServer(
  params?: { page?: number; per_page?: number; q?: string },
  revalidateSeconds = 60
) {
  const page = params?.page ?? 1;
  const per_page = params?.per_page ?? 15;
  const q = (params?.q ?? "").trim();

  return serverGetJSON<Paginated<ProductDTO>>("/products", {
    params: {
      page,
      per_page,
      ...(q ? { q } : {}),
    },
    revalidate: revalidateSeconds,
    tags: ["products"],
    
  });
}

export async function fetchCategoriesServer(revalidateSeconds = 3600) {
  const res = await serverGetJSON<{ data: CategoryDTO[] }>("/categories", {
    revalidate: revalidateSeconds,
    tags: ["categories"],
  });
  return res.data;
}

export async function fetchProductByIdServer(
  id: string,
  
) {
  const res = await serverGetJSON<{ data: ProductDTO }>(
    `/products/${encodeURIComponent(id)}`,
    {
       init: { cache: "no-store" },
     
    }
  );
  console.log(res.data)
  return res.data;
}
