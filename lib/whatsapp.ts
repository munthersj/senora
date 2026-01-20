export function toWhatsAppNumber(numberWithPlus: string): string {
  return numberWithPlus.replace(/\D/g, "");
}

export function makeWhatsAppLink(opts: {
  number: string; // with or without +
  text: string;
}): string {
  const num = toWhatsAppNumber(opts.number);
  const text = encodeURIComponent(opts.text);
  return `https://wa.me/${num}?text=${text}`;
}
