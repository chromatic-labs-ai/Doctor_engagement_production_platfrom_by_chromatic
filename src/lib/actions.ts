"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { REQUEST_STATUSES } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { JsonRecord, RequestStatus } from "@/lib/types";

function safeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unable to load user after login." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: "admin" | "ops" }>();

  if (!profile) {
    return { error: "Profile not found. Ask admin to provision your account." };
  }

  redirect(profile.role === "admin" ? "/admin/dashboard" : "/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createRequestAction(formData: FormData) {
  const doctorName = String(formData.get("doctor_name") ?? "").trim();
  if (!doctorName) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single<{ company_id: string | null }>();

  if (!profile?.company_id) {
    return;
  }

  const data: JsonRecord = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("field_")) {
      const fieldKey = key.replace("field_", "");
      data[fieldKey] = String(value);
    }
  }

  const rawAssetPaths = String(formData.get("asset_paths_json") ?? "").trim();
  if (rawAssetPaths) {
    try {
      const parsed = JSON.parse(rawAssetPaths);
      if (Array.isArray(parsed)) {
        data.asset_paths = parsed.filter((entry) => typeof entry === "string");
      }
    } catch (error) {
      console.error("Invalid asset_paths_json", error);
    }
  }

  const youngPhotoPath = String(formData.get("young_photo_path") ?? "").trim();
  if (youngPhotoPath) {
    data.young_photo_path = youngPhotoPath;
  }

  const currentPhotoPath = String(formData.get("current_photo_path") ?? "").trim();
  if (currentPhotoPath) {
    data.current_photo_path = currentPhotoPath;
  }

  const { error } = await supabase.from("requests").insert({
    doctor_name: doctorName,
    company_id: profile.company_id,
    created_by: user.id,
    status: "form_submitted",
    form_data: data,
  });

  if (error) {
    console.error(error.message);
    return;
  }

  redirect("/dashboard");
}

export async function addCommentAction(formData: FormData) {
  const requestId = String(formData.get("request_id") ?? "");
  const comment = String(formData.get("comment") ?? "").trim();
  if (!requestId || !comment) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: request } = await supabase
    .from("requests")
    .select("status")
    .eq("id", requestId)
    .maybeSingle<{ status: RequestStatus }>();

  const isCommentWindowOpen =
    request?.status === "storyboard_review" || request?.status === "changes_requested";

  if (!request || !isCommentWindowOpen) {
    return;
  }

  const { error } = await supabase.from("storyboard_comments").insert({
    request_id: requestId,
    user_id: user.id,
    comment,
  });

  if (error) {
    console.error(error.message);
    return;
  }

  revalidatePath(`/requests/${requestId}`);
  revalidatePath(`/admin/requests/${requestId}`);
}

export async function requestStoryboardRevisionAction(formData: FormData) {
  const requestId = String(formData.get("request_id") ?? "");
  if (!requestId) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: request } = await supabase
    .from("requests")
    .select("status,storyboard_revision_count,max_storyboard_revisions")
    .eq("id", requestId)
    .maybeSingle<{
      status: RequestStatus;
      storyboard_revision_count: number;
      max_storyboard_revisions: number;
    }>();

  if (!request || request.status !== "storyboard_review") {
    return;
  }

  const nextRevisionCount = request.storyboard_revision_count + 1;
  if (nextRevisionCount > request.max_storyboard_revisions) {
    return;
  }

  const { error } = await supabase
    .from("requests")
    .update({
      status: "changes_requested",
      storyboard_revision_count: nextRevisionCount,
    })
    .eq("id", requestId)
    .eq("status", "storyboard_review");

  if (error) {
    console.error(error.message);
    return;
  }

  revalidatePath(`/requests/${requestId}`);
  revalidatePath(`/admin/requests/${requestId}`);
}

