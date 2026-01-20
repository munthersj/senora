import Container from "@/components/Container";
import Logo from "@/components/Logo";
import type { ShopSettings } from "@/lib/api/settings.server";
import { makeWhatsAppLink } from "@/lib/whatsapp";
import { Facebook, Instagram, Mail } from "lucide-react";

function normalizeUrl(maybeUrl: string) {
  const url = (maybeUrl || "").trim();
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

export default function Footer({ settings }: { settings: ShopSettings }) {
  const whatsapp = (settings.whatsapp || "").trim();
  const whatsappHref = whatsapp
    ? makeWhatsAppLink({
        number: whatsapp,
        text: "مرحباً، أريد الاستفسار عن المنتجات.",
      })
    : "";

  const facebookHref = normalizeUrl(settings.facebook);
  const instagramHref = normalizeUrl(settings.instagram);
  const email = (settings.contact_us_email || "").trim();
  const hasSocial = Boolean(
    whatsappHref || facebookHref || instagramHref || email,
  );
  function ensureUrl(url?: string) {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
      return trimmed;
    return `https://${trimmed}`;
  }

  function waLink(phone?: string) {
    if (!phone) return null;
    const digits = phone.replace(/[^\d]/g, "");
    if (!digits) return null;
    return `https://wa.me/${digits}`;
  }

  function WhatsAppIcon({ className = "" }: { className?: string }) {
    return (
      <svg
        viewBox="0 0 32 32"
        className={className}
        aria-hidden="true"
        fill="currentColor"
      >
        <path d="M19.11 17.53c-.27-.13-1.61-.79-1.86-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.31.2-.58.07-.27-.13-1.12-.41-2.13-1.31-.79-.7-1.32-1.56-1.48-1.83-.16-.27-.02-.41.12-.54.12-.12.27-.31.41-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27 0 1.34.98 2.64 1.12 2.82.13.18 1.93 2.95 4.67 4.14.65.28 1.16.45 1.56.58.65.21 1.24.18 1.71.11.52-.08 1.61-.66 1.83-1.29.22-.63.22-1.17.16-1.29-.07-.12-.25-.2-.52-.34z" />
        <path d="M16 3C9.37 3 4 8.2 4 14.6c0 2.18.64 4.3 1.86 6.11L4 29l8.54-1.78a12.38 12.38 0 0 0 3.46.49c6.63 0 12-5.2 12-11.6C28 8.2 22.63 3 16 3zm0 22.2c-1.12 0-2.21-.17-3.24-.5l-.41-.13-5.06 1.05 1.02-4.86-.27-.42a9.96 9.96 0 0 1-1.54-5.34C6.5 9.5 10.76 5.4 16 5.4S25.5 9.5 25.5 14.6 21.24 25.2 16 25.2z" />
      </svg>
    );
  }

  return (
    <footer className="mt-16 border-t border-black/5 bg-white">
      <Container className="grid gap-8 py-10 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-black/60">
            قطع عصرية وأنيقة مختارة بعناية. تصفّح المنتجات وتواصل معنا عبر
            واتساب لإتمام الطلب.
          </p>
        </div>

        <div className="text-sm">
          <div className="font-semibold text-black/80">المتجر</div>
          <ul className="mt-3 space-y-2 text-black/60">
            <li>
              <a href="/products" className="hover:text-brandGreen">
                جميع المنتجات
              </a>
            </li>
            <li>
              <a href="/#top-sellers" className="hover:text-brandGreen">
                الأكثر مبيعاً
              </a>
            </li>
            <li>
              <a href="/#trending" className="hover:text-brandGreen">
                الرائج الآن
              </a>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <div className="font-semibold text-black/80">معلومات</div>
          <p className="mt-3 text-black/60">
            هذا الموقع مخصص لعرض المنتجات فقط، وإتمام الطلب يتم عبر واتساب.
          </p>

          {/* Social Icons */}
          {(() => {
            // عدّل طريقة الوصول حسب ما عندك (settings جاي من props مثلاً)
            const facebookUrl = ensureUrl(settings?.facebook);
            const instagramUrl = ensureUrl(settings?.instagram);
            const emailUrl = settings?.contact_us_email
              ? `mailto:${settings.contact_us_email}`
              : null;
            const whatsappUrl = waLink(settings?.whatsapp);

            const iconBtn =
              "inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 backdrop-blur hover:bg-white transition";

            return (
              <div className="mt-4 flex items-center gap-3">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={iconBtn}
                    aria-label="WhatsApp"
                    title={settings?.whatsapp || "WhatsApp"}
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                  </a>
                )}

                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={iconBtn}
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}

                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={iconBtn}
                    aria-label="Facebook"
                    title="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}

                {emailUrl && (
                  <a
                    href={emailUrl}
                    className={iconBtn}
                    aria-label="Email"
                    title={settings?.contact_us_email || "Email"}
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                )}
              </div>
            );
          })()}

          <p className="mt-2 text-black/60">
            © {new Date().getFullYear()} سينيورة. جميع الحقوق محفوظة.
          </p>
        </div>
      </Container>
    </footer>
  );
}
