"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import CartUnavailableProductModal from "@/components/cart/CartUnavailableProductModal";
import { useCartOrderFlow } from "@/components/cart/useCartOrderFlow";

export default function CartPage() {
  const { items, subtotal, currencyLabel, count, removeItem, setQty, clear } =
    useCart();

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "963900000000";

  const { placing, placeOrder, modalProps } = useCartOrderFlow({
    items,
    currencyLabel,
    whatsappNumber,
    clearCart: clear,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">سلة المشتريات</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} عنصر</p>
        </div>

        <Link
          href="/products"
          className="rounded-2xl px-4 py-3 text-sm font-semibold bg-white text-gray-800 ring-1 ring-black/10 hover:bg-gray-50 transition"
        >
          متابعة التسوق
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* items */}
        <div className="lg:col-span-2 space-y-4">
          {items.length === 0 ? (
            <div className="rounded-3xl bg-gray-50 p-10 text-center text-gray-600 ring-1 ring-black/5">
              السلة فارغة.
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.key}
                className="rounded-3xl bg-white ring-1 ring-black/5 p-5"
              >
                <div className="flex items-start gap-4">
                  {it.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.image}
                      alt={it.name}
                      className="h-20 w-20 rounded-3xl object-cover ring-1 ring-black/10"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-3xl bg-gray-100 ring-1 ring-black/10" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-gray-900 truncate">
                      {it.name}
                    </p>
                    <div className="mt-1 text-sm text-gray-600 space-y-1">
                      {it.price ? <p>السعر: {it.price}</p> : null}
                      {it.size ? <p>المقاس: {it.size}</p> : null}
                      {it.color ? <p>اللون: {it.color}</p> : null}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setQty(it.key, Math.max(1, it.qty - 1))
                          }
                          className="h-10 w-10 rounded-2xl bg-gray-100 hover:bg-gray-200 transition"
                        >
                          −
                        </button>
                        <input
                          value={it.qty}
                          onChange={(e) =>
                            setQty(it.key, Number(e.target.value || 1))
                          }
                          type="number"
                          min={1}
                          className="h-10 w-20 rounded-2xl border border-gray-200 text-center text-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setQty(it.key, it.qty + 1)}
                          className="h-10 w-10 rounded-2xl bg-gray-100 hover:bg-gray-200 transition"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(it.key)}
                        className="rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
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

        {/* summary */}
        <aside className="rounded-3xl bg-white ring-1 ring-black/5 p-6 h-fit sticky top-6">
          <h2 className="text-lg font-bold text-gray-900">ملخص الطلب</h2>

          <div className="mt-4 rounded-2xl bg-gray-50 ring-1 ring-black/5 p-4">
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
          </div>

          <button
            type="button"
            onClick={clear}
            disabled={items.length === 0}
            className={[
              "mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
              items.length
                ? "bg-white text-gray-800 ring-1 ring-black/10 hover:bg-gray-50"
                : "bg-gray-200 text-gray-500 cursor-not-allowed",
            ].join(" ")}
          >
            إفراغ السلة
          </button>

          <button
            type="button"
            onClick={placeOrder}
            disabled={!items.length || placing}
            className={[
              "mt-3 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
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
              "طلب عبر واتساب"
            )}
          </button>
        </aside>
      </div>

      <CartUnavailableProductModal {...modalProps} />
    </main>
  );
}
