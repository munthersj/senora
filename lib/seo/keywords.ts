type BuildKeywordsArgs = {
  siteName: string;
  city?: string;
  area?: string;
  categories?: Array<{ id?: string; name?: string; label?: string }>;
  product?: { name?: string; category?: string; tags?: string[] };
  limit?: number;
};

/**
 * يولّد قائمة كلمات مفتاحية (حتى 1000) بشكل منظم بدون تكرار.
 * الفكرة: أساسيات + محلي (دمشق/الميدان) + نوايا شراء/تفصيل/جملة/مفرق + دمج مع الكاتيغوري/المنتج.
 */
export function buildKeywords({
  siteName,
  city = "دمشق",
  area = "الميدان",
  categories = [],
  product,
  limit = 1000,
}: BuildKeywordsArgs): string[] {
  const base = [
    siteName,
    "فساتين سهرة",
    "ملابس سهرة",
    "أقمشة",
    "أقمشة سهرة",
    "تفصيل حسب الطلب",
    "تفصيل فساتين",
    "خياطة فساتين",
    "بيع جملة",
    "بيع مفرق",
    `فساتين سهرة ${city}`,
    `فساتين سهرة ${area}`,
    `محل فساتين ${city}`,
    `محل فساتين ${area}`,
  ];

  const intents = [
    "شراء",
    "سعر",
    "تسوق",
    "تفصيل",
    "تصميم",
    "جاهز",
    "جملة",
    "مفرق",
    "أحدث موديلات",
    "راقي",
    "فخم",
  ];

  const materials = [
    "شيفون",
    "دانتيل",
    "ساتان",
    "مخمل",
    "تل",
    "ترتر",
    "حرير",
  ];

  const dresses = [
    "فستان سهرة",
    "فستان سواريه",
    "فستان خطوبة",
    "فستان مطرز",
    "فستان دانتيل",
    "فستان طويل",
    "فستان قصير",
  ];

  const catNames = categories
    .map((c) => c.name ?? c.label ?? "")
    .map((s) => String(s).trim())
    .filter(Boolean);

  const productBits = [
    product?.name,
    product?.category,
    ...(product?.tags ?? []),
  ]
    .map((s) => (s ? String(s).trim() : ""))
    .filter(Boolean);

  // Templates لتوسيع الكلمات بدون حشو عشوائي
  const templates = [
    (x: string) => `${x} ${city}`,
    (x: string) => `${x} ${area}`,
    (x: string) => `${x} في ${city}`,
    (x: string) => `${x} في ${area}`,
    (x: string) => `${x} تفصيل`,
    (x: string) => `${x} جملة`,
    (x: string) => `${x} مفرق`,
    (x: string) => `${x} حسب الطلب`,
  ];

  const out = new Set<string>();
  const add = (v: string) => {
    const s = String(v || "").trim();
    if (!s) return;
    if (out.size < limit) out.add(s);
  };

  // 1) أساسيات
  base.forEach(add);

  // 2) كاتيغوري + قوالب محلية
  for (const c of catNames) {
    add(c);
    templates.forEach((t) => add(t(c)));
  }

  // 3) مواد/أنواع فساتين + دمج مع النوايا
  for (const d of dresses) {
    add(d);
    templates.forEach((t) => add(t(d)));
    for (const i of intents) {
      add(`${d} ${i}`);
      add(`${d} ${i} ${city}`);
      add(`${d} ${i} ${area}`);
      if (out.size >= limit) break;
    }
    if (out.size >= limit) break;
  }

  for (const m of materials) {
    add(`قماش ${m}`);
    add(`قماش ${m} ${city}`);
    add(`قماش ${m} ${area}`);
    add(`أقمشة ${m}`);
    add(`أقمشة ${m} ${city}`);
    if (out.size >= limit) break;
  }

  // 4) كلمات خاصة بالمنتج (لو موجود)
  for (const p of productBits) {
    add(p);
    templates.forEach((t) => add(t(p)));
  }

  // 5) أسئلة بحث (تساعد Snippets)
  const questions = [
    `أين يوجد محل فساتين سهرة في ${city}؟`,
    `هل يوجد تفصيل فساتين حسب الطلب في ${city}؟`,
    `أفضل محل فساتين في ${area} ${city}`,
    `أسعار فساتين سهرة في ${city}`,
  ];
  questions.forEach(add);

  return Array.from(out);
}
