"use client";

import React from "react";
import { useCart } from "./CartContext";
import CartDesktopSidebar from "./CartDesktopSidebar";

export default function DesktopCartLayout({
  children,
  whatsappNumber,
}: {
  children: React.ReactNode;
  whatsappNumber: string;
}) {
  const { isOpen } = useCart();

  const sidebarW = 360;

  return (
    <div className="hidden lg:block">
      <div className="relative">
        {/* المحتوى ينزاح */}
        <div
          className="transition-[margin] duration-300 ease-out"
          style={{ marginLeft: isOpen ? sidebarW : 0 }}
        >
          {children}
        </div>

        {/* Sidebar Push */}
        <div
          className="fixed top-0 left-0 h-screen bg-white shadow-2xl z-[9999]"
          style={{
            width: sidebarW,
            transform: isOpen
              ? "translateX(0) scale(1)"
              : `translateX(-${sidebarW}px) scale(0.96)`,
            opacity: isOpen ? 1 : 0,
            transition:
              "transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease",
          }}
        >
          <CartDesktopSidebar whatsappNumber={whatsappNumber} />
        </div>
      </div>
    </div>
  );
}
