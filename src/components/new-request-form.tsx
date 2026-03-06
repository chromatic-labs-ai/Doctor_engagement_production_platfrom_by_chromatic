"use client";

import { useRef, useState } from "react";

import { REQUEST_FORM_FIELDS } from "@/config/request-form";
import { createRequestAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircleIcon } from "lucide-react";

function safeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
}

async function uploadReferenceAsset(file: File, prefix: string) {
  const response = await fetch("/api/uploads/signed-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket: "request-assets",
      filename: `${prefix}-${safeFileName(file.name)}`,
    }),
  });

  const payload = (await response.json()) as {
    path?: string;
    token?: string;
    error?: string;
  };

  if (!response.ok || !payload.path || !payload.token) {
    throw new Error(payload.error ?? "Failed to prepare asset upload.");
  }

  const supabase = createClient();
  const { error } = await supabase.storage
    .from("request-assets")
    .uploadToSignedUrl(payload.path, payload.token, file);

  if (error) {
    throw new Error(error.message);
  }

  return payload.path;
}

export function NewRequestForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const activeFields = REQUEST_FORM_FIELDS.filter((field) => field.active !== false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const youngPhoto = formData.get("young_photo");
    const currentPhoto = formData.get("current_photo");

    if (!(youngPhoto instanceof File) || youngPhoto.size === 0) {
      setError("Please upload a younger photo.");
      setIsSubmitting(false);
      return;
    }

    if (!(currentPhoto instanceof File) || currentPhoto.size === 0) {
      setError("Please upload a current photo.");
      setIsSubmitting(false);
      return;
    }

    try {
      const youngPhotoPath = await uploadReferenceAsset(youngPhoto, "young-photo");
      const currentPhotoPath = await uploadReferenceAsset(currentPhoto, "current-photo");

      formData.delete("young_photo");
      formData.delete("current_photo");
      formData.set("asset_paths_json", JSON.stringify([youngPhotoPath, currentPhotoPath]));
      formData.set("young_photo_path", youngPhotoPath);
      formData.set("current_photo_path", currentPhotoPath);

      await createRequestAction(formData);
      setIsSubmitting(false);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload reference assets.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="doctor_name">Full Name *</Label>
        <p className="text-xs text-muted-foreground">
          Include your prefix — Dr., Prof., etc.
        </p>
        <Input
          id="doctor_name"
          name="doctor_name"
          required
          placeholder="Dr. Jane Doe"
        />
      </div>

      {activeFields.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={`field_${field.key}`}>
            {field.label}
            {field.required ? " *" : ""}
          </Label>
          {field.description ? (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          ) : null}
          {field.type === "textarea" ? (
            <Textarea
              id={`field_${field.key}`}
              name={`field_${field.key}`}
              rows={4}
              required={field.required}
              placeholder={field.placeholder}
            />
          ) : field.type === "select" ? (
            <select
              id={`field_${field.key}`}
              name={`field_${field.key}`}
              required={field.required}
              defaultValue=""
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="" disabled>
                Select {field.label}
              </option>
              {(field.options ?? []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id={`field_${field.key}`}
              name={`field_${field.key}`}
              required={field.required}
              placeholder={field.placeholder}
            />
          )}
        </div>
      ))}

      <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
        <div className="space-y-2">
          <Label className="text-base">Reference Photos *</Label>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>1. Please share a full photo or a clear face photo.</p>
            <p>2. We need two photos: one younger photo and one current or recent photo.</p>
            <p>3. Please avoid family or group photos. Cropped photos focused only on the person are completely fine.</p>
            <p>These photos may also be used later to create a digital sketch reference.</p>
          </div>
          <div className="mt-3">
            <img
              src="/reference-photo-sketch.png"
              alt="Photo guide sketch: Good — individual portrait or cropped face. Avoid — family or group photos."
              className="w-full max-w-md rounded-lg border object-contain"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="field_young_photo_age">Age in Younger Photo *</Label>
            <Input
              id="field_young_photo_age"
              name="field_young_photo_age"
              type="number"
              min="1"
              required
              placeholder="25"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="young_photo">Younger Photo *</Label>
            <Input id="young_photo" name="young_photo" type="file" accept="image/*" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="field_current_photo_age">Current Age in Recent Photo *</Label>
            <Input
              id="field_current_photo_age"
              name="field_current_photo_age"
              type="number"
              min="1"
              required
              placeholder="52"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_photo">Current / Recent Photo *</Label>
            <Input
              id="current_photo"
              name="current_photo"
              type="file"
              accept="image/*"
              required
            />
          </div>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
        {isSubmitting ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
}
