"use client";

import { useMemo, useState } from "react";

import {
  approveStoryboardAction,
  requestStoryboardRevisionAction,
} from "@/lib/actions";
import {
  getStoryboardIssueLabel,
  STORYBOARD_ISSUES,
  StoryboardIssue,
  StoryboardSlideWithUrl,
} from "@/lib/storyboard";
import { StoryboardSlideGallery } from "@/components/storyboard-slide-gallery";
import { SubmitButton } from "@/components/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface StoryboardReviewPanelProps {
  requestId: string;
  slides: StoryboardSlideWithUrl[];
  canRequestRevision: boolean;
}

export function StoryboardReviewPanel({
  requestId,
  slides,
  canRequestRevision,
}: StoryboardReviewPanelProps) {
  const [selectedByOrder, setSelectedByOrder] = useState<Record<number, StoryboardIssue[]>>({});

  const hasSelections = useMemo(
    () => Object.values(selectedByOrder).some((issues) => issues.length > 0),
    [selectedByOrder],
  );

  const selectedShotCount = useMemo(
    () => Object.values(selectedByOrder).filter((issues) => issues.length > 0).length,
    [selectedByOrder],
  );

  const selectionsJson = useMemo(
    () =>
      JSON.stringify(
        slides
          .map((slide) => ({
            order: slide.order,
            issues: selectedByOrder[slide.order] ?? [],
          }))
          .filter((selection) => selection.issues.length > 0),
      ),
    [selectedByOrder, slides],
  );

  function toggleIssue(order: number, issue: StoryboardIssue) {
    setSelectedByOrder((current) => {
      const existing = current[order] ?? [];
      const nextIssues = existing.includes(issue)
        ? existing.filter((value) => value !== issue)
        : [...existing, issue];

      if (nextIssues.length === 0) {
        const nextState = { ...current };
        delete nextState[order];
        return nextState;
      }

      return {
        ...current,
        [order]: nextIssues,
      };
    });
  }

  return (
    <div className="space-y-4">
      <StoryboardSlideGallery
        slides={slides}
        renderFooter={(slide) => (
          <div className="space-y-2">
            <p className="text-sm font-medium">Requested changes</p>
            <div className="flex flex-wrap gap-2">
              {STORYBOARD_ISSUES.map((issue) => {
                const isSelected = (selectedByOrder[slide.order] ?? []).includes(issue);
                return (
                  <Button
                    key={issue}
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    aria-pressed={isSelected}
                    onClick={() => toggleIssue(slide.order, issue)}
                  >
                    {getStoryboardIssueLabel(issue)}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      />

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm font-medium">Finalise your review</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Select the improvements needed on each shot, then request one revision for the full
          storyboard.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {selectedShotCount > 0
            ? `${selectedShotCount} shot${selectedShotCount === 1 ? "" : "s"} marked for changes`
            : "No shot changes selected yet."}
        </p>
      </div>

      {!canRequestRevision ? (
        <Alert variant="destructive">
          <AlertDescription>
            Revision limit reached. You can only approve the storyboard at this stage.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <form action={requestStoryboardRevisionAction}>
          <input type="hidden" name="request_id" value={requestId} />
          <input type="hidden" name="selections_json" value={selectionsJson} />
          <SubmitButton
            type="submit"
            variant="secondary"
            size="sm"
            disabled={!canRequestRevision || !hasSelections}
            title={
              !hasSelections
                ? "Select at least one change before requesting a revision."
                : undefined
            }
          >
            Request Revision
          </SubmitButton>
        </form>
        <form action={approveStoryboardAction}>
          <input type="hidden" name="request_id" value={requestId} />
          <SubmitButton type="submit" size="sm">
            Approve Storyboard
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
