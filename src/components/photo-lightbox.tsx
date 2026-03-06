"use client";

import { useState } from "react";
import Image from "next/image";
import { XIcon } from "lucide-react";

interface Photo {
  url: string;
  label: string;
}

export function PhotoLightbox({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState<Photo | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo) => (
          <button
            key={photo.url}
            type="button"
            onClick={() => setActive(photo)}
            className="group flex flex-col gap-1.5 text-left"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
              <Image
                src={photo.url}
                alt={photo.label}
                fill
                sizes="(max-width: 768px) 50vw, 120px"
                className="object-cover transition-opacity group-hover:opacity-80"
              />
            </div>
            <span className="text-center text-xs text-muted-foreground w-full">
              {photo.label}
            </span>
          </button>
        ))}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <XIcon className="size-5" />
          </button>
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={active.url}
              alt={active.label}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />
            <p className="mt-2 text-center text-sm text-white/70">{active.label}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
