import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://senora-boutique.com";

  // نجيب المنتجات من الباك
  const res = await fetch("https://api.senora-boutique.com/api/products");
  const data = await res.json();

  // نفترض الباك يرجع Array
  const products = data.data || [];

  const productUrls = products.map((product: any) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      priority: 0.9,
    },
    ...productUrls,
  ];
}
