import Container from "@/components/Container";
import AutoMarquee from "@/components/AutoMarquee";
import Reveal from "@/components/Reveal";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import ProductRowSlider from "@/components/ProductRowSlider";
import SelectedRingShowcase from "@/components/SelectedRingShowcase";
import { fetchHomeServer } from "@/lib/api/home.server";
import ProductSliderCat from "@/components/ProductSliderCat";
import { buildKeywords } from "@/lib/seo/keywords";

export async function generateMetadata() {
  const siteName = "سينيورة";
  const keywords = buildKeywords({
    siteName,
    city: "دمشق",
    area: "الميدان",
    limit: 1000,
  });

  return {
    title: "الرئيسية",
    description:
      "سينيورة — محل فساتين سهرة وأقمشة وملابس سهرة في دمشق (الميدان). تفصيل حسب الطلب وبيع جملة ومفرق.",
    keywords,
    openGraph: {
      title: `سينيورة | فساتين سهرة دمشق`,
      description:
        "فساتين سهرة وأقمشة وملابس سهرة في دمشق (الميدان). تفصيل حسب الطلب وبيع جملة ومفرق.",
    },
  };
}

export default async function HomePage() {
  const data = await fetchHomeServer({
    latest_page: 1,
    popular_page: 1,
    ordered_page: 1,
    per_page: 12,
  });

  const latest = data.latest_products.data;
  const popular = data.most_popular_product.data;
  const ordered = data.most_ordered_product.data;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden luxury-glow">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-brandGreen/10 via-white to-brandGold/15" />
          <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-brandGold/20 blur-3xl" />
          <div className="absolute -left-32 -bottom-32 h-[420px] w-[420px] rounded-full bg-brandGreen/20 blur-3xl" />
        </div>

        <Container className="py-5 md:py-9">
          <div className="grid items-start gap-10 md:grid-cols-2 md:items-center">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-brandGreen ring-1 ring-black/5">
                  تشكيلة أنيقة • الطلب عبر واتساب
                </div>

                <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-black/90 md:text-5xl">
                  إطلالة راقية
                  <span className="text-brandGreen"> بدون تعب</span>
                </h1>

                <p className="mt-4 text-base leading-relaxed text-black/65">
                  تصفّح الفساتين والعبايات والأطقم والإكسسوارات. عند اختيارك
                  للقطعة، اضغط
                  <span className="mx-2 font-semibold text-black/80">
                    شراء عبر واتساب
                  </span>
                  لإرسال رقم المنتج والصورة مباشرة.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <PrimaryButton href="/products">تصفّح المنتجات</PrimaryButton>
                  <SecondaryButton href="#top-sellers">
                    الأكثر مبيعاً
                  </SecondaryButton>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
                    <div className="text-lg font-extrabold text-brandGreen">
                      سريع
                    </div>
                    <div className="mt-1 text-black/60">طلب عبر واتساب</div>
                  </div>
                  <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
                    <div className="text-lg font-extrabold text-brandGreen">
                      جديد
                    </div>
                    <div className="mt-1 text-black/60">تصاميم رائجة</div>
                  </div>
                  <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
                    <div className="text-lg font-extrabold text-brandGreen">
                      فاخر
                    </div>
                    <div className="mt-1 text-black/60">قطع مختارة</div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delayMs={120}>
              <div className="space-y-3">
                <AutoMarquee items={latest} />

                <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-soft">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-black/50">
                        ميزة الشراء
                      </div>
                      <div className="mt-1 text-base font-extrabold text-black/85">
                        طلب فوري عبر واتساب
                      </div>
                      <div className="mt-1 text-sm text-black/60">
                        يتم إرسال رقم المنتج ورابط الصورة تلقائياً.
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <SecondaryButton href="/products">
                        عرض التفاصيل
                      </SecondaryButton>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* <BestOffers /> */}

      {/* SELECTED PRODUCTS (3D Ring) */}
      <section className="py-14">
        <Container>
          <Reveal>
            <SelectedRingShowcase products={popular} className="mt-10" />
          </Reveal>
        </Container>
      </section>

      {/* TOP SELLERS */}
      <section id="top-sellers" className="py-14">
        <Container>
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-extrabold text-black/90">
                  الأكثر مبيعاً
                </h2>
                <p className="mt-2 text-black/60">
                  قطع محبوبة ومجرّبة—أنيقة وسهلة التنسيق.
                </p>
              </div>
              <SecondaryButton
                href="/products"
                className="hidden md:inline-flex"
              >
                عرض الكل
              </SecondaryButton>
            </div>
          </Reveal>

          <div className="mt-8">
            <Reveal delayMs={120}>
              <ProductRowSlider products={ordered} />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* TRENDING */}
      <section id="trending" className="relative py-16">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-brandGold/10 via-white to-brandGold/5" />
          <div className="absolute -right-20 top-10 h-[260px] w-[260px] rounded-full bg-brandGold/14 blur-2xl md:-right-28 md:h-[420px] md:w-[420px] md:bg-brandGold/18 md:blur-3xl" />
        </div>
        <Container>
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                {/* <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-brandGreen ring-1 ring-black/5">
                  الأكثر طلباً حالياً
                  <span className="text-black/30">•</span>
                  تحديثات مستمرة
                </div> */}
                <h2 className="mt-3 text-2xl font-extrabold text-black/90 md:text-3xl">
                  الأصناف
                </h2>
                <p className="mt-2 text-black/60">
                  تصاميم جديدة يكثر عليها الطلب — اختيارات تعكس ذوق الموسم.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="mt-8 rounded-[32px] border border-black/5 bg-white/60 p-2 shadow-soft md:backdrop-blur md:p-4">
            <Reveal delayMs={120}>
              <ProductSliderCat
                categories={data.category_with_its_product}
                className="mt-6"
                perPage={12}
              />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-8">
        <Container>
          <Reveal>
            <div className="rounded-[32px] border border-black/5 bg-gradient-to-br from-brandGreen to-brandGreen/95 p-8 text-white shadow-soft md:p-12">
              <h3 className="text-2xl font-extrabold md:text-3xl">
                محتار/ة بالمقاس؟
              </h3>
              <p className="mt-2 max-w-2xl text-white/85">
                ادخل على أي منتج واضغط{" "}
                <span className="font-semibold">شراء عبر واتساب</span> ثم اكتب
                سؤالك عن المقاسات/الألوان—رح نساعدك بسرعة.
              </p>
              <div className="mt-6">
                <PrimaryButton
                  href="/products"
                  className=" !text-brandGreen !bg-white hover:opacity-100"
                >
                  ابدأ التصفح
                </PrimaryButton>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-5 text-center">
        <p className="text-sm sm:text-base text-[#0f3f3a]/75 luxury-text ">
          نؤمن أن الأناقة الحقيقية تكمن في البساطة وجودة التفاصيل، لذلك نحرص على
          تقديم تصاميم تعبّر عنك وتدوم معك.
        </p>
      </section>
    </div>
  );
}

// ISR: regenerate this page every 15 minutes
export const revalidate = 900;
