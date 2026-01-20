import { serverGetJSON } from "@/lib/api/serverFetch";

export type ShopSettings = {
  whatsapp: string;
  facebook: string;
  instagram: string;
  contact_us_email: string;
  wholesale_at: number;
};

export const DEFAULT_SETTINGS: ShopSettings = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "963900000000",
  facebook: "",
  instagram: "",
  contact_us_email: "",
  wholesale_at: 100,
};

/**
 * GET /settings
 * Cached with ISR so it won't be fetched on every request.
 */
export async function fetchSettingsServer(): Promise<ShopSettings> {
  try {
    const dto = await serverGetJSON<Partial<ShopSettings>>("/settings", {
      revalidate: 3600,
      tags: ["settings"],
    });

    return {
      ...DEFAULT_SETTINGS,
      ...dto,
      wholesale_at:
        typeof dto.wholesale_at === "number"
          ? dto.wholesale_at
          : DEFAULT_SETTINGS.wholesale_at,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
