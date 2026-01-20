import Image from "next/image";

export default function BestOffers() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-12">
          {/* الصور */}
          <div className="order-2 flex-1 lg:order-1">
            {/* ✅ Mobile layout فقط */}
            <div className="lg:hidden">
              <div className="grid grid-cols-12 gap-4 sm:gap-5">
                {/* يسار: الصورة الكبيرة */}
                <div className="relative col-span-7 h-[320px] overflow-hidden rounded-[32px] shadow-2xl ring-2 ring-[#e1c254]/35 sm:h-[380px]">
                  <Image
                    src="/products/dress-1.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 60vw, 220px"
                    className="object-cover"
                    priority
                  />
                </div>

                {/* يمين: صورتين فوق بعض */}
                <div className="col-span-5 flex flex-col gap-4 sm:gap-5">
                  <div className="relative h-[150px] overflow-hidden rounded-3xl shadow-lg">
                    <Image
                      src="/products/abaya-1.jpg"
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 40vw, 180px"
                      className="object-cover"
                    />
                  </div>

                  <div className="relative h-[150px] overflow-hidden rounded-3xl shadow-lg">
                    <Image
                      src="/products/set-1.jpg"
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 40vw, 160px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Desktop layout فقط */}
            <div className="hidden lg:flex lg:items-end lg:gap-6">
              <div className="relative h-[260px] w-[180px] overflow-hidden rounded-3xl shadow-lg">
                <Image
                  src="/products/abaya-1.jpg"
                  alt=""
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </div>

              <div className="relative z-10 h-[340px] w-[220px] overflow-hidden rounded-[36px] shadow-2xl ring-2 ring-[#e1c254]/40">
                <Image
                  src="/products/dress-1.jpg"
                  alt=""
                  fill
                  sizes="220px"
                  className="object-cover"
                />
              </div>

              <div className="relative h-[220px] w-[160px] overflow-hidden rounded-3xl shadow-lg">
                <Image
                  src="/products/set-1.jpg"
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* النص */}
          <div className="order-1 flex-1 lg:order-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#004439] sm:text-3xl lg:text-4xl">
              أفضل العروض
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-[#0f3f3a]/75 sm:mt-6 sm:text-base">
              اخترنا لك مجموعة من القطع المميزة التي تجمع بين الأناقة والجودة،
              مع أسعار خاصة تمنحك أفضل قيمة لتجربة تسوق راقية.
            </p>

            <div className="mt-7 sm:mt-8">
              <button className="w-full rounded-full bg-[#e1c254] px-8 py-3 text-sm font-semibold text-[#004439] shadow transition hover:opacity-95 sm:w-auto sm:text-base">
                استعرض العروض
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
