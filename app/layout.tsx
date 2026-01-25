import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/cn";
import ParallaxBackground from "@/components/ParallaxBackground";
import DesktopCartLayout from "@/components/cart/DesktopCartLayout";
import { CartProvider } from "@/components/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import { fetchSettingsServer } from "@/lib/api/settings.server";
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://your-domain.com",
  ),
  title: {
    default: "سينيورة",
    template: "%s | سينيورة",
  },
  description:
    "سينيورة — محل فساتين سهرة وأقمشة وملابس سهرة في دمشق (الميدان). تفصيل حسب الطلب وبيع جملة ومفرق.",

  applicationName: "سينيورة",

  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "سينيورة",
    siteName: "سينيورة",
    description:
      "سينيورة — محل فساتين سهرة وأقمشة وملابس سهرة في دمشق (الميدان). تفصيل حسب الطلب وبيع جملة ومفرق.",
    images: ["/logo.png"],
  },

  twitter: {
    card: "summary_large_image",
    title: "سينيورة",
    description:
      "محل فساتين سهرة وأقمشة وملابس سهرة في دمشق (الميدان). تفصيل حسب الطلب وبيع جملة ومفرق.",
    images: ["/logo.png"],
  },
};
export const viewport = {
  themeColor: "#004439",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await fetchSettingsServer();
  const whatsappNumber = settings.whatsapp;
  return (
    <html lang="ar" dir="rtl">
      <body
        className={cn(
          cairo.className,
          "min-h-screen luxury-bg overflow-x-hidden",
        )}
      >
        <CartProvider initialSettings={settings}>
          <Header />
          <ParallaxBackground />

          <main className="min-h-[70vh]">
            <div className="hidden lg:block">
              <DesktopCartLayout whatsappNumber={whatsappNumber}>
                {children}
              </DesktopCartLayout>
            </div>

            {/* ✅ Mobile: normal layout (بدون push) */}
            <div className="lg:hidden">{children}</div>

            {/* ✅ Mobile drawer فقط */}
            <CartDrawer whatsappNumber={whatsappNumber} />
          </main>
          <Footer settings={settings} />
        </CartProvider>
      </body>
    </html>
  );
}
