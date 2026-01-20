import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { Badge, SecondaryButton } from "@/components/ui";
import WhatsAppOrderButton from "@/components/WhatsAppOrderButton";

import { fetchProductByIdServer } from "@/lib/api/product.server";
import { fetchSettingsServer } from "@/lib/api/settings.server";
import { buildKeywords } from "@/lib/seo/keywords";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const siteName = "سينيورة";
  try {
    const dto = await fetchProductByIdServer(params.id);
    const name = dto.name ?? "منتج";
    const category = dto.categories?.[0]?.name ?? "فساتين سهرة";
    const keywords = buildKeywords({
      siteName,
      city: "دمشق",
      area: "الميدان",
      product: {
        name,
        category,
        tags: dto.colors ?? [],
      },
      limit: 1000,
    });

    return {
      title: name,
      description:
        (dto.description && dto.description.trim()) ||
        `اطّلع على ${name} من ${siteName} في دمشق (الميدان). تفصيل حسب الطلب وبيع جملة ومفرق.`,
      keywords,
      openGraph: {
        title: `${name} | ${siteName}`,
        description:
          (dto.description && dto.description.trim()) ||
          `اطّلع على ${name} من ${siteName} في دمشق (الميدان).`,
      },
    };
  } catch {
    return {
      title: "منتج",
      description: `${siteName} — محل فساتين سهرة وأقمشة وملابس سهرة في دمشق (الميدان).`,
    };
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const settings = await fetchSettingsServer();
  let dto;
  try {
    dto = await fetchProductByIdServer(params.id);
  } catch {
    notFound();
  }
  const sizes = Array.from(new Set((dto.sizes ?? []).map(String)));
  const colors = Array.from(new Set(dto.colors ?? [])).map((c) => ({
    name: c,
  }));

  /**
   * ✅ تحويل مباشر داخل الصفحة (بدون adapter)
   * فقط القيم اللي UI يحتاجها
   */
  const product = {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? "لا يوجد وصف حالياً.",
    price: dto.price,
    currency: "USD",

    images:
      dto.images && dto.images.length > 0
        ? dto.images
        : ["/products/dress-1.svg"],

    category: "المنتجات",

    tags: dto.colors ?? [],

    details: [
      { label: "الطلبات", value: String(dto.orders_count) },
      { label: "الزيارات", value: String(dto.visitor) },
      {
        label: "تفصيل حسب الطلب",
        value: dto.custom_tailoring ? "نعم" : "لا",
      },
      {
        label: "المقاسات",
        value: dto.sizes?.length ? dto.sizes.join(", ") : "-",
      },
    ],
    options: {
      sizes,
      colors,
    },
  };
  const absoluteImage = (() => {
    const img = product.images?.[0];
    if (!img) return undefined;
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    return `${siteUrl}${img.startsWith("/") ? "" : "/"}${img}`;
  })();

  return (
    <Container className="py-10">
      <div className="mb-6 text-sm text-black/60">
        <Link href="/" className="hover:text-brandGreen">
          الرئيسية
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-brandGreen">
          المنتجات
        </Link>
        <span className="mx-2">/</span>
        <span>{product.id}</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* الصورة */}
        <Reveal>
          <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-soft">
            <div className="relative aspect-[4/5]">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </Reveal>

        {/* التفاصيل */}
        <Reveal delayMs={120}>
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge>{product.category}</Badge>
            </div>

            <h1 className="mt-4 text-3xl font-bold text-black/90">
              {product.name}
            </h1>

            <div className="mt-3 text-2xl font-extrabold text-brandGreen">
              {product.price} {product.currency}
            </div>

            <p className="mt-5 leading-relaxed text-black/65">
              {product.description}
            </p>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="mt-8 grid gap-4 rounded-3xl border border-black/5 bg-white p-6">
              <div className="text-sm font-semibold text-black/80">
                التفاصيل
              </div>
              <ul className="space-y-2 text-sm text-black/60">
                {product.details.map((d) => (
                  <li
                    key={d.label}
                    className="flex items-center justify-between"
                  >
                    <span>{d.label}</span>
                    <span className="font-semibold text-black/70">
                      {d.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <WhatsAppOrderButton
                product={product as any}
                whatsappNumber={settings.whatsapp}
                siteUrl={siteUrl}
                absoluteImage={absoluteImage}
              />

              <SecondaryButton href="/products">متابعة التسوّق</SecondaryButton>
            </div>
          </div>
        </Reveal>
      </div>
    </Container>
  );
}

// ISR: regenerate product page every 1 hour
export const revalidate = 3600;
