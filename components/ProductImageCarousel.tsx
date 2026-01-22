"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type ImageDTO = { id: number; url: string };

export default function ProductImageCarousel({
  images,
  alt,
  priority,
}: {
  images: ImageDTO[];
  alt: string;
  priority?: boolean;
}) {
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter((i) => i?.url) : []),
    [images],
  );

  const [index, setIndex] = useState(0);

  const hasImages = safeImages.length > 0;

  const prev = () => {
    if (!hasImages) return;
    setIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
  };

  const next = () => {
    if (!hasImages) return;
    setIndex((i) => (i + 1) % safeImages.length);
  };

  const current = hasImages ? safeImages[index] : null;

  return (
    <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-soft">
      <div className="relative aspect-[4/5]">
        {current ? (
          <Image
            key={current.id ?? current.url}
            src={current.url}
            alt={alt}
            fill
            className="object-cover"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/5 text-sm font-semibold text-black/50">
            لا توجد صور
          </div>
        )}

        {/* Arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg font-bold text-black/70 shadow hover:bg-white"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg font-bold text-black/70 shadow hover:bg-white"
            >
              ›
            </button>
          </>
        )}

        {/* Dots */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-white/70 px-3 py-2 backdrop-blur">
            {safeImages.map((img, i) => (
              <button
                key={img.id ?? img.url}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-2 w-2 rounded-full ${
                  i === index ? "bg-black/70" : "bg-black/25"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
