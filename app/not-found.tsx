import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
          {/* top accent */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-brandGold via-brandGold/60 to-brandGreen" />

          {/* soft background shapes */}
          <div className="pointer-events-none absolute -top-24 -end-24 h-64 w-64 rounded-full bg-brandGold/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-28 -start-28 h-72 w-72 rounded-full bg-brandGreen/10 blur-2xl" />

          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div className="space-y-4">
              <p className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/60">
                404
              </p>

              <h1 className="text-2xl font-extrabold text-brandGreen md:text-3xl">
                الصفحة غير موجودة
              </h1>

              <p className="text-sm leading-7 text-black/60 md:text-base">
                يبدو أن الرابط غير صحيح أو أن الصفحة تم نقلها/حذفها.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full bg-brandGreen px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  العودة إلى الصفحة الرئيسية
                </Link>

                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-2.5 text-sm font-semibold text-black/70 transition hover:border-brandGreen/30 hover:text-brandGreen"
                >
                  تصفّح المنتجات
                </Link>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative w-full max-w-sm rounded-3xl border border-black/10 bg-white p-6">
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brandGold/15 text-brandGreen">
                    <span className="text-3xl font-extrabold">!</span>
                  </div>

                  <div className="mt-4 text-6xl font-extrabold tracking-tight text-black/80">
                    404
                  </div>
                  <p className="mt-2 text-sm text-black/55">Not Found</p>

                  <div className="mt-6 rounded-2xl bg-black/5 p-4 text-xs leading-6 text-black/60">
                    إذا وصلت لهون بالخطأ، ارجع للهوم أو جرّب البحث ضمن المنتجات.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
