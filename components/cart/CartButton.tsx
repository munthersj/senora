"use client";

import React from "react";
import { useCart } from "./CartContext";

export default function CartButton() {
  const { count, isOpen, open, close } = useCart();

  return (
    <button
      onClick={() => (isOpen ? close() : open())}
      aria-label="السلة"
      aria-expanded={isOpen}
      type="button"
      className={[
        "relative h-11 w-11 rounded-2xl",
        "grid place-items-center",
        "bg-white/80 backdrop-blur",
        "ring-1 ring-black/10",
        "transition-all duration-300 ease-out",
        "hover:bg-white",
        isOpen ? "ring-2 ring-brandGreen" : "",
      ].join(" ")}
    >
      {/* أيقونة */}
      <span
        className={[
          "transition-all duration-300 ease-out",
          "transform-gpu",
          isOpen
            ? "rotate-180 scale-110 text-brandGreen"
            : "rotate-0 scale-100",
        ].join(" ")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 7h15l-1.5 9h-12z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M6 7l-1-3H2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M9 22a1 1 0 100-2 1 1 0 000 2zM18 22a1 1 0 100-2 1 1 0 000 2z"
            fill="currentColor"
          />
        </svg>
      </span>

      {/* badge */}
      {count > 0 && (
        <span
          className={[
            "absolute -top-1 -right-1",
            "min-w-[18px] h-[18px]",
            "px-1 rounded-full",
            "bg-brandGold text-brandGreen",
            "text-[11px] font-bold",
            "grid place-items-center",
            "transition-transform duration-300",
            isOpen ? "scale-90" : "scale-100",
          ].join(" ")}
        >
          {count}
        </span>
      )}
    </button>
  );
}
