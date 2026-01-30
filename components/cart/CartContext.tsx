"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ShopSettings } from "@/lib/api/settings.server";

const STORAGE_KEY = "senora_cart_v1";

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  price?: string;
  image?: string;
  productUrl?: string;
  size?: string;
  color?: string;
  qty: number;
  note?: string;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  currencyLabel: string;
  settings: ShopSettings;
  /** True when the (current) cart count reaches wholesale threshold. */
  isWholesale: boolean;
  origin: { x: number; y: number } | null;
  setOrigin: React.Dispatch<
    React.SetStateAction<{ x: number; y: number } | null>
  >;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings: ShopSettings;
}) {
  // ✅ 1) أول render دايمًا فاضي (server + client)
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [settings] = useState<ShopSettings>(initialSettings);

  // ✅ 2) بعد mount فقط: نقرأ من localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // ✅ 3) نكتب على localStorage فقط بعد mount
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, mounted]);

  const value = useMemo<CartContextValue>(() => {
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    const addItem = (item: Omit<CartItem, "key">) => {
      const key = `${item.productId}|${item.size ?? ""}|${
        item.color ?? ""
      }`.toLowerCase();

      setItems((prev) => {
        const idx = prev.findIndex((x) => x.key === key);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], qty: copy[idx].qty + item.qty };
          return copy;
        }
        return [...prev, { ...item, key }];
      });

      setIsOpen(true);
    };

    const removeItem = (key: string) =>
      setItems((prev) => prev.filter((x) => x.key !== key));

    const setQty = (key: string, qty: number) =>
      setItems((prev) =>
        prev.map((x) => (x.key === key ? { ...x, qty: Math.max(1, qty) } : x)),
      );

    const clear = () => setItems([]);

    const count = items.reduce((a, b) => a + b.qty, 0);

    const wholesaleAt = Number(settings?.wholesale_at || 0);
    const isWholesale = wholesaleAt > 0 ? count >= wholesaleAt : false;

    const subtotal = items.reduce((sum, it) => {
      const p = Number(String(it.price ?? "").replace(/[^\d.]/g, "")) || 0;
      return sum + p * it.qty;
    }, 0);

    return {
      items,
      isOpen,
      open,
      close,
      addItem,
      removeItem,
      setQty,
      clear,
      count,
      subtotal,
      currencyLabel: "USD",
      settings,
      isWholesale,
      origin,
      setOrigin,
    };
  }, [items, isOpen, settings, origin]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
