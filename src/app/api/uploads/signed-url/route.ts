import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types";

function safeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
}

type BucketName = "request-assets" | "storyboards" | "videos";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,company_id")
    .eq("id", user.id)
    .single<{ role: UserRole; company_id: string | null }>();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 401 });
  }

  const body = (await request.json()) as {
    bucket?: BucketName;
    filename?: string;
    requestId?: string;
  };

  const bucket = body.bucket;
  const filename = body.filename ? safeFileName(body.filename) : "";
  const requestId = body.requestId ?? "";

  if (!bucket || !filename) {
    return NextResponse.json({ error: "bucket and filename are required" }, { status: 400 });
  }

  let storagePath = "";

  if (bucket === "request-assets") {
    if (profile.role !== "ops" || !profile.company_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    storagePath = `${profile.company_id}/${Date.now()}-${filename}`;
  } else if (bucket === "storyboards" || bucket === "videos") {
    if (profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!requestId) {
      return NextResponse.json({ error: "requestId is required" }, { status: 400 });
    }
    storagePath = `${requestId}/${Date.now()}-${filename}`;
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.storage
    .from(bucket)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create signed upload URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    path: storagePath,
    token: data.token,
  });
}
