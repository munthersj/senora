import Link from "next/link";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "gold";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variant === "gold"
          ? "bg-brandGold/20 text-brandGreen"
          : "bg-black/5 text-black/70"
      )}
    >
      {children}
    </span>
  );
}

export function PrimaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-brandGreen px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-95",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function SecondaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-black/80 transition hover:border-brandGreen/30 hover:text-brandGreen",
        className
      )}
    >
      {children}
    </Link>
  );
}
