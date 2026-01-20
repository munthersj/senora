import axios from "axios";
import { api } from "./api";

export type OrderLine = {
  product_id: string;
  count: number;
};

export type OrderPayload = {
  data: OrderLine[];
};

export type OrderOkResponse = {
  message: string;
};

// الريسبونس المتوقع عند 400
export type OrderBadResponse = {
  message: string;
  products: string; // اسم/أسماء المنتجات غير المتاحة
  key: string;
};

export async function createOrder(payload: OrderPayload) {
  const res = await api.post<OrderOkResponse>("/order", payload);
  return res.data;
}

export async function reorderByKey(key: string) {
  const res = await api.post<OrderOkResponse>("/order/reorder", { key });
  return res.data;
}

export function isOrderBadResponse(err: unknown): err is {
  response: { status: number; data: OrderBadResponse };
} {
  return (
    axios.isAxiosError(err) &&
    !!err.response &&
    err.response.status === 400 &&
    typeof (err.response.data as any)?.key === "string"
  );
}
