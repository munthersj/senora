"use client";

import { useCallback, useMemo, useState } from "react";
import type { CartItem } from "./CartContext";
import {
  buildCartWhatsAppUrl,
  buildOrderPayload,
  parseUnavailableProductNames,
} from "./cartOrderHelpers";
import {
  createOrder,
  isOrderBadResponse,
  reorderByKey,
  type OrderBadResponse,
} from "@/lib/api/order";

export function useCartOrderFlow({
  items,
  currencyLabel,
  whatsappNumber,
  wholesaleAt,
  clearCart,
  removeByKeys,
}: {
  items: CartItem[];
  currencyLabel: string;
  whatsappNumber: string;
  wholesaleAt?: number;
  clearCart: () => void;
  // Optional: remove some items (لما نكمل بدون منتج)
  removeByKeys?: (keys: string[]) => void;
}) {
  const [placing, setPlacing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [bad, setBad] = useState<OrderBadResponse | null>(null);
  const [reordering, setReordering] = useState(false);

  const canOrder = items.length > 0 && !placing;

  const openWhatsApp = useCallback(
    (useItems: CartItem[]) => {
      const computedSubtotal = useItems.reduce((sum, it) => {
        const p = Number(String(it.price ?? "").replace(/[^\d.]/g, "")) || 0;
        return sum + p * (Number(it.qty) || 0);
      }, 0);

      const url = buildCartWhatsAppUrl({
        items: useItems,
        subtotal: computedSubtotal,
        currencyLabel,
        count: useItems.reduce((a, b) => a + (Number(b.qty) || 0), 0),
        whatsappNumber,
        wholesaleAt,
      });
      if (!url) return;
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [currencyLabel, whatsappNumber, wholesaleAt]
  );

  const placeOrder = useCallback(async () => {
    if (!items.length || placing) return;
    setPlacing(true);
    try {
      const payload = buildOrderPayload(items);
      await createOrder(payload);

      // ✅ نجاح: فرّغ السلة ثم افتح واتساب
      const snapshot = items;
      clearCart();
      openWhatsApp(snapshot);
    } catch (err) {
      if (isOrderBadResponse(err)) {
        setBad(err.response.data);
        setModalOpen(true);
      } else {
        console.error("Order failed", err);
        // fallback سريع
        alert("صار خطأ أثناء إرسال الطلب. حاول مرة ثانية.");
      }
    } finally {
      setPlacing(false);
    }
  }, [items, placing, clearCart, openWhatsApp]);

  const closeModal = useCallback(() => {
    if (reordering) return;
    setModalOpen(false);
  }, [reordering]);

  const continueWithoutUnavailable = useCallback(async () => {
    if (!bad?.key || reordering) return;
    setReordering(true);
    try {
      await reorderByKey(bad.key);

      // نحاول نحذف المنتجات غير المتاحة من النص (بالاسم) قبل رسالة واتساب
      const names = parseUnavailableProductNames(bad.products);
      const filtered = names.length
        ? items.filter((it) => !names.some((n) => it.name?.includes(n)))
        : items;

      // إذا بدك تمسحهم من السلة قبل التفريغ (اختياري)
      if (removeByKeys && names.length) {
        const keys = items
          .filter((it) => names.some((n) => it.name?.includes(n)))
          .map((x) => x.key);
        if (keys.length) removeByKeys(keys);
      }

      clearCart();
      openWhatsApp(filtered);
      setModalOpen(false);
    } catch (err) {
      console.error("Reorder failed", err);
      alert("صار خطأ أثناء متابعة الطلب. حاول مرة ثانية.");
    } finally {
      setReordering(false);
    }
  }, [bad, reordering, items, clearCart, openWhatsApp, removeByKeys]);

  const modalProps = useMemo(() => {
    return {
      open: modalOpen,
      message:
        bad?.message ||
        "خطأ في الطلب, المنتجات المذكورة غير متاحة حاليا هل تود الطلب بدونها",
      productsText: bad?.products,
      loading: reordering,
      onClose: closeModal,
      onContinue: continueWithoutUnavailable,
    };
  }, [modalOpen, bad, reordering, closeModal, continueWithoutUnavailable]);

  return {
    canOrder,
    placing,
    placeOrder,
    modalProps,
  };
}
