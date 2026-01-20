"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function CartUnavailableProductModal({
  open,
  title = "في مشكلة بمنتج ضمن السلة",
  message,
  productsText,
  loading,
  onClose,
  onContinue,
}: {
  open: boolean;
  title?: string;
  message: string;
  productsText?: string;
  loading?: boolean;
  onClose: () => void;
  onContinue: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
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
      <div
        className={[
          "absolute inset-0",
          "bg-black/55 backdrop-blur-[6px]",
          "transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={[
            "w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden",
            "transition-all duration-300",
            open
              ? "scale-100 translate-y-0 opacity-100"
              : "scale-95 translate-y-2 opacity-0",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-start justify-between gap-4 p-5 border-b">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-600">{message}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!loading) onClose();
              }}
              className={[
                "rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-100 transition",
                loading ? "opacity-40 cursor-not-allowed" : "",
              ].join(" ")}
              aria-label="إغلاق"
              disabled={!!loading}
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-4">
            {productsText ? (
              <div className="rounded-2xl bg-red-50 ring-1 ring-red-100 p-4">
                <p className="text-sm text-red-700">
                  المنتج/المنتجات غير المتاحة:
                </p>
                <p className="mt-1 font-semibold text-red-900">{productsText}</p>
              </div>
            ) : null}

            <div className="rounded-2xl bg-gray-50 ring-1 ring-black/5 p-4">
              <p className="text-sm text-gray-700">
                هل تريد إكمال الطلب بدون هذه المنتجات؟
              </p>
            </div>
          </div>

          <div className="p-5 border-t flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={!!loading}
              className={[
                "w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
                loading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-800 ring-1 ring-black/10 hover:bg-gray-50",
              ].join(" ")}
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={onContinue}
              disabled={!!loading}
              className={[
                "w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
                loading
                  ? "bg-[#25D366]/70 text-white cursor-not-allowed"
                  : "bg-[#25D366] text-white hover:opacity-90",
              ].join(" ")}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  جارٍ المتابعة...
                </span>
              ) : (
                "إكمال بدونها"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
