import { api } from "./api";
import type { HomeResponse } from "@/lib/types/home";

type HomeParams = {
  latest_page?: number;
  popular_page?: number;
  ordered_page?: number;

  per_page?: number; // إذا الباك يدعمها
};

export async function fetchHome(params: HomeParams = {}) {
  const res = await api.get<HomeResponse>("/", { params });
  return res.data;
}
