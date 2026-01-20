"use client";

import React from "react";
import { useCart } from "./CartContext";
import { useRouter } from "next/navigation";
import CartUnavailableProductModal from "./CartUnavailableProductModal";
import { useCartOrderFlow } from "./useCartOrderFlow";

// تم نقل توليد رسالة الواتساب + الربط مع الباك إلى useCartOrderFlow

export default function CartDesktopSidebar({
  whatsappNumber,
}: {
  whatsappNumber: string;
}) {
  const {
    close,
    items,
    removeItem,
    setQty,
    clear,
    subtotal,
    currencyLabel,
    count,
    isWholesale,
    settings,
  } = useCart();

  const router = useRouter();

  const { placing, placeOrder, modalProps } = useCartOrderFlow({
    items,
    currencyLabel,
    whatsappNumber,
    wholesaleAt: settings.wholesale_at,
    clearCart: clear,
  });

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">سلة المشتريات</h3>
            <p className="text-sm text-gray-500">{items.length} عنصر</p>
          </div>
          <button
            onClick={close}
            className="rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
            aria-label="إغلاق"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body scroll */}
        <div className="flex-1 overflow-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-6 text-center text-gray-600 ring-1 ring-black/5">
              السلة فارغة حالياً.
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.key}
                className="rounded-2xl ring-1 ring-black/5 p-4 bg-white"
              >
                <div className="flex items-start gap-3">
                  {it.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.image}
                      alt={it.name}
                      className="h-14 w-14 rounded-2xl object-cover ring-1 ring-black/10"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-2xl bg-gray-100 ring-1 ring-black/10" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {it.name}
                    </p>
                    <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                      {it.price ? <p>السعر: {it.price}</p> : null}
                      {it.size ? <p>المقاس: {it.size}</p> : null}
                      {it.color ? <p>اللون: {it.color}</p> : null}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setQty(it.key, Math.max(1, it.qty - 1))
                          }
                          className="h-8 w-8 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
                          type="button"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-8 text-center">
                          {it.qty}
                        </span>
                        <button
                          onClick={() => setQty(it.key, it.qty + 1)}
                          className="h-8 w-8 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
                          type="button"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(it.key)}
                        className="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                        type="button"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t space-y-3 bg-white">
          <div className="rounded-2xl bg-gray-50 ring-1 ring-black/5 p-4">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>عدد القطع</span>
              <span className="font-semibold">{count}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-base">
              <span className="font-semibold text-gray-900">المجموع</span>
              <span className="font-bold text-gray-900">
                {subtotal.toFixed(2)} {currencyLabel}
              </span>
            </div>

            {isWholesale && (
              <div className="mt-3 rounded-xl bg-[#004439]/5 p-3 text-xs text-[#004439] ring-1 ring-[#004439]/10">
                <div className="font-semibold">ملاحظة سعر الجملة</div>
                <p className="mt-1 leading-relaxed">
                  بما أن عدد القطع وصل إلى حد الجملة ({settings.wholesale_at})، أصبح السعر سعر جملة وسيتم الاتفاق عليه عند الطلب.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {/* أزرار الإفراغ + الطلب */}
            <div className="flex gap-3">
              <button
                onClick={clear}
                disabled={items.length === 0}
                className={[
                  "w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  items.length
                    ? "bg-white text-gray-800 ring-1 ring-black/10 hover:bg-gray-50"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed",
                ].join(" ")}
                type="button"
              >
                إفراغ
              </button>

              <button
                type="button"
                onClick={placeOrder}
                disabled={!items.length || placing}
                className={[
                  "w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  items.length && !placing
                    ? "bg-[#25D366] text-white hover:opacity-90"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed",
                ].join(" ")}
              >
                {placing ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    جارٍ تأكيد الطلب...
                  </span>
                ) : (
                  "طلب واتساب"
                )}
              </button>
            </div>

            {/* ✅ زر عرض السلة */}
            <button
              type="button"
              onClick={() => {
                router.push("/cart");
                close(); // يسكر السايدبار بعد الانتقال (اختياري لكن أنيق)
              }}
              className="w-full rounded-2xl px-4 py-3 text-sm font-semibold bg-[#004439] text-white hover:opacity-90 transition"
            >
              عرض السلة
            </button>
          </div>
        </div>
      </div>

      <CartUnavailableProductModal {...modalProps} />
    </>
  );
}
