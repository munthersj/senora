"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/components/cart/CartContext";

import {
  createOrder,
  isOrderBadResponse,
  reorderByKey,
  type OrderBadResponse,
} from "@/lib/api/order";

type ProductOptionColor = { name: string; hex?: string };

export type ProductWithOptions = {
  id: string | number;
  name: string;
  price?: number | string;
  image?: string;
  slug?: string;
  options?: {
    sizes?: string[];
    colors?: ProductOptionColor[];
  };
};

function cleanPhoneNumber(input: string) {
  return (input || "").replace(/[^\d]/g, "");
}

function toAbsoluteUrl(siteUrl: string, maybeRelative?: string) {
  if (!maybeRelative) return "";
  if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
  const base = siteUrl?.replace(/\/+$/, "") || "";
  const rel = maybeRelative.startsWith("/")
    ? maybeRelative
    : `/${maybeRelative}`;
  return `${base}${rel}`;
}

function buildProductUrl(siteUrl: string, product: ProductWithOptions) {
  const base = siteUrl?.replace(/\/+$/, "") || "";
  if (product.slug) return `${base}/products/${product.slug}`;
  return `${base}/products/${product.id}`;
}

// بديل بسيط عن parseUnavailableProductNames
function parseUnavailableNames(text?: string) {
  if (!text) return [];
  return text
    .split(/[\n,،]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function WhatsAppOrderButton({
  product,
  whatsappNumber,
  siteUrl,
  absoluteImage,
  className = "",
  buttonText = "اطلب الآن",
}: {
  product: ProductWithOptions;
  whatsappNumber: string;
  siteUrl: string;
  absoluteImage?: string;
  className?: string;
  buttonText?: string;
}) {
  const { addItem, count, settings } = useCart();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ✅ نفس ستايتات useCartOrderFlow (لكن بدون cart)
  const [placing, setPlacing] = useState(false);
  const [badModalOpen, setBadModalOpen] = useState(false);
  const [bad, setBad] = useState<OrderBadResponse | null>(null);
  const [reordering, setReordering] = useState(false);

  const sizes = product?.options?.sizes ?? [];
  const colors = product?.options?.colors ?? [];
  const hasSizes = sizes.length > 0;
  const hasColors = colors.length > 0;

  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [note, setNote] = useState("");
  const [qty, setQty] = useState<number>(1);

  const wholesaleAt = Number(settings?.wholesale_at || 0);
  const wholesaleIfOrder = wholesaleAt > 0 ? qty >= wholesaleAt : false;
  const wholesaleIfAddedToCart =
    wholesaleAt > 0 ? count + qty >= wholesaleAt : false;
  const isWholesaleNotice = wholesaleIfOrder || wholesaleIfAddedToCart;

  useEffect(() => setMounted(true), []);

  // lock body scroll when ANY modal open
  useEffect(() => {
    if (!open && !badModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, badModalOpen]);

  const imgUrl = useMemo(() => {
    if (absoluteImage) return absoluteImage;
    return toAbsoluteUrl(siteUrl, product.image);
  }, [absoluteImage, product.image, siteUrl]);

  const productUrl = useMemo(
    () => buildProductUrl(siteUrl, product),
    [siteUrl, product],
  );

  const canSubmit = useMemo(() => {
    if (hasSizes && !size) return false;
    if (hasColors && !color) return false;
    if (!qty || qty < 1) return false;
    return true;
  }, [hasSizes, hasColors, size, color, qty]);

  const canOrderNow = canSubmit && !placing && !reordering;

  function close() {
    if (placing || reordering) return;
    setOpen(false);
  }

  const openWhatsAppDirect = useCallback(() => {
    const phone = cleanPhoneNumber(whatsappNumber);

    const lines: string[] = [];
    lines.push("مرحباً");
    lines.push("أريد طلب المنتج التالي:");
    lines.push("");
    lines.push(`• الاسم: ${product.name}`);

    if (
      product.price !== undefined &&
      product.price !== null &&
      `${product.price}`.trim() !== ""
    ) {
      lines.push(`• السعر: ${product.price}`);
    }

    if (hasSizes) lines.push(`• المقاس: ${size}`);
    if (hasColors) lines.push(`• اللون: ${color}`);
    lines.push(`• الكمية: ${qty}`);

    if (isWholesaleNotice && wholesaleAt > 0) {
      lines.push(
        `• ملاحظة: تم الوصول لحد الجملة (${wholesaleAt}) — سيتم الاتفاق على سعر الجملة عند الطلب.`,
      );
    }

    if (note.trim()) lines.push(`• ملاحظة: ${note.trim()}`);
    lines.push("");
    lines.push(`• رابط المنتج: ${productUrl}`);
    if (imgUrl) lines.push(`• صورة المنتج: ${imgUrl}`);
    lines.push("");
    lines.push("شكراً");

    const text = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [
    whatsappNumber,
    product.name,
    product.price,
    hasSizes,
    hasColors,
    size,
    color,
    qty,
    isWholesaleNotice,
    wholesaleAt,
    note,
    productUrl,
    imgUrl,
  ]);

  function addToCart() {
    if (!canSubmit) return;

    addItem({
      productId: String(product.id),
      name: product.name,
      price:
        product.price !== undefined && product.price !== null
          ? String(product.price)
          : undefined,
      image: imgUrl || undefined,
      productUrl,
      size: hasSizes ? size : undefined,
      color: hasColors ? color : undefined,
      qty,
      note: note.trim() ? note.trim() : undefined,
    });

    close();
  }

  // ✅ نفس منطق useCartOrderFlow: createOrder ثم فتح واتساب
  const placeOrder = useCallback(async () => {
    if (!canOrderNow) return;

    setPlacing(true);
    try {
      // نفس شكل البودي المتوقع من الباك: { data: [{ product_id, count }] }
      const payload = {
        data: [
          {
            product_id: String(product.id),
            count: Number(qty) || 1,
          },
        ],
      };

      await createOrder(payload);

      // ✅ نجاح: افتح واتساب
      openWhatsAppDirect();
      setOpen(false);
    } catch (err) {
      if (isOrderBadResponse(err)) {
        setBad(err.response.data);
        setBadModalOpen(true);
      } else {
        console.error("Order failed", err);
        alert("صار خطأ أثناء إرسال الطلب. حاول مرة ثانية.");
      }
    } finally {
      setPlacing(false);
    }
  }, [canOrderNow, product.id, qty, openWhatsAppDirect]);

  const closeBadModal = useCallback(() => {
    if (reordering) return;
    setBadModalOpen(false);
  }, [reordering]);

  const continueWithoutUnavailable = useCallback(async () => {
    if (!bad?.key || reordering) return;

    setReordering(true);
    try {
      await reorderByKey(bad.key);

      // بعربة: منفلتر عناصر ونكمل. هون: إذا المنتج نفسه ضمن غير المتاح => ما في شي نكمل فيه
      const names = parseUnavailableNames(bad.products);
      const productIsUnavailable =
        names.length > 0
          ? names.some(
              (n) => product.name.includes(n) || n.includes(product.name),
            )
          : false;

      if (productIsUnavailable) {
        alert("هذا المنتج غير متاح حالياً، ما فيك تكمل الطلب بدونه.");
        setBadModalOpen(false);
        return;
      }

      // إذا الباك قال في شي غير متاح لكن منتجنا مو ضمنه، منتابع طبيعي
      openWhatsAppDirect();
      setBadModalOpen(false);
      setOpen(false);
    } catch (err) {
      console.error("Reorder failed", err);
      alert("صار خطأ أثناء متابعة الطلب. حاول مرة ثانية.");
    } finally {
      setReordering(false);
    }
  }, [bad, reordering, product.name, openWhatsAppDirect]);

  const badModalUi = (
    <div
      className={[
        "fixed inset-0 z-[999999]",
        "transition-all duration-200",
        badModalOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      ].join(" ")}
      aria-hidden={!badModalOpen}
    >
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[6px]"
        onClick={closeBadModal}
      />

      <div className="absolute inset-0 overflow-y-auto px-4 pt-[max(16px,env(safe-area-inset-top))] pb-[max(16px,env(safe-area-inset-bottom))] sm:flex sm:items-center sm:justify-center sm:p-4">
        <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[calc(100dvh-24px)]">
          <div className="flex items-start justify-between gap-4 p-5 border-b">
            <div>
              <h3 className="text-lg font-bold text-gray-900">مشكلة بالطلب</h3>
              <p className="mt-1 text-sm text-gray-600">
                {bad?.message ||
                  "خطأ في الطلب, المنتجات المذكورة غير متاحة حاليا هل تود الطلب بدونها"}
              </p>
            </div>

            <button
              type="button"
              onClick={closeBadModal}
              className="rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
              aria-label="إغلاق"
              disabled={reordering}
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100dvh-24px-88px)]">
            {bad?.products ? (
              <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  المنتجات غير المتاحة:
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {bad.products}
                </p>
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={closeBadModal}
                disabled={reordering}
                className={[
                  "w-full sm:flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  reordering
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200",
                ].join(" ")}
              >
                إغلاق
              </button>

              <button
                type="button"
                onClick={continueWithoutUnavailable}
                disabled={reordering}
                className={[
                  "w-full sm:flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  reordering
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#004439] text-white hover:opacity-90",
                ].join(" ")}
              >
                {reordering ? "جارِ المتابعة..." : "متابعة بدون غير المتاح"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const modalUi = (
    <div
      className={[
        "fixed inset-0 z-[99999]",
        "transition-all duration-300",
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      ].join(" ")}
      aria-hidden={!open}
    >
      {/* FULLSCREEN overlay blur */}
      <div
        className={[
          "absolute inset-0",
          "bg-black/55 backdrop-blur-[6px]",
          "transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={close}
      />

      {/* centered modal */}
      <div
        className={[
          "absolute inset-0",
          // على الموبايل: خلّي الحاوية قابلة للسكرول + safe area
          "overflow-y-auto",
          "px-4",
          "pt-[max(16px,env(safe-area-inset-top))]",
          "pb-[max(16px,env(safe-area-inset-bottom))]",
          // على الديسكتوب: يرجع سنتر
          "sm:flex sm:items-center sm:justify-center sm:p-4",
        ].join(" ")}
      >
        <div
          className={[
            "w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden",
            "transition-all duration-300",
            open
              ? "scale-100 translate-y-0 opacity-100"
              : "scale-95 translate-y-2 opacity-0",

            // ✅ أهم سطرين للموبايل:
            // خليه ياخد أقصى ارتفاع مناسب للشاشة (dvh أفضل من vh على الموبايل)
            "max-h-[calc(100dvh-24px)] sm:max-h-none",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-start justify-between gap-4 p-5 border-b">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                اختيار التفاصيل
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                اختر المقاس/اللون ثم أضف للسلة أو اطلب عبر واتساب.
              </p>
            </div>

            <button
              type="button"
              onClick={close}
              className="rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
              aria-label="إغلاق"
              disabled={placing || reordering}
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100dvh-24px-98px)] sm:max-h-none">
            <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">المنتج</p>
                  <p className="font-semibold text-gray-900 truncate">
                    {product.name}
                  </p>
                  {product.price !== undefined &&
                    product.price !== null &&
                    `${product.price}`.trim() !== "" && (
                      <p className="mt-1 text-sm text-gray-700">
                        السعر: {product.price}
                      </p>
                    )}
                </div>

                {imgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgUrl}
                    alt={product.name}
                    className="h-14 w-14 rounded-2xl object-cover ring-1 ring-black/10"
                  />
                ) : null}
              </div>
            </div>

            {(hasSizes || hasColors) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hasSizes && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-800">
                      المقاس <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    >
                      <option value="">اختر المقاس</option>
                      {sizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {hasColors && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-800">
                      اللون <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    >
                      <option value="">اختر اللون</option>
                      {colors.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {colors
                        .filter((c) => c.hex)
                        .map((c) => (
                          <button
                            key={`${c.name}-sw`}
                            type="button"
                            onClick={() => setColor(c.name)}
                            className={[
                              "h-7 px-3 rounded-full text-xs font-medium ring-1 ring-black/10 transition",
                              color === c.name
                                ? "bg-gray-900 text-white"
                                : "bg-white text-gray-800",
                            ].join(" ")}
                          >
                            <span
                              className="inline-block h-3 w-3 rounded-full align-middle me-2"
                              style={{ backgroundColor: c.hex }}
                            />
                            {c.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">
                  الكمية
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={qty === 0 ? "" : qty}
                  onChange={(e) => {
                    const v = e.target.value;

                    if (v === "") {
                      setQty(0);
                      return;
                    }

                    if (!/^\d+$/.test(v)) return;

                    const num = parseInt(v, 10);
                    if (num < 1) return;

                    setQty(num);
                  }}
                  onBlur={() => {
                    if (qty < 1) setQty(1);
                  }}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">
                  ملاحظة (اختياري)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="مثال: أريده كهدية..."
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
            </div>

            {wholesaleAt > 0 && (
              <div
                className={[
                  "rounded-2xl p-4 ring-1",
                  isWholesaleNotice
                    ? "bg-[#004439]/5 ring-[#004439]/10 text-[#004439]"
                    : "bg-gray-50 ring-black/5 text-gray-700",
                ].join(" ")}
              >
                <div className="text-sm font-semibold">
                  حد سعر الجملة: {wholesaleAt} قطعة
                </div>
                <p className="mt-1 text-xs leading-relaxed">
                  عند وصول مجموع القطع في السلة (أو كمية هذا المنتج) إلى هذا
                  الحد، يصبح السعر سعر جملة وسيتم الاتفاق عليه عند الطلب.
                </p>
                {isWholesaleNotice && (
                  <p className="mt-2 text-xs font-semibold">
                    ✅ تم الوصول لحد الجملة — سيتم اعتماد سعر الجملة عند
                    التواصل.
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={addToCart}
                disabled={!canSubmit || placing || reordering}
                className={[
                  "w-full sm:flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  canSubmit && !placing && !reordering
                    ? "bg-[#e1c254] text-[#004439] hover:opacity-90"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed",
                ].join(" ")}
              >
                إضافة إلى السلة
              </button>

              <button
                type="button"
                onClick={placeOrder}
                disabled={!canOrderNow}
                className={[
                  "w-full sm:flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  canOrderNow
                    ? "bg-[#25D366] text-white hover:opacity-90"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed",
                ].join(" ")}
              >
                {placing ? "جارِ إرسال الطلب..." : "طلب عبر واتساب"}
              </button>
            </div>

            {!canSubmit && (hasSizes || hasColors) && (
              <p className="text-xs text-gray-500">
                لازم تختار {hasSizes ? "المقاس" : ""}
                {hasSizes && hasColors ? " و" : ""}
                {hasColors ? "اللون" : ""} قبل المتابعة.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold",
          "bg-[#004439] text-white hover:opacity-90 transition",
          "w-full sm:w-auto",
          className,
        ].join(" ")}
      >
        {buttonText}
      </button>

      {/* ✅ Portals */}
      {mounted && createPortal(modalUi, document.body)}
      {mounted && createPortal(badModalUi, document.body)}
    </>
  );
}
