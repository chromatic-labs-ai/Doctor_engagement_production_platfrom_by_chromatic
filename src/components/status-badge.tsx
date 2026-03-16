import {
  ClipboardIcon,
  FilePenLineIcon,
  PenLineIcon,
  EyeIcon,
  RotateCcwIcon,
  CheckCircle2Icon,
  ClapperboardIcon,
  PackageCheckIcon,
} from "lucide-react";

import { STATUS_LABELS } from "@/lib/constants";
import { RequestStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  RequestStatus,
  { className: string; Icon: React.ElementType }
> = {
  draft: {
    className:
      "border-border bg-muted/70 text-foreground/80",
    Icon: FilePenLineIcon,
  },
  form_submitted: {
    className: "border-border bg-background text-muted-foreground",
    Icon: ClipboardIcon,
  },
  storyboard_in_progress: {
    className: "border-border bg-muted/80 text-foreground",
    Icon: PenLineIcon,
  },
  storyboard_review: {
    className: "border-warning/40 bg-warning/15 text-foreground",
    Icon: EyeIcon,
  },
  changes_requested: {
    className: "border-destructive/25 bg-destructive/10 text-destructive",
    Icon: RotateCcwIcon,
  },
  storyboard_approved: {
    className: "border-success/30 bg-success/12 text-foreground",
    Icon: CheckCircle2Icon,
  },
  video_in_progress: {
    className: "border-border bg-muted/60 text-foreground",
    Icon: ClapperboardIcon,
  },
  video_delivered: {
    className: "border-success/35 bg-success/15 text-foreground",
    Icon: PackageCheckIcon,
  },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const { className, Icon } = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em]", className)}
    >
      <Icon className="size-3 shrink-0" />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
