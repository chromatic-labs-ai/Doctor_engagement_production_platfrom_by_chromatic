import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import {
  DOCTOR_REVIEW_FIELDS,
  hashDoctorReviewToken,
  isDoctorReviewExpired,
  normalizeDoctorReviewValue,
} from "@/lib/doctor-review";
import { submitDoctorReviewAction } from "@/lib/doctor-review-actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { DoctorReviewSessionRow } from "@/lib/types";

const selectClassName =
  "h-11 w-full rounded-sm border border-input bg-background px-3.5 text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30";

export const runtime = "nodejs";

function getStatusMessage(
  session: DoctorReviewSessionRow | null,
  submitted: boolean,
) {
  if (!session) {
    return "This doctor review link is invalid.";
  }

  if (submitted || session.status === "submitted" || session.status === "applied") {
    return "Thank you. This review has already been submitted.";
  }

  if (session.status === "revoked") {
    return "This review link has been revoked.";
  }

  if (isDoctorReviewExpired(session)) {
    return "This review link has expired.";
  }

  return "";
}

export default async function DoctorReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; submitted?: string }>;
}) {
  const { token } = await params;
  const resolvedSearchParams = await searchParams;
  const submitted = resolvedSearchParams.submitted === "1";

  const adminClient = createAdminClient();
  const { data: session } = await adminClient
    .from("doctor_review_sessions")
    .select("*")
    .eq("token_hash", hashDoctorReviewToken(token))
    .maybeSingle<DoctorReviewSessionRow>();

  const statusMessage = getStatusMessage(session, submitted);
  const baseValues = session?.base_form_data ?? {};

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-start px-4 py-6 md:px-6 md:py-10">
      <Card className="w-full">
        <CardHeader className="border-b">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Doctor Review
          </p>
          <CardTitle className="mt-2">Review Your Profile Details</CardTitle>
          <CardDescription>
            Please review the form prepared by our team and update anything that needs correction
            or adding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {resolvedSearchParams.error ? (
            <Alert variant="destructive">
              <AlertDescription>{resolvedSearchParams.error}</AlertDescription>
            </Alert>
          ) : null}

          {statusMessage ? (
            <Alert>
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          ) : null}

          {!statusMessage && session ? (
            <form action={submitDoctorReviewAction} className="space-y-6">
              <input type="hidden" name="token" value={token} />

              <div className="space-y-2">
                <Label htmlFor="doctor_name">Full Name *</Label>
                <Input
                  id="doctor_name"
                  name="doctor_name"
                  required
                  defaultValue={session.base_doctor_name}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
              {DOCTOR_REVIEW_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className={field.type === "textarea" ? "space-y-2 md:col-span-2" : "space-y-2"}
                >
                  <Label htmlFor={`field_${field.key}`}>
                    {field.label}
                    {field.required ? " *" : ""}
                  </Label>
                  {field.description ? (
                    <p className="text-sm leading-6 text-muted-foreground">{field.description}</p>
                  ) : null}

                  {field.type === "textarea" ? (
                    <Textarea
                      id={`field_${field.key}`}
                      name={`field_${field.key}`}
                      rows={4}
                      required={field.required}
                      defaultValue={normalizeDoctorReviewValue(baseValues[field.key])}
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={`field_${field.key}`}
                      name={`field_${field.key}`}
                      required={field.required}
                      defaultValue={normalizeDoctorReviewValue(baseValues[field.key])}
                      className={selectClassName}
                    >
                      <option value="">Select {field.label}</option>
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
                      type={
                        field.key === "young_photo_age" || field.key === "current_photo_age"
                          ? "number"
                          : "text"
                      }
                      required={field.required}
                      defaultValue={normalizeDoctorReviewValue(baseValues[field.key])}
                    />
                  )}
                </div>
              ))}
              </div>

              <div className="rounded-sm border bg-muted/30 p-4 text-sm text-muted-foreground">
                Photos and audio files stay managed by our team in this step. This review page is
                for form answers only.
              </div>

              <SubmitButton type="submit">Submit Review</SubmitButton>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
