import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3">
      {/* شعار داخل حلقة ذهبية/خضراء */}
      <div className="logo-shine relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brandGold/80 via-white to-brandGreen/35 p-[2px] shadow-soft transition duration-300 group-hover:scale-[1.03] md:h-14 md:w-14 md:rounded-[22px]">
        <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-white md:rounded-[18px]">
          <Image
            src="/logo.png"
            alt="شعار سنورا"
            fill
            sizes="(max-width: 768px) 48px, 56px"
            className="object-contain p-2"
            priority
          />
        </div>
        <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[24px] bg-brandGold/25 blur-2xl" />
      </div>

      <div className="leading-tight">
        <div className="text-base font-extrabold tracking-tight text-brandGreen md:text-lg">
          سينيورة
        </div>
        <div className="text-xs font-semibold text-black/55 md:text-sm">
          بوتيك
        </div>
      </div>
    </Link>
  );
}
