/** تصنيف + منتجاته - للـ category_with_its_product */
export type CategoryWithProductsDTO = {
  id: string;
  name: string;
  is_active: 0 | 1;
  image: string | null;
  created_at: string;
  updated_at: string;
  products: ProductDTO[];
};

/** Pagination (Laravel) */
export type Paginated<T> = {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type HomeResponse = {
  latest_products: Paginated<ProductDTO>;
  most_popular_product: Paginated<ProductDTO>;
  most_ordered_product: Paginated<ProductDTO>;
  category_with_its_product: Paginated<CategoryWithProductsDTO>;
};

export type CategoryDTO = {
  id: string;
  name: string;
  is_active: 0 | 1;
  image: string | null;
  created_at: string;
  updated_at: string;
};
export type ImageDTO = {
  id: number;
  url: string;
};


export type ProductDTO = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  custom_tailoring: 0 | 1;
  visitor: number;
  orders_count: number;
  colors: string[];
  sizes: number[];
  images: ImageDTO[];       
  videos: string[];
  categories?: CategoryDTO[]; // ✅ جديد لأن search بيرجع categories داخل المنتج
};

export type SearchResponse = {
  products: Paginated<ProductDTO>;
};

