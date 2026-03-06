import { ReactNode } from "react";

import { StoryboardSlideWithUrl } from "@/lib/storyboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StoryboardSlideGalleryProps {
  slides: StoryboardSlideWithUrl[];
  renderFooter?: (slide: StoryboardSlideWithUrl) => ReactNode;
}

export function StoryboardSlideGallery({
  slides,
  renderFooter,
}: StoryboardSlideGalleryProps) {
  return (
    <div className="space-y-4">
      {slides.map((slide) => (
        <Card key={slide.path} className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{slide.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-lg border bg-muted/20">
              {/* Slide images are generated assets with unknown aspect ratios. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.url}
                alt={slide.label}
                className="h-auto w-full"
                loading="lazy"
              />
            </div>
            {renderFooter ? renderFooter(slide) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
