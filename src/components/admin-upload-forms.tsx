"use client";

import { useState, useTransition } from "react";
import { UploadIcon, AlertCircleIcon } from "lucide-react";

import { uploadStoryboardAction, uploadVideoAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignedUrlResponse {
  path?: string;
  token?: string;
  error?: string;
}

export function AdminUploadForms({ requestId }: { requestId: string }) {
  const supabase = createClient();
  const [storyboardPending, startStoryboard] = useTransition();
  const [videoPending, startVideo] = useTransition();
  const [storyboardError, setStoryboardError] = useState("");
  const [videoError, setVideoError] = useState("");

  const uploadWithSignedUrl = async (
    bucket: "storyboards" | "videos",
    requestIdParam: string,
    file: File,
  ) => {
    const response = await fetch("/api/uploads/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucket,
        filename: file.name,
        requestId: requestIdParam,
      }),
    });

    const payload = (await response.json()) as SignedUrlResponse;
    if (!response.ok || !payload.path || !payload.token) {
      throw new Error(payload.error ?? "Could not generate upload link.");
    }

    const { error } = await supabase.storage
      .from(bucket)
      .uploadToSignedUrl(payload.path, payload.token, file);
    if (error) {
      throw new Error(error.message);
    }

    return payload.path;
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UploadIcon className="size-4" /> Upload Storyboard
          </CardTitle>
          <CardDescription>Upload a PDF storyboard for client review.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setStoryboardError("");
              const input = event.currentTarget.elements.namedItem("pdf") as HTMLInputElement;
              const file = input.files?.[0];
              if (!file) {
                setStoryboardError("Please select a PDF.");
                return;
              }
              startStoryboard(async () => {
                try {
                  const storagePath = await uploadWithSignedUrl("storyboards", requestId, file);
                  const payload = new FormData();
                  payload.set("request_id", requestId);
                  payload.set("storage_path", storagePath);
                  await uploadStoryboardAction(payload);
                } catch (err) {
                  setStoryboardError(
                    err instanceof Error ? err.message : "Storyboard upload failed.",
                  );
                }
              });
            }}
            className="space-y-3"
          >
            <div className="space-y-2">
              <Label htmlFor="pdf">PDF File</Label>
              <Input id="pdf" type="file" name="pdf" accept="application/pdf" required />
            </div>
            <Button type="submit" disabled={storyboardPending} size="sm" className="w-full">
              {storyboardPending ? "Uploading..." : "Upload PDF"}
            </Button>
            {storyboardError ? (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertDescription>{storyboardError}</AlertDescription>
              </Alert>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UploadIcon className="size-4" /> Upload Video
          </CardTitle>
          <CardDescription>Upload the final produced video.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setVideoError("");
              const input = event.currentTarget.elements.namedItem("video") as HTMLInputElement;
              const file = input.files?.[0];
              if (!file) {
                setVideoError("Please select a video file.");
                return;
              }
              startVideo(async () => {
                try {
                  const storagePath = await uploadWithSignedUrl("videos", requestId, file);
                  const payload = new FormData();
                  payload.set("request_id", requestId);
                  payload.set("storage_path", storagePath);
                  await uploadVideoAction(payload);
                } catch (err) {
                  setVideoError(err instanceof Error ? err.message : "Video upload failed.");
                }
              });
            }}
            className="space-y-3"
          >
            <div className="space-y-2">
              <Label htmlFor="video">Video File</Label>
              <Input id="video" type="file" name="video" accept="video/*" required />
            </div>
            <Button type="submit" disabled={videoPending} size="sm" className="w-full">
              {videoPending ? "Uploading..." : "Upload Video"}
            </Button>
            {videoError ? (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertDescription>{videoError}</AlertDescription>
              </Alert>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
