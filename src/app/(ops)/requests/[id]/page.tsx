import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, AlertTriangleIcon, FileTextIcon, VideoIcon } from "lucide-react";

import { REQUEST_FORM_FIELDS } from "@/config/request-form";
import { CommentThread } from "@/components/comment-thread";
import { PhotoLightbox } from "@/components/photo-lightbox";
import { PdfViewer } from "@/components/pdf-viewer";
import { StatusBadge } from "@/components/status-badge";
import { VideoPlayer } from "@/components/video-player";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  approveStoryboardAction,
  requestStoryboardRevisionAction,
} from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/server";
import {
  RequestRow,
  StoryboardCommentRow,
  StoryboardRow,
  VideoRow,
} from "@/lib/types";

const fieldLabelMap = new Map(REQUEST_FORM_FIELDS.map((f) => [f.key, f.label]));

function getFieldLabel(key: string) {
  return (
    fieldLabelMap.get(key) ??
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export default async function OpsRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .single<RequestRow>();

  if (!request) {
    notFound();
  }

  const { data: storyboards } = await supabase
    .from("storyboards")
    .select("*")
    .eq("request_id", id)
    .order("version", { ascending: false })
    .returns<StoryboardRow[]>();

  const latestStoryboard = storyboards?.[0] ?? null;
  const latestStoryboardUrl = latestStoryboard?.storage_path
    ? (
        await supabase.storage
          .from("storyboards")
          .createSignedUrl(latestStoryboard.storage_path, 60 * 60 * 24)
      ).data?.signedUrl ?? null
    : (latestStoryboard?.pdf_url ?? null);

  const { data: comments } = await supabase
    .from("storyboard_comments")
    .select("id,comment,created_at,user_id,profiles!inner(full_name,email)")
    .eq("request_id", id)
    .order("created_at", { ascending: true })
    .returns<
      (StoryboardCommentRow & {
        profiles: { full_name: string | null; email: string | null };
      })[]
    >();

  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("request_id", id)
    .maybeSingle<VideoRow>();
  const videoUrl = video?.storage_path
    ? (
        await supabase.storage
          .from("videos")
          .createSignedUrl(video.storage_path, 60 * 60 * 24)
      ).data?.signedUrl ?? null
    : (video?.video_url ?? null);

  const rawAssetPaths = request.form_data.asset_paths;
  const assetPaths = Array.isArray(rawAssetPaths) ? rawAssetPaths : [];
  const signedAssetUrls = new Map<string, string>();
  for (const path of assetPaths) {
    const { data } = await supabase.storage
      .from("request-assets")
      .createSignedUrl(path, 60 * 60 * 24);
    if (data?.signedUrl) {
      signedAssetUrls.set(path, data.signedUrl);
    }
  }

  const youngPhotoPath =
    typeof request.form_data.young_photo_path === "string"
      ? request.form_data.young_photo_path
      : "";
  const currentPhotoPath =
    typeof request.form_data.current_photo_path === "string"
      ? request.form_data.current_photo_path
      : "";
  const youngPhotoUrl = youngPhotoPath ? signedAssetUrls.get(youngPhotoPath) ?? null : null;
  const currentPhotoUrl = currentPhotoPath ? signedAssetUrls.get(currentPhotoPath) ?? null : null;

  const requestDetails = Object.entries(request.form_data).filter(
    ([key]) =>
      key !== "asset_paths" && key !== "young_photo_path" && key !== "current_photo_path",
  );

  const canComment =
    request.status === "storyboard_review" || request.status === "changes_requested";
  const canRequestRevision =
    request.status === "storyboard_review" &&
    request.storyboard_revision_count < request.max_storyboard_revisions;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="h-8 w-8">
            <Link href="/dashboard">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <h1 className="text-xl font-semibold tracking-tight">
              {request.doctor_name}
            </h1>
            <StatusBadge status={request.status} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Request ID: <span className="font-mono">{request.id.slice(0, 8)}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Video Section */}
          {videoUrl ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <VideoIcon className="size-4" /> Final Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VideoPlayer url={videoUrl} />
              </CardContent>
            </Card>
          ) : null}

          {/* Storyboard Section */}
          {latestStoryboard && latestStoryboardUrl ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  Storyboard (v{latestStoryboard.version})
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {new Date(latestStoryboard.created_at).toLocaleDateString()}
                </span>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <PdfViewer url={latestStoryboardUrl} />
                <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
                  <span>Revisions used</span>
                  <span className="font-medium text-foreground">
                    {request.storyboard_revision_count} / {request.max_storyboard_revisions}
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            !videoUrl && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <FileTextIcon className="size-6 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-sm font-medium">No storyboard yet</p>
                  <p className="text-xs text-muted-foreground">
                    Production team is working on your request.
                  </p>
                </CardContent>
              </Card>
            )
          )}

          {/* Comments + Review Actions */}
          <CommentThread
            requestId={request.id}
            comments={comments ?? []}
            canComment={canComment}
            actions={
              request.status === "storyboard_review" ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Finalise your review</p>
                    <p className="text-xs text-muted-foreground">
                      Approve the storyboard to proceed, or leave a comment explaining what needs to change and then request a revision.
                    </p>
                  </div>
                  {!canRequestRevision ? (
                    <Alert variant="destructive">
                      <AlertTriangleIcon className="size-4" />
                      <AlertDescription>
                        Revision limit reached. You can only approve at this stage.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                  <div className="flex gap-2">
                    {canRequestRevision ? (
                      <form action={requestStoryboardRevisionAction}>
                        <input type="hidden" name="request_id" value={request.id} />
                        <SubmitButton
                          type="submit"
                          variant="secondary"
                          size="sm"
                          disabled={(comments ?? []).length === 0}
                          title={
                            (comments ?? []).length === 0
                              ? "Please add a comment explaining what needs to change before requesting a revision."
                              : undefined
                          }
                        >
                          Request Revision
                        </SubmitButton>
                      </form>
                    ) : null}
                    <form action={approveStoryboardAction}>
                      <input type="hidden" name="request_id" value={request.id} />
                      <SubmitButton type="submit" size="sm">
                        Approve Storyboard
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              ) : null
            }
          />
        </div>

        <div className="flex flex-col gap-6">
          {/* Request Details Sidebar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="grid gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Submitted
                </span>
                <span>{new Date(request.created_at).toLocaleString()}</span>
              </div>
              <Separator />
              {requestDetails.map(([key, value]) => (
                <div key={key} className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {getFieldLabel(key)}
                  </span>
                  <span className="whitespace-pre-wrap wrap-break-word">
                    {Array.isArray(value)
                      ? value.join(", ") || "-"
                      : String(value).trim() || "-"}
                  </span>
                </div>
              ))}
              {youngPhotoUrl || currentPhotoUrl ? (
                <>
                  <Separator />
                  <div className="grid gap-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      Reference Photos
                    </span>
                    <PhotoLightbox
                      photos={[
                        ...(youngPhotoUrl
                          ? [{ url: youngPhotoUrl, label: "Younger Photo" }]
                          : []),
                        ...(currentPhotoUrl
                          ? [{ url: currentPhotoUrl, label: "Current Photo" }]
                          : []),
                      ]}
                    />
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
