export type Paginated<T> = {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links?: {
    next?: string | null;
    prev?: string | null;
  };
};

export function isPaginated<T>(v: unknown): v is Paginated<T> {
  return (
    !!v &&
    typeof v === "object" &&
    Array.isArray((v as any).data) &&
    (v as any).meta &&
    typeof (v as any).meta === "object"
  );
}

export function normalizePaginated<T>(v: unknown): { items: T[]; meta?: Paginated<T>["meta"] } {
  if (isPaginated<T>(v)) return { items: v.data, meta: v.meta };
  if (Array.isArray(v)) return { items: v as T[], meta: undefined };
  return { items: [], meta: undefined };
}