export async function approveStoryboardAction(formData: FormData) {
  const requestId = String(formData.get("request_id") ?? "");
  if (!requestId) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("requests")
    .update({ status: "storyboard_approved" })
    .eq("id", requestId)
    .eq("status", "storyboard_review");

  if (error) {
    console.error(error.message);
    return;
  }

  revalidatePath(`/requests/${requestId}`);
  revalidatePath(`/admin/requests/${requestId}`);
}

export async function updateRequestStatusAction(formData: FormData) {
  const requestId = String(formData.get("request_id") ?? "");
  const status = String(formData.get("status") ?? "") as RequestStatus;

  if (!requestId || !REQUEST_STATUSES.includes(status)) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("requests")
    .update({ status })
    .eq("id", requestId);

  if (error) {
    console.error(error.message);
    return;
  }

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath(`/requests/${requestId}`);
}

export async function uploadStoryboardAction(formData: FormData) {
  const requestId = String(formData.get("request_id") ?? "");
  const providedPath = String(formData.get("storage_path") ?? "").trim();
  const file = formData.get("pdf");
  if (!requestId || (!providedPath && (!(file instanceof File) || file.size === 0))) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: latest } = await supabase
    .from("storyboards")
    .select("version")
    .eq("request_id", requestId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle<{ version: number }>();

  const nextVersion = (latest?.version ?? 0) + 1;
  let filePath = providedPath;
  if (!filePath) {
    if (!(file instanceof File)) {
      return;
    }
    filePath = `${requestId}/v${nextVersion}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("storyboards")
      .upload(filePath, Buffer.from(await file.arrayBuffer()), {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError.message);
      return;
    }
  }

  const { error: insertError } = await supabase.from("storyboards").insert({
    request_id: requestId,
    storage_path: filePath,
    version: nextVersion,
    uploaded_by: user.id,
  });

  if (insertError) {
    console.error(insertError.message);
    return;
  }

  await supabase
    .from("requests")
    .update({ status: "storyboard_review" })
    .eq("id", requestId);

  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath(`/requests/${requestId}`);
}

export async function uploadVideoAction(formData: FormData) {
  const requestId = String(formData.get("request_id") ?? "");
  const providedPath = String(formData.get("storage_path") ?? "").trim();
  const file = formData.get("video");
  if (!requestId || (!providedPath && (!(file instanceof File) || file.size === 0))) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  let filePath = providedPath;
  if (!filePath) {
    if (!(file instanceof File)) {
      return;
    }
    filePath = `${requestId}/${Date.now()}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(filePath, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type || "video/mp4",
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError.message);
      return;
    }
  }

  const { error: upsertError } = await supabase.from("videos").upsert(
    {
      request_id: requestId,
      storage_path: filePath,
      uploaded_by: user.id,
    },
    { onConflict: "request_id" },
  );

  if (upsertError) {
    console.error(upsertError.message);
    return;
  }

  await supabase
    .from("requests")
    .update({ status: "video_delivered" })
    .eq("id", requestId);

  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/admin/dashboard");
}

export async function createCompanyWithOpsAction(formData: FormData) {
  const companyName = String(formData.get("company_name") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!companyName || !fullName || !email || password.length < 8) {
    return;
  }

  const adminClient = createAdminClient();

  const { data: company, error: companyError } = await adminClient
    .from("companies")
    .insert({ name: companyName })
    .select("id")
    .single<{ id: string }>();

  if (companyError || !company) {
    console.error(companyError?.message ?? "Could not create company.");
    return;
  }

  const { data: createdUser, error: userError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (userError || !createdUser.user) {
    console.error(userError?.message ?? "Could not create auth user.");
    return;
  }

  const { error: profileError } = await adminClient.from("profiles").insert({
    id: createdUser.user.id,
    email,
    full_name: fullName,
    role: "ops",
    company_id: company.id,
  });

  if (profileError) {
    console.error(profileError.message);
    return;
  }

  revalidatePath("/admin/companies");
}
