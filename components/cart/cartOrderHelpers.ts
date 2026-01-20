import type { CartItem } from "./CartContext";
import type { OrderPayload } from "@/lib/api/order";

function cleanPhoneNumber(input: string) {
  return (input || "").replace(/[^\d]/g, "");
}

export function buildOrderPayload(items: CartItem[]): OrderPayload {
  // backend بدو فقط product_id + count => نجمع نفس المنتج لو متكرر
  const map = new Map<string, number>();
  for (const it of items) {
    const id = String(it.productId);
    map.set(id, (map.get(id) ?? 0) + (Number(it.qty) || 0));
  }

  return {
    data: Array.from(map.entries())
      .filter(([, count]) => count > 0)
      .map(([product_id, count]) => ({ product_id, count })),
  };
}

export function parseUnavailableProductNames(productsField: string): string[] {
  // غالباً بيجي نص: "Name1, Name2" أو سطرين...
  return (productsField || "")
    .split(/[\n,|]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildCartWhatsAppUrl(opts: {
  items: CartItem[];
  subtotal: number;
  currencyLabel: string;
  count: number;
  whatsappNumber: string;
  wholesaleAt?: number;
}) {
  const phone = cleanPhoneNumber(opts.whatsappNumber);
  if (!phone) return null;

  const items = opts.items;
  const lines: string[] = [];
  lines.push("مرحباً 🌿");
  lines.push("أريد تأكيد طلب السلة التالية:");
  lines.push("");

  if (!items.length) {
    lines.push("السلة فارغة.");
  } else {
    items.forEach((it, i) => {
      lines.push(`${i + 1}) ${it.name}`);
      if (it.price) lines.push(`   - السعر: ${it.price}`);
      if (it.size) lines.push(`   - المقاس: ${it.size}`);
      if (it.color) lines.push(`   - اللون: ${it.color}`);
      lines.push(`   - الكمية: ${it.qty}`);
      if (it.note) lines.push(`   - ملاحظة: ${it.note}`);
      if (it.productUrl) lines.push(`   - رابط: ${it.productUrl}`);
      lines.push("");
    });

    lines.push(`عدد القطع: ${opts.count}`);
    if (opts.wholesaleAt && opts.wholesaleAt > 0 && opts.count >= opts.wholesaleAt) {
      lines.push(
        `ملاحظة: تم الوصول لحد الجملة (${opts.wholesaleAt}) — سيتم الاتفاق على سعر الجملة عند الطلب.`
      );
    }
    lines.push(`المجموع: ${opts.subtotal.toFixed(2)} ${opts.currencyLabel}`);
  }

  lines.push("");
  lines.push("شكراً 🙏");

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${phone}?text=${text}`;
}
