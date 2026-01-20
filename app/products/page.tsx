import ProductsClient from "@/components/ProductsClient";
import {
  fetchProductsPageServer,
  fetchCategoriesServer,
} from "@/lib/api/product.server";
import { buildKeywords } from "@/lib/seo/keywords";

export async function generateMetadata() {
  const siteName = "سينيورة";
  const categories = await fetchCategoriesServer();
  const keywords = buildKeywords({
    siteName,
    city: "دمشق",
    area: "الميدان",
    categories,
    limit: 1000,
  });

  return {
    title: "المنتجات",
    description:
      "تصفّح فساتين السهرة والأقمشة وملابس السهرة في دمشق (الميدان). تفصيل حسب الطلب وبيع جملة ومفرق.",
    keywords,
    openGraph: {
      title: "المنتجات | سينيورة",
      description:
        "تصفّح فساتين السهرة والأقمشة وملابس السهرة في دمشق (الميدان). تفصيل حسب الطلب وبيع جملة ومفرق.",
    },
  };
}

export default async function ProductsPage() {
  const initial = await fetchProductsPageServer({ page: 1, per_page: 15 });
  const categories = await fetchCategoriesServer();

  return (
    <div>
      {/* <div id="products-top" /> */}
      <ProductsClient initial={initial} categories={categories} perPage={15} />
    </div>
  );
}

// ISR: regenerate this page every 30 minutes
export const revalidate = 1800;
