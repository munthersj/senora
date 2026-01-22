import type { HomeResponse } from "@/lib/types/home";
import { serverGetJSON } from "./serverFetch";

export type HomeParams = {
  latest_page?: number;
  popular_page?: number;
  ordered_page?: number;
  per_page?: number;
};

/**
 * Server fetch for Home (ISR friendly).
 * Note: we keep the same endpoint as fetchHome() but use Next fetch caching.
 */
export async function fetchHomeServer(
  params: HomeParams = {},
  revalidateSeconds = 60
) {
  return serverGetJSON<HomeResponse>("/", {
    params,
    revalidate: revalidateSeconds,
    tags: ["home"],
  });
}
