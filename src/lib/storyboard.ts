export interface StoryboardSlide {
  order: number;
  path: string;
  label: string;
}

export interface StoryboardSlideWithUrl extends StoryboardSlide {
  url: string;
}

export const STORYBOARD_ISSUES = ["face", "background", "outfit"] as const;

export type StoryboardIssue = (typeof STORYBOARD_ISSUES)[number];

export interface StoryboardRevisionSelection {
  order: number;
  issues: StoryboardIssue[];
}

const STORYBOARD_ISSUE_LABELS: Record<StoryboardIssue, string> = {
  face: "Improve face",
  background: "Improve background",
  outfit: "Improve outfit",
};

export function getStoryboardIssueLabel(issue: StoryboardIssue) {
  return STORYBOARD_ISSUE_LABELS[issue];
}

export function isStoryboardIssue(value: string): value is StoryboardIssue {
  return STORYBOARD_ISSUES.includes(value as StoryboardIssue);
}

export function buildStoryboardRevisionSummary(
  selections: StoryboardRevisionSelection[],
) {
  const normalizedSelections = selections
    .map((selection) => ({
      order: selection.order,
      issues: Array.from(new Set(selection.issues)),
    }))
    .filter((selection) => selection.issues.length > 0)
    .sort((a, b) => a.order - b.order);

  if (normalizedSelections.length === 0) {
    return "";
  }

  return [
    "Requested storyboard changes:",
    "",
    ...normalizedSelections.flatMap((selection) => [
      `Shot ${selection.order}`,
      ...selection.issues.map((issue) => `- ${getStoryboardIssueLabel(issue)}`),
      "",
    ]),
  ]
    .join("\n")
    .trim();
}
