import {CategoryDTO} from "@/lib/types/home";

export type ImageDTO = {
  id: number;
  url: string;
};
export type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  images: ImageDTO[]; // paths inside /public
  categories: CategoryDTO[];
  colors: string[];
  topSeller?: boolean;
  trending?: boolean;
  description: string;
  details: { label: string; value: string }[];
  options?: {
  sizes?: string[];
  // colors?: { name: string; hex?: string }[];
};

};

export const WHATSAPP_NUMBER = "+96349196001";

