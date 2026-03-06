import { STATUS_LABELS } from "@/lib/constants";
import { RequestStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CLASSNAMES: Record<RequestStatus, string> = {
  form_submitted: "border-muted-foreground/30 bg-secondary text-secondary-foreground",
  storyboard_in_progress: "border-blue-200 bg-blue-50 text-blue-700",
  storyboard_review: "border-amber-200 bg-amber-50 text-amber-700",
  changes_requested: "border-orange-200 bg-orange-50 text-orange-700",
  storyboard_approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  video_in_progress: "border-violet-200 bg-violet-50 text-violet-700",
  video_delivered: "border-green-200 bg-green-50 text-green-700",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] font-medium", STATUS_CLASSNAMES[status])}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
