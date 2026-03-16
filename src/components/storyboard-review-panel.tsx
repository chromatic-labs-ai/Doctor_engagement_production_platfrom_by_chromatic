"use client";

import { useEffect, useMemo, useState } from "react";

import { StoryboardSlideWithUrl } from "@/lib/storyboard";
import { useReviewState } from "@/components/review-context";
import { StoryboardSlideGallery } from "@/components/storyboard-slide-gallery";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface StoryboardReviewPanelProps {
  slides: StoryboardSlideWithUrl[];
}

export function StoryboardReviewPanel({
  slides,
}: StoryboardReviewPanelProps) {
  const [commentsByOrder, setCommentsByOrder] = useState<Record<number, string>>({});
  const review = useReviewState();
  const updateReview = review?.update;

  const hasSelections = useMemo(
    () => Object.values(commentsByOrder).some((comment) => comment.trim().length > 0),
    [commentsByOrder],
  );

  const selectedShotCount = useMemo(
    () => Object.values(commentsByOrder).filter((comment) => comment.trim().length > 0).length,
    [commentsByOrder],
  );

  const selectionsJson = useMemo(
    () =>
      JSON.stringify(
        slides
          .map((slide) => ({
            order: slide.order,
            comment: commentsByOrder[slide.order]?.trim() ?? "",
          }))
          .filter((selection) => selection.comment.length > 0),
      ),
    [commentsByOrder, slides],
  );

  useEffect(() => {
    updateReview?.({ selectionsJson, hasSelections });
  }, [selectionsJson, hasSelections, updateReview]);

  function clearComment(order: number) {
    setCommentsByOrder((current) => {
      const next = { ...current };
      delete next[order];
      return next;
    });
  }

  function updateComment(order: number, comment: string) {
    setCommentsByOrder((current) => ({
      ...current,
      [order]: comment,
    }));
  }

  return (
    <div className="space-y-4">
      <StoryboardSlideGallery
        slides={slides}
        renderFooter={(slide) => {
          const comment = commentsByOrder[slide.order] ?? "";
          const hasRevisions = comment.trim().length > 0;

          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Feedback for this shot</p>
                {hasRevisions ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-auto px-0 text-xs"
                    onClick={() => clearComment(slide.order)}
                  >
                    Clear
                  </Button>
                ) : null}
              </div>
              <Textarea
                value={comment}
                onChange={(event) => updateComment(slide.order, event.target.value)}
                rows={3}
                placeholder="Add the exact change needed for this shot. Leave blank if this shot is approved."
              />
              <p className="text-xs text-muted-foreground">
                {hasRevisions
                  ? "This shot will be included in the revision request."
                  : "Leave this blank if the shot looks good."}
              </p>
            </div>
          );
        }}
      />

      {selectedShotCount > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedShotCount} shot{selectedShotCount === 1 ? "" : "s"} with feedback
        </p>
      )}
    </div>
  );
}
