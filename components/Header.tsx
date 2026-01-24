"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import CartButton from "@/components/cart/CartButton";
import { useCart } from "@/components/cart/CartContext";

export default function Header() {
  const { isOpen } = useCart();

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b border-black/5",
        "bg-white/85 md:bg-white/70 md:backdrop-blur",
        "transition-all duration-300",
        isOpen ? "shadow-lg md:bg-white/85" : "",
      ].join(" ")}
    >
      <div className="h-[3px] w-full bg-gradient-to-l from-brandGold via-brandGold/60 to-brandGreen" />

      <div className="flex items-center justify-between py-4  w-full  px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop Nav: يتخفف ويتعطل أثناء فتح السلة */}
        <nav
          className={[
            "hidden items-center gap-2 text-sm font-semibold text-black/70 md:flex",
            "transition-all duration-300",
            isOpen ? "opacity-50 pointer-events-none" : "opacity-100",
          ].join(" ")}
          aria-hidden={isOpen}
        >
          <Link
            href="/products"
            className="rounded-full px-4 py-2 transition hover:bg-black/5 hover:text-brandGreen"
          >
            المنتجات
          </Link>
          <Link
            href="/#top-sellers"
            className="rounded-full px-4 py-2 transition hover:bg-black/5 hover:text-brandGreen"
          >
            الأكثر مبيعاً
          </Link>
          <Link
            href="/#trending"
            className="rounded-full px-4 py-2 transition hover:bg-black/5 hover:text-brandGreen"
          >
            الأصناف
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* زر السلة — خلي CartButton يغيّر شكله عند isOpen من داخله */}
          <CartButton />
        </div>
      </div>
    </header>
  );
}
